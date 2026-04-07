const normalizeSource = (value) => String(value || '').trim().toLowerCase()

export function EventSourceBadge(props) {
  const source = normalizeSource(props?.draft?.source || props?.published?.source)
  const isMsr = source === 'msr'

  return {
    label: isMsr ? 'Source: MSR' : 'Source: Manual',
    title: isMsr
      ? 'This event was imported from MotorsportReg.'
      : 'This event was created manually in the Studio.',
    color: isMsr ? 'primary' : 'success',
  }
}
