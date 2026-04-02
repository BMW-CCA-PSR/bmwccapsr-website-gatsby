import React, { useEffect, useRef } from "react";
import { useFormValue } from "sanity";
import { PatchEvent, set } from "sanity";
import { calculateNextInvocation } from "../lib/sourceSettingsSchedule";

/**
 * Custom input component for nextInvocationAt field.
 * Automatically recalculates whenever sync schedule controls change.
 * Watches for changes in sync frequency, hour, minute, and weekday, then updates the field.
 */
const NextInvocationAtInput = (props) => {
  const { renderDefault, onChange } = props;
  const lastCalculatedRef = useRef(null);

  // Watch all schedule control fields for changes
  const syncFrequency = useFormValue(["syncFrequency"]);
  const syncHourUtc = useFormValue(["syncHourUtc"]);
  const syncMinuteUtc = useFormValue(["syncMinuteUtc"]);
  const syncWeekdayUtc = useFormValue(["syncWeekdayUtc"]);
  const syncEnabled = useFormValue(["syncEnabled"]);

  // Recalculate whenever any schedule control changes
  useEffect(() => {
    // Don't update if sync is disabled
    if (syncEnabled === false) {
      lastCalculatedRef.current = null;
      return;
    }

    const documentValue = {
      syncFrequency: syncFrequency || "daily",
      syncHourUtc: syncHourUtc || "09",
      syncMinuteUtc: syncMinuteUtc || "15",
      syncWeekdayUtc: syncWeekdayUtc || "MON",
    };

    try {
      const nextInvocation = calculateNextInvocation(documentValue);
      
      // Only update if the calculated value changed to avoid excessive updates
      if (nextInvocation && nextInvocation !== lastCalculatedRef.current) {
        lastCalculatedRef.current = nextInvocation;
        onChange(PatchEvent.from(set(nextInvocation)));
      }
    } catch (error) {
      console.warn("Failed to calculate next invocation", error);
    }
  }, [syncFrequency, syncHourUtc, syncMinuteUtc, syncWeekdayUtc, syncEnabled, onChange]);

  return renderDefault(props);
};

export default NextInvocationAtInput;
