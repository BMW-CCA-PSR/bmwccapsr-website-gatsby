import { Avatar, Card, Flex, Grid, Stack, Text, TextInput } from "@sanity/ui"
import React, { useCallback } from "react"
import { set, unset } from "sanity"

export function colorHexValidator(value) {
  let data = value.value ? value.value : value;
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
          backgroundColor: active ? hex : "transparent",
          border: active
            ? "1px solid var(--card-hairline-soft-color)"
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
  withColorNames
}) => {
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
      onChange(
        event.currentTarget.value
          ? set(preprocessValue(event.currentTarget.value))
          : unset()
      ),
    [onChange]
  )

  const handleSelect = useCallback(
    hex => onChange(hex && hex !== value ? set(preprocessValue(hex)) : unset()),
    [onChange, value]
  )

  return (
    <Stack space={3}>
      {withHexInput && (
        <>
          <Text size={1}>Enter hex</Text>
          <Grid
            columns={2}
            gap={1}
            style={{
              gridTemplateColumns: "auto 1fr"
            }}
          >
            <Avatar
              size={1}
              style={{
                backgroundColor: value,
                border: "1px solid var(--card-hairline-soft-color)"
              }}
            />
            <TextInput
              style={{ flexGrow: 1 }}
              fontSize={1}
              padding={3}
              placeholder={"#FFFFFF"}
              onChange={handleChange}
              value={value}
            />
          </Grid>
        </>
      )}
      {list && (
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
            {list.map(colorItem => {
              return (
                <ColorCircle
                  key={colorItem.value}
                  colorName={colorItem.title}
                  hex={colorItem.value}
                  active={colorItem.value === value}
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
}

export default ColorSelector
