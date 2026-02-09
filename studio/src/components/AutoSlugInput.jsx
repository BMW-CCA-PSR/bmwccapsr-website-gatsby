import React, { useEffect, useRef } from 'react'
import { set, useFormValue } from 'sanity'

const slugify = (value) => {
  const base = String(value || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
  const trimmed = base.replace(/^\/+/, '').replace(/^volunteer\//, '');
  if (!trimmed) return '';
  return `/volunteer/${trimmed}`;
};

const AutoSlugInput = (props) => {
  const { value, onChange, renderDefault } = props
  const title = useFormValue(['title'])
  const lastAuto = useRef(null)

  useEffect(() => {
    if (!title) return
    const next = slugify(title)
    if (!next) return
    const current = value?.current || ''
    const wasAuto = lastAuto.current && current === lastAuto.current
    if (!current || wasAuto) {
      if (current === next) return
      lastAuto.current = next
      onChange(set({ _type: 'slug', current: next }))
    }
  }, [title, value?.current, onChange])

  return renderDefault(props)
}

export default AutoSlugInput
