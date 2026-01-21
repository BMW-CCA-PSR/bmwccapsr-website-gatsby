/** @jsxImportSource theme-ui */
import React from 'react';
import { Box } from '@theme-ui/components';

const BoxIcon = ({ sx, ...props }) => {
	return (
        <Box
            {...props}
            sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 16px)",
                gridTemplateRows: "repeat(2, 16px)",
                gridColumnGap: "0px",
                gridRowGap: "0px",
                ...sx,
            }}
        >
            <Box sx={{
                backgroundColor: "primary"
            }} />
            <Box />
            <Box />
            <Box sx={{
                backgroundColor: "primary"
            }} />
        </Box>
    )
}

const BoxIconFlipped = ({ sx, ...props }) => {
	return (
        <Box
            {...props}
            sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 16px)",
                gridTemplateRows: "repeat(2, 16px)",
                gridColumnGap: "0px",
                gridRowGap: "0px",
                ...sx,
            }}
        >
            <Box />
            <Box sx={{
                backgroundColor: "primary"
            }} />
            <Box sx={{
                backgroundColor: "primary"
            }} />
            <Box />
        </Box>
    )
}

export { 
    BoxIcon,
    BoxIconFlipped
}
