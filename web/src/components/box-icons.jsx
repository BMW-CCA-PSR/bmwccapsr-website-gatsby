/** @jsxImportSource theme-ui */
import React from 'react';
import { Box } from '@theme-ui/components';

const BoxIcon = (props) => {
	return (
        <Box sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 16px)",
            gridTemplateRows: "repeat(2, 16px)",
            gridColumnGap: "0px",
            gridRowGap: "0px",
        }}>
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

const BoxIconFlipped = (props) => {
	return (
        <Box sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 16px)",
            gridTemplateRows: "repeat(2, 16px)",
            gridColumnGap: "0px",
            gridRowGap: "0px",
        }}>
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