import React from "react";
import { set } from "sanity";
import { Box, Button, Card, Grid } from "@sanity/ui";
import { VOLUNTEER_ICON_OPTIONS } from "./volunteerIconOptions";

const PresentationIconInput = (props) => {
  const { value, onChange, readOnly } = props;
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef(null);
  const selectedOption = VOLUNTEER_ICON_OPTIONS.find((item) => item.value === value);
  const SelectedIcon = selectedOption?.icon;

  React.useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (!rootRef.current || rootRef.current.contains(event.target)) return;
      setOpen(false);
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <Box ref={rootRef} style={{ position: "relative", display: "inline-block" }}>
      <Button
        mode="default"
        tone={open ? "primary" : "default"}
        text={selectedOption?.title || "Select icon"}
        icon={SelectedIcon || undefined}
        onClick={() => {
          if (readOnly) return;
          setOpen((prev) => !prev);
        }}
        disabled={readOnly}
      />
      {open && (
        <Card
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            zIndex: 20,
            width: "360px",
            maxWidth: "min(360px, 90vw)",
          }}
          padding={3}
          radius={2}
          border
          tone="default"
        >
          <Grid columns={6} gap={2}>
            {VOLUNTEER_ICON_OPTIONS.map((option) => {
              const Icon = option.icon;
              const active = option.value === value;
              return (
                <Button
                  key={option.value}
                  mode={active ? "default" : "bleed"}
                  tone={active ? "primary" : "default"}
                  icon={Icon}
                  title={option.title}
                  aria-label={option.title}
                  onClick={() => {
                    if (readOnly) return;
                    onChange(set(option.value));
                    setOpen(false);
                  }}
                  disabled={readOnly}
                />
              );
            })}
          </Grid>
        </Card>
      )}
    </Box>
  );
};

export default PresentationIconInput;
