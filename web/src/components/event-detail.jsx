/** @jsxImportSource theme-ui */
import React from "react";
import { format, formatDistance, differenceInHours } from "date-fns";
import { Container, Heading, Text, Flex, Box, Divider, Link } from "@theme-ui/components";
import EventMap from "./event-map";

function EventDetails(props) {
    console.log(props)
    const { startTime, endTime, address } = props;
    var start = startTime && (format(new Date(startTime), "MMMM do, yyyy"))
    var numHours = startTime && endTime && (differenceInHours(new Date(endTime), new Date(startTime)))
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
                    {props.poc && <Heading variant="styles.h4">Point of Contact</Heading>}
                    {props.poc.name && <Text variant="styles.p">{props.poc.name}</Text>}
                    {props.poc.contact && <Text variant="styles.p">{props.poc.contact}</Text>}
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
                    {address.line1 &&<Text variant="styles.p">{address.line1}</Text>}
                    {address.line2 &&<Text variant="styles.p">{address.line2}</Text>}
                    {address.city && address.state && <Text variant="styles.p" sx={{textTransform: "capitalize"}}>{address.city}, {address.state}</Text>}
                    {props.website && <Heading variant="styles.h4">Website</Heading>}
                    {props.website && <Text variant="styles.p" sx={{textAlign: "left", width: "100%", wordWrap: "break-word"}}><a href={props.website}>Link</a></Text>}
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