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
  const previousRoleRefId = React.useRef(roleRefId)

  useEffect(() => {
    const didRoleChange = previousRoleRefId.current !== roleRefId
    previousRoleRefId.current = roleRefId

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
          if (didRoleChange && value) onChange(unset())
          return
        }
        // Auto-populate when the role changes or when value is empty.
        // If an editor manually overrides after auto-fill, we preserve that override.
        if ((didRoleChange || !value) && value !== derived) onChange(set(derived))
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
    description: roleRefId
      ? 'Auto-populated from role point value. You can override it if needed.'
      : 'Select a role to auto-populate this field (editable after fill).'
  })
}

export default AutoSkillLevelInput
