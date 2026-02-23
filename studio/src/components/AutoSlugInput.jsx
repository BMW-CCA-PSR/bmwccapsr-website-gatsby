import React, { useEffect, useRef, useState } from 'react'
import { set, useClient, useFormValue } from 'sanity'

const slugify = (value) => {
  const base = String(value || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
  const trimmed = base.replace(/^\/+/, '').replace(/^volunteer\//, '')
  if (!trimmed) return ''
  return `/volunteer/${trimmed}`
}

const toDateToken = (value) => {
  const raw = String(value || '').trim()
  if (!raw) return ''
  const dayPart = raw.split('T')[0]
  return dayPart
}

const getTodayDateToken = () => {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

const buildSlugSource = ({
  roleName,
  eventId,
  eventName,
  eventDateToken,
  fallbackDateToken,
  legacyTitle
}) => {
  const hasEvent = Boolean(eventId || eventName)
  if (hasEvent) {
    const eventParts = [roleName, eventName, eventDateToken || fallbackDateToken].filter(Boolean)
    if (eventParts.length > 0) return eventParts.join(' ')
  }
  const noEventParts = [roleName, fallbackDateToken].filter(Boolean)
  if (noEventParts.length > 0) return noEventParts.join(' ')
  return legacyTitle || ''
}

const AutoSlugInput = (props) => {
  const { value, onChange, renderDefault } = props
  const client = useClient({ apiVersion: '2024-06-01' })
  const roleRef = useFormValue(['role'])
  const eventId = useFormValue(['motorsportRegEvent', 'eventId'])
  const eventName = useFormValue(['motorsportRegEvent', 'name'])
  const eventStart = useFormValue(['motorsportRegEvent', 'start'])
  const selectedDate = useFormValue(['date'])
  const legacyTitle = useFormValue(['title'])
  const [roleName, setRoleName] = useState('')
  const lastAuto = useRef(null)

  useEffect(() => {
    const ref = roleRef?._ref
    if (!ref) {
      setRoleName('')
      return
    }
    let isMounted = true
    const baseId = ref.startsWith('drafts.') ? ref.replace(/^drafts\./, '') : ref
    const ids = [baseId, `drafts.${baseId}`]
    client
      .fetch(
        '*[_type == "volunteerFixedRole" && _id in $ids][0]{name}',
        { ids }
      )
      .then((data) => {
        if (!isMounted) return
        setRoleName(data?.name || '')
      })
      .catch(() => {
        if (!isMounted) return
        setRoleName('')
      })
    return () => {
      isMounted = false
    }
  }, [client, roleRef?._ref])

  useEffect(() => {
    const fallbackDateToken = getTodayDateToken()
    const eventDateToken = toDateToken(eventStart || selectedDate)
    const source = buildSlugSource({
      roleName,
      eventId,
      eventName,
      eventDateToken,
      fallbackDateToken,
      legacyTitle
    })
    if (!source) return
    const next = slugify(source)
    if (!next) return
    const current = value?.current || ''
    const wasAuto = lastAuto.current && current === lastAuto.current
    if (!current || wasAuto) {
      if (current === next) return
      lastAuto.current = next
      onChange(set({ _type: 'slug', current: next }))
    }
  }, [roleName, eventId, eventName, eventStart, selectedDate, legacyTitle, value?.current, onChange])

  return renderDefault(props)
}

export default AutoSlugInput
