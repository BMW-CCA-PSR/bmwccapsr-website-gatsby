/** @jsxImportSource theme-ui */
import { Box, Container, Text, Flex } from "@theme-ui/components";
import { getEventsUrl } from "../lib/helpers";
import React, { Fragment, useState, useEffect, useMemo } from "react";
import { Link } from "gatsby";
import { FaCalendarAlt, FaInfoCircle } from "react-icons/fa";
import { FiChevronRight } from "react-icons/fi";
import { Client } from "../services/FetchClient";

const sanity = new Client();

var style = {
  textDecoration: "none",
  whiteSpace: "nowrap",
  textTransform: "uppercase",
  fontSize: "xs",
  backgroundColor: "primary",
  border: "1px solid",
  borderColor: "rgba(15,23,42,0.22)",
  color: "white",
  mx: [0, 0, "1rem", "1rem"],
  py: 0,
  my: "5px",
  px: "0.95rem",
  height: "34px",
  lineHeight: 1,
  position: "relative",
  textAlign: "center",
  borderRadius: "8px",
  fontWeight: 400,
  letterSpacing: "0.08em",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  transition:
    "background-color 140ms ease, color 140ms ease, border-color 140ms ease",
  boxShadow:
    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  "&:hover": {
    color: "white",
    bg: "highlight",
    borderColor: "rgba(15,23,42,0.3)",
  },
  "&:active": {
    transform: "translateY(0.5px)",
  },
};

export const outline = {
  textDecoration: "none",
  whiteSpace: "nowrap",
  textTransform: "uppercase",
  fontSize: "xs",
  border: "solid 1px",
  borderColor: "currentColor",
  color: "text",
  py: 0,
  my: "5px",
  px: "0.95rem",
  height: "34px",
  lineHeight: 1,
  position: "relative",
  borderRadius: "8px",
  fontWeight: 400,
  letterSpacing: "0.08em",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  transition:
    "background-color 140ms ease, color 140ms ease, border-color 140ms ease",
  boxShadow:
    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  "&:hover": {
    color: "white",
    bg: "highlight",
    borderColor: "rgba(15,23,42,0.22)",
  },
  "&:active": {
    transform: "translateY(0.5px)",
  },
};

const EventSlider = (props) => {
  const initialEvent = useMemo(() => {
    const eventNodes = Array.isArray(props.edges)
      ? props.edges.map((edge) => edge?.node).filter(Boolean)
      : [];
    return eventNodes[0] || null;
  }, [props.edges]);
  const [event, setEvent] = useState(initialEvent);

  useEffect(() => {
    let isMounted = true;
    const fetchEvent = async () => {
      const response = await sanity.fetchEvents();
      if (!isMounted) return;
      const nextEvent = Array.isArray(response) ? response[0] || null : null;
      setEvent(nextEvent);
    };
    fetchEvent().catch(() => {
      if (!isMounted) return;
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Container
      sx={{
        backgroundColor: "secondary",
        width: "100%",
        height: "100%",
        alignItems: "center",
        py: "20px",
        px: "1rem",
      }}
    >
      <Flex
        sx={{
          flexDirection: ["column", "column", "row", "row"],
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: ["0.35rem", "0.35rem", "0.6rem", "0.75rem"],
          height: "100%",
        }}
      >
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            mx: ["auto", "auto", 0, 0],
            my: 0,
          }}
        >
          <Text
            sx={{
              color: "white",
              variant: "styles.h3",
              textAlign: "center",
              fontWeight: "300",
              my: 0,
            }}
          >
            {event ? "Next Event" : "No Upcoming Events! Check back later"}
          </Text>
        </Box>
        {event && (
          <>
            <Box
              as="span"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255,255,255,0.82)",
                lineHeight: 0,
                mx: ["auto", "auto", 0, 0],
              }}
            >
              <FiChevronRight size={18} />
            </Box>
            <Text
              sx={{
                color: "white",
                variant: "styles.h3",
                textAlign: "center",
                mx: ["auto", "auto", 0, 0],
                my: 0,
              }}
            >
              {event.title}
            </Text>
            <Link to={getEventsUrl(event.slug.current)} sx={style}>
              <Box
                as="span"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <FaInfoCircle size={13} aria-hidden="true" />
                Learn More
              </Box>
            </Link>
            <Link to="/events" sx={{ ...outline, color: "white" }}>
              <Box
                as="span"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <FaCalendarAlt size={13} aria-hidden="true" />
                All Events
              </Box>
            </Link>
          </>
        )}
      </Flex>
    </Container>
  );
};
export default EventSlider;
