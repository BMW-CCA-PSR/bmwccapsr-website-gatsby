/** @jsxImportSource theme-ui */
import { Box, Text } from 'theme-ui';
import React, { useState } from 'react';

const Badge = ({ text }) => {
    return (
        <Box sx={{
            borderRadius:"3px",
            backgroundColor: "primary",
            color: "white",
            width: "100%"
        }}>
            <Text sx={{
                variant:"text.label"
            }}>
                {text}
            </Text>
        </Box>
    )
}
export default Badge