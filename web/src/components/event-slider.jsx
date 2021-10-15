/** @jsxImportSource theme-ui */
import { Container, Text, Flex, Box } from '@theme-ui/components';
import { getEventsUrl } from "../lib/helpers";
import React from 'react';
import { Link } from "gatsby";
import { MdDoubleArrow } from "react-icons/md";

var style = {
    textDecoration: "none",
    textTransform: "uppercase",
    fontSize: 15,
    backgroundColor: "primary",
    border: "none",
    color: "white",
    py: "8px",
    px: "20px",
    position: "relative",
    borderRadius: "2px",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 2px 1px -1px rgba(0, 0, 0, 0.12), 0 1px 1px 0 rgba(0, 0, 0, 0.14)",
    "&:hover":{
      color: "black",
      bg: "highlight",
    }
  }

  var outline = {
    textDecoration: "none",
    textTransform: "uppercase",
    fontSize: 15,
    border: "solid 1px #fff",
    color: "white",
    py: "8px",
    px: "20px",
    position: "relative",
    borderRadius: "2px",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 2px 1px -1px rgba(0, 0, 0, 0.12), 0 1px 1px 0 rgba(0, 0, 0, 0.14)",
    "&:hover":{
      color: "black",
      bg: "highlight",
    }
  }

const EventSlider = (props) => {
    console.log(props)
    return (
        <Container sx={{
            backgroundColor: "secondary", 
            width: "100%",
            height: "100%",
            py: "20px",
        }}>
            <Flex sx={{
                flexDirection: ["column","column","row","row"],
                justifyContent: "center",
                height: "100%",
                alignItems: "center"
                }}>
                <Text sx={{
                    color: "white",
                    variant: "styles.h3",
                    fontWeight: "300",
                }}>Next Event <MdDoubleArrow sx={{pt: "8px"}} /> </Text>
                <Text sx={{
                    color: "white",
                    variant: "styles.h3",
                    px: "15px",
                    my: ["10px", "10px", "0px", "0px"]
                }}>{props.edges[0].node.title}</Text>
                <Link to={getEventsUrl(props.edges[0].node.slug.current)} sx={style}>
                    Learn More
                </Link>
                <div sx={{px: "10px", py: "8px"}}/>
                <Link to="/events" sx={outline}>
                    All Events
                </Link>
            </Flex>
        </Container>
    )
}
export default EventSlider