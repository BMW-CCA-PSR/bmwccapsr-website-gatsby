import React, { useEffect } from 'react'
import { set, unset, useClient, useFormValue } from 'sanity'

const mapPointValueToSkillLevel = (pointValue) => {
  const normalized = Number(pointValue)
  if (normalized === 1 || normalized === 2) return 'entry'
  if (normalized === 3 || normalized === 4) return 'medium'
  if (normalized === 5 || normalized === 10) return 'high'
  return null
}

const AutoSkillLevelInput = (props) => {
  const { value, onChange, renderDefault } = props
  const client = useClient({ apiVersion: '2024-06-01' })
  const roleRef = useFormValue(['role'])
  const roleRefId = roleRef?._ref

  useEffect(() => {
    if (!roleRefId) {
      if (value) onChange(unset())
      return
    }

    let isMounted = true
    const baseId = roleRefId.startsWith('drafts.')
      ? roleRefId.replace(/^drafts\./, '')
      : roleRefId
    const ids = [baseId, `drafts.${baseId}`]

    client
      .fetch('*[_type == "volunteerFixedRole" && _id in $ids][0]{pointValue}', {
        ids
      })
      .then((data) => {
        if (!isMounted) return
        const derived = mapPointValueToSkillLevel(data?.pointValue)
        if (!derived) {
          if (value) onChange(unset())
          return
        }
        if (value !== derived) onChange(set(derived))
      })
      .catch(() => {
        if (!isMounted) return
      })

    return () => {
      isMounted = false
    }
  }, [client, roleRefId, value, onChange])

  return renderDefault({
    ...props,
    readOnly: true,
    description: roleRefId
      ? 'Auto-populated from the selected role point value.'
      : 'Select a role to auto-populate this field.'
  })
}

export default AutoSkillLevelInput
