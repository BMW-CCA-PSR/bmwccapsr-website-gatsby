/** @jsxImportSource theme-ui */
import React from "react";
import { Box } from "@theme-ui/components";

const Horizontaline = props => {
    const { width = 300 } = props;
    return (

        <Box sx={{
            mx: "auto",
            width: `${width}px`,
            height: "1px",
            backgroundColor: "lightgray",
        }} />

    )
}
export default Horizontaline;