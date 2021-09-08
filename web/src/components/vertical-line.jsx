/** @jsxImportSource theme-ui */
import React from "react";
import { Box } from "@theme-ui/components";

const VerticalLine = props => {
    const { height = 300 } = props;
    return (

        <Box sx={{
            height: `${height}px`,
            width: "1px",
            backgroundColor: "lightgray",
        }} />

    )
}
export default VerticalLine;