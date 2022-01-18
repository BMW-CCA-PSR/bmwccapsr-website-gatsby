/** @jsxImportSource theme-ui */
import React from "react";
import { format, formatDistance, differenceInHours } from "date-fns";
import { Container, Heading, Text, Flex, Box, Divider } from "@theme-ui/components";
import EventMap from "./event-map";

function EventDetails(props) {
    console.log(props)
    const { _updatedAt, categories, title, startTime, endTime } = props;
    var start = startTime && (format(new Date(startTime), "MMMM do, yyyy"))
    var numHours = startTime && endTime && (differenceInHours(new Date(startTime), new Date(endTime)))
    return (
    <Box sx={{
        backgroundColor: "lightgray",
        width: "100%",
        mx: "auto",
    }}>
        <Flex sx={{
        flexDirection: ["column", "column", "row"],
        }}>
            {/* Left col (text) */}
            <Flex sx={{
            width: "100%",
            flexDirection: ["column", "row"],
            //justifyContent: "center",
            alignItems: "flex-start",
            textAlign: ["center", "left"],
            mx: "auto",
            }}>
                <Flex sx={{
                    flexDirection: "column",
                    width: "100%",
                    alignItems: "flex-start",
                    p: 3
                }}>
                    <Heading variant="styles.h3" sx={{pb: 3}}>Details</Heading>
                    <Heading variant="styles.h4">Date</Heading>
                    <Text variant="styles.p">{start}</Text>
                    <Heading variant="styles.h4">Length</Heading>
                    <Text variant="styles.p">{numHours} hours</Text>
                    <Heading variant="styles.h4">Cost</Heading>
                    <Text variant="styles.p">{!props.cost || props.cost == 0 ? "Free" : `$${props.cost}`}</Text>
                </Flex>
                <Flex sx={{
                    flexDirection: "column",
                    width: "100%",
                    alignItems: "flex-start",
                    p: 3
                }}>
                    <Heading variant="styles.h3"  sx={{pb: 3}}>Venue</Heading>
                    {props.venueName &&<Heading variant="styles.h4">Name</Heading>}
                    {props.venueName &&<Text variant="styles.p">{props.venueName}</Text>}
                    <Heading variant="styles.h4">Address</Heading>
                    <Text variant="styles.p">(future address field here)</Text>
                    {props.website && <Heading variant="styles.h4">Website</Heading>}
                    {props.website && <Text variant="styles.p">{props.website}</Text>}
                </Flex>
            </Flex>
            {/* Right col (map) */}
            <Box sx={{
                width: "100%",
                textAlign: "center",
                display: "block",
                position: "relative"
            }}>
                <EventMap {...props} />
            </Box>
        </Flex>
    </Box>)
}

export default EventDetails;