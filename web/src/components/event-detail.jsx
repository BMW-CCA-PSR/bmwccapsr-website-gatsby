/** @jsxImportSource theme-ui */
import React from "react";
import { Container, Heading, Text, Flex, Box } from "@theme-ui/components";
import EventMap from "./event-map";

function EventDetails(props) {
    return (
    <Box sx={{
        backgroundColor: "gray",
        width: "100%",
        mx: "auto"
    }}>
        <Flex sx={{
        flexDirection: ["column", "row"],
        }}>
            {/* Left col */}
            <Flex sx={{
            width: "100%",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            textAlign: ["center", "left"],
            mx: "auto",
            }}>
                <Text variant="styles.h5">Heading</Text>
                <Text>Text</Text>
            </Flex>
            {/* Right col */}
            <Box sx={{
            width: "100%",
            textAlign: "center",
            }}>
                <EventMap {...props} />
            </Box>
        </Flex>
    </Box>)
}

export default EventDetails;