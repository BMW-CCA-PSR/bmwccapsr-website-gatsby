/** @jsxImportSource theme-ui */
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "gatsby";
import { Box, Card, Container, Heading, Text } from "@theme-ui/components";
import { BoxIcon } from "./box-icons";
import { outline } from "./event-slider";
import { Client } from "../services/FetchClient";
import EventCard from "./event-card";
import { FiArrowRightCircle, FiChevronRight } from "react-icons/fi";

const UpcomingEvents = (props) => {
  const fetchedEventLimit = 4;
  const displayedEventLimit = 3;
  const title = props.title || "Upcoming Events";
  const initialEvents = useMemo(() => {
    const eventNodes = props.edges ? props.edges.map((edge) => edge.node) : [];
    const filtered = eventNodes.filter((event) => {
      const name = (event?.title || "").toLowerCase();
      return !name.includes("board meeting");
    });
    return filtered.slice(0, fetchedEventLimit);
  }, [props.edges]);
  const [events, setEvents] = useState(initialEvents);
  const [hasFetched, setHasFetched] = useState(false);
  const sanity = useMemo(() => new Client(), []);
  const displayEvents = events.slice(0, displayedEventLimit);

  useEffect(() => {
    let isMounted = true;
    sanity
      .fetchUpcomingEvents(fetchedEventLimit)
      .then((data) => {
        if (!isMounted) return;
        const normalized = Array.isArray(data) ? data : [];
        setEvents(normalized.slice(0, fetchedEventLimit));
        setHasFetched(true);
      })
      .catch(() => {
        if (!isMounted) return;
        setHasFetched(true);
      });
    return () => {
      isMounted = false;
    };
  }, [sanity]);

  if (hasFetched && displayEvents.length === 0) {
    return null;
  }

  return (
    <Container
      sx={{ py: "1.5rem", px: ["16px", "20px", "24px"], bg: "lightgray" }}
    >
      <Box sx={{ maxWidth: "1000px", mx: "auto", mb: "1.5rem" }}>
        <Heading
          as="h2"
          sx={{
            variant: "styles.h2",
            mb: 0,
          }}
        >
          {title}
          <BoxIcon
            as="span"
            sx={{
              display: "inline-grid",
              ml: "0.5rem",
              verticalAlign: "middle",
            }}
          />
        </Heading>
        <Box
          as="hr"
          sx={{
            border: "none",
            borderTop: "3px solid",
            borderColor: "text",
            mt: "0.75rem",
            mb: 0,
          }}
        />
      </Box>
      <Box sx={{ maxWidth: "1000px", mx: "auto" }}>
        <ul
          sx={{
            listStyle: "none",
            display: "grid",
            gridGap: 3,
            gridTemplateColumns: [
              "1fr",
              "1fr",
              "repeat(2, minmax(0, 1fr))",
              "repeat(2, minmax(0, 1fr))",
            ],
            m: 0,
            p: 0,
          }}
        >
          {displayEvents.map((event, index) => (
            <li key={event?._id || index}>
              <EventCard
                event={event}
                titleSx={{
                  fontSize: ["26px", "28px", "30px", "30px"],
                  lineHeight: [1.02, 1.03, 1.04, 1.04],
                }}
              />
            </li>
          ))}
          <li key="volunteer-promo-card">
            <Link
              to="/volunteer"
              sx={{ textDecoration: "none", display: "block", height: "100%" }}
            >
              <Card
                sx={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  minHeight: "100%",
                  borderRadius: "18px",
                  border: "1px solid",
                  borderColor: "secondary",
                  bg: "secondary",
                  color: "white",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  p: ["1.5rem", "1.75rem", "2rem"],
                  overflow: "hidden",
                  "&:hover .volunteer-arrow-bg": {
                    transform: "translateY(-50%) translateX(12px) scale(1.08)",
                    color: "rgba(255,255,255,0.4)",
                  },
                }}
              >
                <Heading
                  as="h3"
                  sx={{
                    fontSize: ["2.8rem", "3.2rem", "3.6rem"],
                    lineHeight: 1,
                    color: "white",
                    mb: "0.8rem",
                    position: "relative",
                    zIndex: 1,
                    maxWidth: "16ch",
                  }}
                >
                  Volunteer at our next event
                </Heading>
                <Text
                  sx={{
                    fontSize: ["1rem", "1rem", "1.1rem"],
                    lineHeight: 1.35,
                    color: "white",
                    maxWidth: "28ch",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  Help us run our next event by volunteering. Explore available
                  volunteer positions.
                </Text>
                <Box
                  as="span"
                  className="volunteer-arrow-bg"
                  sx={{
                    position: "absolute",
                    right: ["0.25rem", "0.5rem", "0.75rem"],
                    top: "50%",
                    transform: "translateY(-50%)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(255,255,255,0.26)",
                    pointerEvents: "none",
                    zIndex: 0,
                    transition: "transform 220ms ease, color 220ms ease",
                  }}
                >
                  <FiArrowRightCircle size={170} />
                </Box>
              </Card>
            </Link>
          </li>
        </ul>
        <Box sx={{ mt: "1.5rem", mb: "2rem", textAlign: "center" }}>
          <Link to="/events" sx={{ ...outline, bg: "background" }}>
            <Box
              as="span"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              More Events
              <FiChevronRight size={16} aria-hidden="true" />
            </Box>
          </Link>
        </Box>
      </Box>
    </Container>
  );
};

UpcomingEvents.defaultProps = {
  edges: [],
};

export default UpcomingEvents;
