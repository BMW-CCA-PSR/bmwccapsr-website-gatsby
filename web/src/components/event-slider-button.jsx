/** @jsxImportSource theme-ui */
import { Container, Text, Flex } from '@theme-ui/components';
import React from 'react';
import { getEventsUrl } from "../lib/helpers";
import { Link } from "gatsby";

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
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    "&:hover":{
      color: "black",
      bg: "highlight",
    }
  }

const EventSliderButton = (props) => {
    console.log(props)
    const title = props.node.title
    return (
        <div>
            <Text sx={{
                color: "white",
                variant: "styles.h3",
                fontWeight: "300"
            }}>{title}</Text>
            <div sx={{my: "1.5rem"}}>
                <Link to={getEventsUrl(props.node.slug.current)} sx={style}>
                    Learn More
                </Link>
            </div>
        </div>
    )
}
export default EventSliderButton