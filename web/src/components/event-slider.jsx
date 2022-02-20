/** @jsxImportSource theme-ui */
import { Container, Text, Flex, Box, Button} from '@theme-ui/components';
import { getEventsUrl } from "../lib/helpers";
import React, { Fragment } from 'react';
import { Link } from "gatsby";
import { MdDoubleArrow } from "react-icons/md";

var style = {
    textDecoration: "none",
    textTransform: "uppercase",
    fontSize: 15,
    whiteSpace: "nowrap",
    backgroundColor: "primary",
    border: "none",
    color: "white",
    mx: [0,0,"1rem","1rem"],
    py: "8px",
    my: "5px",
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
    whiteSpace: "nowrap",
    textTransform: "uppercase",
    fontSize: 15,
    border: "solid 1px #fff",
    color: "white",
    py: "8px",
    my: "5px",
    
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
    return (
        <Container sx={{
            backgroundColor: "secondary", 
            width: "100%",
            height: "100%",
            alignItems: "center",
            py: "20px",
            px: "1rem"
        }}>
            <Flex sx={{
                flexDirection: ["column","column","row","row"],
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                }}>
                <Text sx={{
                    color: "white",
                    variant: "styles.h3",
                    mx: ["auto","auto",0,0],
                    fontWeight: "300",
                }}>{props.edges[0] ? <Fragment>{`Next Event `}<MdDoubleArrow sx={{pt: "8px"}}/></Fragment>: 'No Upcoming Events! Check back later'}</Text>
                {props.edges[0] && (
                <>
                <Text sx={{
                    color: "white",
                    variant: "styles.h3",
                    justifyContent: "center",
                    alignContent: "center",
                    mx: ["auto","auto",0,0],
                    //px: "15px",
                    my: ["10px", "10px", "0px", "0px"]
                }}>{props.edges[0].node.title}</Text>
                <Link to={getEventsUrl(props.edges[0].node.slug.current)} sx={style}>
                    Learn More
                </Link>
                <Link to="/events" sx={outline}>
                    All Events
                </Link>
                </>
                )}
            </Flex>
        </Container>
    )
}
export default EventSlider