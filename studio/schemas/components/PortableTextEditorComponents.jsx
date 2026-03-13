import React from "react";

export const mathInlineIcon = () => (
  <span>
    <span style={{ fontWeight: "bold" }}>∑</span>b
  </span>
);
export const mathIcon = () => <span style={{ fontWeight: "bold" }}>∑</span>;

export const highlightIcon = () => (
  <span style={{ fontWeight: "bold" }}>H</span>
);

export const highlightRender = (props) => (
  <span
    style={{
      backgroundColor: "#fff176",
      color: "#1f1f1f",
      padding: "0 0.12em",
      borderRadius: "0.2em",
    }}
  >
    {props.children}
  </span>
);
