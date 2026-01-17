/** @jsxImportSource theme-ui */
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "gatsby";
import { Box, Card, Container, Heading, Text } from "@theme-ui/components";
import { format, parseISO } from "date-fns";
import { getEventsUrl } from "../lib/helpers";
import { imageUrlFor } from "../lib/image-url";
import { BoxIcon } from "./box-icons";
import { outline } from "./event-slider";
import { Client } from "../services/FetchClient";

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
    <Container sx={{ py: "1.5rem", bg: "lightgray" }}>
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
          {events.map((event, index) => {
            const cityState =
              event?.address?.city && event?.address?.state
                ? `${event.address.city}, ${event.address.state}`
                : "";
            const imageUrl = event?.mainImage
              ? imageUrlFor(event.mainImage)
                  .width(800)
                  .height(440)
                  .fit("crop")
                  .auto("format")
                  .url()
              : null;
            return (
              <li key={event?._id || index}>
                <Link to={getEventsUrl(event.slug.current)} sx={{ textDecoration: "none" }}>
                  <Card
                    sx={{
                      textDecoration: "none",
                      color: "text",
                      backgroundColor: "white",
                      width: "100%",
                      height: "100%",
                      borderRadius: "9px",
                      display: "flex",
                      flexDirection: "column",
                      borderStyle: "solid",
                      borderWidth: "1px",
                    }}
                  >
                    {imageUrl && (
                      <Box sx={{ position: "relative" }}>
                        <Box
                          as="img"
                          src={imageUrl}
                          alt={event?.mainImage?.alt || event?.title || "Event"}
                          sx={{
                            width: "100%",
                            height: "100%",
                            maxHeight: "220px",
                            minHeight: "220px",
                            objectFit: "cover",
                            borderTopRightRadius: "8px",
                            borderTopLeftRadius: "8px",
                          }}
                        />
                        {event?.startTime && (
                          <Box
                            sx={{
                              position: "absolute",
                              backgroundColor: "white",
                              height: "65px",
                              width: "60px",
                              alignContent: "center",
                              bottom: "20px",
                              right: "20px",
                              m: "auto",
                              borderBottom: "5px",
                              borderBottomStyle: "solid",
                              borderBottomColor: "highlight"
                            }}
                          >
                            <div sx={{ justifyContent: "center", textAlign: "center", pt: "5px" }}>
                              <Text sx={{ variant: "styles.h4", display: "block" }}>
                                {format(parseISO(event.startTime), "MMM")}
                              </Text>
                              <Text sx={{ variant: "styles.h3" }}>
                                {format(parseISO(event.startTime), "d")}
                              </Text>
                            </div>
                          </Box>
                        )}
                      </Box>
                    )}
                    <Box
                      sx={{
                        py: "5px",
                        px: "10px",
                        display: "flex",
                        justifyContent: "center",
                        flexDirection: "column"
                      }}
                    >
                      {event?.category?.title && (
                        <Text sx={{ variant: "text.label", color: "black" }}>
                          {event.category.title}
                        </Text>
                      )}
                      <Heading sx={{ textDecoration: "none", variant: "styles.h3" }}>
                        {event.title}
                      </Heading>
                      {cityState && (
                        <Text sx={{ variant: "styles.h5", textTransform: "capitalize" }}>
                          {cityState}
                        </Text>
                      )}
                    </Box>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
        <Box sx={{ mt: "1.5rem", mb: "2rem", textAlign: "center" }}>
          <Link to="/events" sx={{ ...outline, bg: "background" }}>
            All Events
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
