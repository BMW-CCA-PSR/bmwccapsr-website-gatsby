import { Avatar, Button, Card, Flex, Grid, Stack, Text, TextInput } from "@sanity/ui"
import React, { useCallback, useState } from "react"
import { set, unset } from "sanity"

export function colorHexValidator(value) {
  const data = typeof value === "string" ? value : value?.value
  if (data && !data.match(/^#[a-fA-f0-9]{6}$/)) {
    return "Color must be a valid hex (e.g. #A4F23B)"
  }
  return true
}

const ColorCircle = ({
  colorName,
  hex,
  active,
  withColorName,
  onClickHandler
}) => {
  return (
    <Card paddingRight={2} paddingBottom={4}>
      <div
        style={{
          padding: "4px",
          borderRadius: "50%",
          border: active
            ? "1px solid var(--card-fg-color)"
            : "1px solid transparent",
          cursor: "pointer"
        }}
        onClick={() => onClickHandler(hex)}
      >
        <Avatar
          size={1}
          style={{
            backgroundColor: hex,
            border: "1px solid var(--card-hairline-soft-color)"
          }}
        />
      </div>
      {withColorName && (
        <Text size={1} align={"center"} style={{ marginTop: ".5em" }}>
          {colorName}
        </Text>
      )}
    </Card>
  )
}

const ColorSelector = ({
  value = "",
  onChange,
  list,
  withHexInput,
  withColorNames,
  withSectionGuide,
  guideLabel,
  dynamicPalette,
  dynamicPaletteSteps = 8,
  resetPrimaryColor,
  resetSecondaryColor
}) => {
  const isValidHex = str => /^#[a-fA-F0-9]{6}$/.test(String(str || ""))

  const normalizedValue =
    typeof value === "string" ? value : value?.value || ""
  const normalizedValueKey = String(normalizedValue || "").trim().toLowerCase()
  const defaultBaseColor = isValidHex(normalizedValue)
    ? normalizedValue
    : "#1E94FF"
  const [paletteBaseColor, setPaletteBaseColor] = useState(defaultBaseColor)
  // Removes non-hex chars from the string, trims to 6 chars,
  // adds a # at the beginning and upper cases it
  const preprocessValue = str => {
    const validHexChars = /[0-9a-fA-F]/g
    const hexChars = str.match(validHexChars)?.join("") || ""

    const hasHashSymbol = hexChars.startsWith("#")

    return (
      (hasHashSymbol ? "" : "#") +
      hexChars
        .replace(/^#/, "")
        .substring(0, 6)
        .toUpperCase()
    )
  }

  const handleChange = useCallback(
    event =>
      {
        const nextValue = preprocessValue(event.currentTarget.value || "")
        setPaletteBaseColor(nextValue || "#1E94FF")
        onChange(event.currentTarget.value ? set(nextValue) : unset())
      },
    [onChange]
  )

  const handleSelect = useCallback(
    hex =>
      onChange(hex ? set(preprocessValue(hex)) : unset()),
    [onChange]
  )

  const handleNativeColorPick = useCallback(
    event => {
      const picked = event?.currentTarget?.value || ""
      const nextValue = preprocessValue(picked)
      setPaletteBaseColor(nextValue || "#1E94FF")
      onChange(picked ? set(nextValue) : unset())
    },
    [onChange]
  )

  const handleResetToPrimary = useCallback(() => {
    if (!resetPrimaryColor) return
    const nextValue = preprocessValue(resetPrimaryColor)
    setPaletteBaseColor(nextValue)
    onChange(set(nextValue))
  }, [onChange, resetPrimaryColor])

  const handleResetToSecondary = useCallback(() => {
    if (!resetSecondaryColor) return
    const nextValue = preprocessValue(resetSecondaryColor)
    setPaletteBaseColor(nextValue)
    onChange(set(nextValue))
  }, [onChange, resetSecondaryColor])

  const hexToRgb = hex => {
    const cleaned = String(hex || "").replace("#", "")
    if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return null
    const intVal = parseInt(cleaned, 16)
    return {
      r: (intVal >> 16) & 255,
      g: (intVal >> 8) & 255,
      b: intVal & 255
    }
  }

  const rgbToHex = ({ r, g, b }) =>
    `#${[r, g, b]
      .map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()}`

  const rgbToHsl = ({ r, g, b }) => {
    const rn = r / 255
    const gn = g / 255
    const bn = b / 255
    const max = Math.max(rn, gn, bn)
    const min = Math.min(rn, gn, bn)
    const d = max - min
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (d !== 0) {
      s = d / (1 - Math.abs(2 * l - 1))
      switch (max) {
        case rn:
          h = ((gn - bn) / d) % 6
          break
        case gn:
          h = (bn - rn) / d + 2
          break
        default:
          h = (rn - gn) / d + 4
      }
      h *= 60
      if (h < 0) h += 360
    }
    return { h, s, l }
  }

  const hslToRgb = ({ h, s, l }) => {
    const c = (1 - Math.abs(2 * l - 1)) * s
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
    const m = l - c / 2
    let rn = 0
    let gn = 0
    let bn = 0
    if (h >= 0 && h < 60) {
      rn = c
      gn = x
    } else if (h < 120) {
      rn = x
      gn = c
    } else if (h < 180) {
      gn = c
      bn = x
    } else if (h < 240) {
      gn = x
      bn = c
    } else if (h < 300) {
      rn = x
      bn = c
    } else {
      rn = c
      bn = x
    }
    return {
      r: (rn + m) * 255,
      g: (gn + m) * 255,
      b: (bn + m) * 255
    }
  }

  const buildDynamicPalette = (baseHex, steps) => {
    const rgb = hexToRgb(baseHex)
    if (!rgb) return []
    const { h, s, l } = rgbToHsl(rgb)
    const count = Math.max(2, steps)
    const values = []
    for (let i = 0; i < count; i += 1) {
      if (i === count - 1) {
        values.push("#000000")
        continue
      }
      if (i === 0) {
        values.push(baseHex.toUpperCase())
        continue
      }
      const t = i / (count - 1)
      const nextL = Math.max(0, l * (1 - t))
      values.push(
        rgbToHex(
          hslToRgb({
            h,
            s: Math.max(0.25, s),
            l: nextL,
          })
        )
      )
    }
    // Keep unique values and ensure exact selected/base color appears in palette.
    const seen = new Set()
    const unique = []
    values.forEach(v => {
      const key = v.toLowerCase()
      if (seen.has(key)) return
      seen.add(key)
      unique.push(v)
    })
    if (!seen.has(baseHex.toLowerCase())) {
      unique.splice(Math.floor(unique.length / 2), 0, baseHex.toUpperCase())
    }
    return unique
  }

  const paletteList = dynamicPalette
    ? buildDynamicPalette(paletteBaseColor, dynamicPaletteSteps).map(color => ({
        title: color,
        value: color
      }))
    : list

  const content = (
    <Stack space={3}>
      {guideLabel && (
        <Text size={1} muted>
          {guideLabel}
        </Text>
      )}
      {withHexInput && (
        <>
          <Text size={1}>Selected color</Text>
          <Grid
            columns={2}
            gap={1}
            style={{
              gridTemplateColumns: "auto 1fr"
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "999px",
                overflow: "hidden",
                border: "1px solid var(--card-hairline-soft-color)",
                position: "relative"
              }}
            >
              <Avatar
                size={2}
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: normalizedValue || "#1E94FF",
                  border: 0
                }}
              />
              <input
                type="color"
                aria-label="Pick selected color"
                value={paletteBaseColor}
                onChange={handleNativeColorPick}
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: 0,
                  cursor: "pointer"
                }}
              />
            </div>
            <TextInput
              style={{ flexGrow: 1 }}
              fontSize={1}
              padding={3}
              placeholder={"#FFFFFF"}
              onChange={handleChange}
              value={normalizedValue}
            />
          </Grid>
          {(resetPrimaryColor || resetSecondaryColor) && (
            <Flex gap={2} wrap="wrap" style={{ marginTop: "8px" }}>
              {resetPrimaryColor && (
                <Button
                  mode="bleed"
                  text="Reset to Primary"
                  onClick={handleResetToPrimary}
                />
              )}
              {resetSecondaryColor && (
                <Button
                  mode="bleed"
                  text="Reset to Secondary"
                  onClick={handleResetToSecondary}
                />
              )}
            </Flex>
          )}
        </>
      )}
      {paletteList && (
        <Card
          borderTop={withHexInput}
          paddingTop={withHexInput ? 3 : 0}
          style={{
            transform: "translateX(-4px)"
          }}
        >
          {withHexInput && (
            <Text size={1} style={{ marginBottom: ".5em" }}>
              or select color below
            </Text>
          )}
          <Flex direction={"row"} wrap={"wrap"}>
            {paletteList.map(colorItem => {
              return (
                <ColorCircle
                  key={colorItem.value}
                  colorName={colorItem.title}
                  hex={colorItem.value}
                  active={
                    String(colorItem.value || "").trim().toLowerCase() ===
                    normalizedValueKey
                  }
                  withColorName={!!withColorNames}
                  onClickHandler={handleSelect}
                />
              )
            })}
          </Flex>
        </Card>
      )}
    </Stack>
  )

  if (!withSectionGuide) return content

  return (
    <div
      style={{
        marginTop: "2px",
        marginLeft: "2px",
        paddingLeft: "12px",
        borderLeft: "3px solid var(--card-hairline-soft-color)"
      }}
    >
      {content}
    </div>
  )
}

export default ColorSelector
