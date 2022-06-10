/** @jsxImportSource theme-ui */
import { Container, Text, Flex, Box, Button} from '@theme-ui/components';
import { getEventsUrl } from "../lib/helpers";
import React, { Fragment, useState, useEffect } from 'react';
import { Link } from "gatsby";
import { MdDoubleArrow } from "react-icons/md";
import { Client } from "../services/FetchClient"

const sanity = new Client();

var style = {
    textDecoration: "none",
    textTransform: "uppercase",
    fontSize: 15,
    backgroundColor: "primary",
    border: "none",
    color: "white",
    mx: [0,0,"1rem","1rem"],
    py: "8px",
    my: "5px",
    px: "20px",
    position: "relative",
    textAlign: "center",
    borderRadius: "4px",
	transition: "background-color 0.5s ease-out",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    "&:hover":{
      color: "white",
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
    borderRadius: "4px",
	transition: "background-color 0.5s ease-out",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    "&:hover":{
      color: "white",
      bg: "highlight",
    }
  }

const EventSlider = (props) => {
    const [event, setEvent] = useState({title: '', slug: {current: ''}});

    useEffect(() => {
        const fetchEvent = async () => {
            const response = await sanity.fetchMostRecentEvent();
            setEvent(response);
          }
        fetchEvent();
    }, []);

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
                        textAlign: "center",
                        fontWeight: "300",
                    }}>{event ? <Fragment>{`Next Event `}<MdDoubleArrow sx={{pt: "8px"}}/></Fragment>: 'No Upcoming Events! Check back later'}</Text>
                    {event && (
                    <>
                    <Text sx={{
                        color: "white",
                        variant: "styles.h3",
                        justifyContent: "center",
                        alignContent: "center",
                        textAlign: "center",
                        mx: ["auto","auto",0,0],
                        //px: "15px",
                        my: ["10px", "10px", "0px", "0px"]
                    }}>{event.title}</Text>
                    <Link to={getEventsUrl(event.slug.current)} sx={style}>
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