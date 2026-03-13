import React from "react";
import { set } from "sanity";
import { Box, Card, Flex, Radio, Stack, Text } from "@sanity/ui";

const ASSIGNMENT_CARDINALITY_OPTIONS = [
  {
    value: "singleton",
    title: "Single assignee",
    description: "One person at a time for this position.",
  },
  {
    value: "multiple",
    title: "Multiple assignees",
    description: "Many people can be assigned to this position.",
  },
];

const AssignmentCardinalityInput = (props) => {
  const { value, onChange, readOnly } = props;

  return (
    <Stack space={2}>
      {ASSIGNMENT_CARDINALITY_OPTIONS.map((option) => {
        const checked = value === option.value;
        return (
          <Card
            key={option.value}
            padding={3}
            radius={2}
            border
            tone={checked ? "primary" : "default"}
            style={{ cursor: readOnly ? "default" : "pointer" }}
            onClick={() => {
              if (readOnly) return;
              onChange(set(option.value));
            }}
          >
            <Flex align="flex-start" gap={3}>
              <Radio
                checked={checked}
                readOnly={readOnly}
                onChange={() => {
                  if (readOnly) return;
                  onChange(set(option.value));
                }}
              />
              <Box>
                <Text size={1} weight="semibold">
                  {option.title}
                </Text>
                <Text
                  size={1}
                  muted
                  style={{ marginTop: "6px", display: "block" }}
                >
                  {option.description}
                </Text>
              </Box>
            </Flex>
          </Card>
        );
      })}
    </Stack>
  );
};

export default AssignmentCardinalityInput;
