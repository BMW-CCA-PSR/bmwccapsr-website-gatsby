/** @jsxImportSource theme-ui */
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "gatsby";
import { Box, Container, Heading } from "@theme-ui/components";
import { BoxIcon } from "./box-icons";
import { outline } from "./event-slider";
import { Client } from "../services/FetchClient";
import EventCard from "./event-card";

const UpcomingEvents = (props) => {
  const limit = props.limit || 2;
  const title = props.title || "Upcoming Events";
  const initialEvents = useMemo(() => {
    const eventNodes = props.edges ? props.edges.map((edge) => edge.node) : [];
    const filtered = eventNodes.filter((event) => {
      const name = (event?.title || "").toLowerCase();
      return !name.includes("board meeting");
    });
    return filtered.slice(0, limit);
  }, [props.edges, limit]);
  const [events, setEvents] = useState(initialEvents);
  const [hasFetched, setHasFetched] = useState(false);
  const sanity = useMemo(() => new Client(), []);

  useEffect(() => {
    let isMounted = true;
    sanity
      .fetchUpcomingEvents(limit)
      .then((data) => {
        if (!isMounted) return;
        const normalized = Array.isArray(data) ? data : [];
        setEvents(normalized);
        setHasFetched(true);
      })
      .catch(() => {
        if (!isMounted) return;
        setHasFetched(true);
      });
    return () => {
      isMounted = false;
    };
  }, [limit, sanity]);

  if (hasFetched && events.length === 0) {
    return null;
  }

  return (
    <Container sx={{ py: "1.5rem", px: ["16px", "20px", "24px"], bg: "lightgray" }}>
      <Box sx={{ maxWidth: "1000px", mx: "auto", mb: "1.5rem" }}>
        <Heading
          as="h2"
          sx={{
            variant: "styles.h2",
            mb: 0
          }}
        >
          {title}
          <BoxIcon
            as="span"
            sx={{
              display: "inline-grid",
              ml: "0.5rem",
              verticalAlign: "middle"
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
            mb: 0
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
              "repeat(2, minmax(0, 1fr))"
            ],
            m: 0,
            p: 0
          }}
        >
          {events.map((event, index) => (
            <li key={event?._id || index}>
              <EventCard event={event} />
            </li>
          ))}
        </ul>
        <Box sx={{ mt: "1.5rem", mb: "2rem", textAlign: "center" }}>
          <Link to="/events" sx={{ ...outline, bg: "background" }}>
            More Events
          </Link>
        </Box>
      </Box>
    </Container>
  );
};

UpcomingEvents.defaultProps = {
  edges: []
};

export default UpcomingEvents;
