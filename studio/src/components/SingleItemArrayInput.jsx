import React, { useCallback } from "react";
import { ArrayOfObjectsInput } from "sanity";

/**
 * Wraps the default array input and hides the "Add item" button
 * once the array already contains an item (max 1).
 */
const SingleItemArrayInput = (props) => {
  const isFull = Array.isArray(props.value) && props.value.length >= 1;

  const onInsert = useCallback(
    (...args) => {
      if (isFull) return;
      return props.onInsert?.(...args);
    },
    [isFull, props.onInsert]
  );

  return (
    <ArrayOfObjectsInput
      {...props}
      onInsert={onInsert}
      arrayFunctions={isFull ? () => null : props.arrayFunctions}
    />
  );
};

export default SingleItemArrayInput;
