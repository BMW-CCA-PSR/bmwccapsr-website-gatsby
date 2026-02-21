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

const buildSlugSource = ({ roleName, eventName, dateToken, legacyTitle }) => {
  const parts = [roleName, eventName, dateToken].filter(Boolean)
  if (parts.length > 0) return parts.join(' ')
  return legacyTitle || ''
}

const AutoSlugInput = (props) => {
  const { value, onChange, renderDefault } = props
  const client = useClient({ apiVersion: '2024-06-01' })
  const roleRef = useFormValue(['role'])
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
    const dateToken = toDateToken(selectedDate || eventStart)
    const source = buildSlugSource({
      roleName,
      eventName,
      dateToken,
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
  }, [roleName, eventName, eventStart, selectedDate, legacyTitle, value?.current, onChange])

  return renderDefault(props)
}

export default AutoSlugInput
