import React from "react";
import { TextInput, Flex, Text, Badge } from "@sanity/ui";
import { IoCarSport } from "react-icons/io5";
import { GoPencil } from "react-icons/go";

const SOURCE_CONFIG = {
  msr: { label: "MSR", icon: IoCarSport, tone: "primary" },
  manual: { label: "Manual", icon: GoPencil, tone: "default" },
};

const EventSourceInput = (props) => {
  const { value, elementProps } = props;
  const normalized = String(value || "manual").trim().toLowerCase();
  const config = SOURCE_CONFIG[normalized] || SOURCE_CONFIG.manual;
  const Icon = config.icon;

  return (
    <Flex align="center" gap={2}>
      <Icon style={{ fontSize: "1.25rem", flexShrink: 0 }} />
      <Badge tone={config.tone} fontSize={1}>
        {config.label}
      </Badge>
      <TextInput {...elementProps} value={value || ""} readOnly style={{ display: "none" }} />
    </Flex>
  );
};

export default EventSourceInput;
