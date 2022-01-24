/** @jsxImportSource theme-ui */
import { format, parseISO } from "date-fns";
import { Link } from "gatsby";
import React from "react";
import { Card, Text, Heading, Container } from "theme-ui"
import { getEventsUrl } from "../lib/helpers";
import SanityImage from 'gatsby-plugin-sanity-image';

function EventPagePreview(props) {
  const catString = String(props.categories.map((cat) => ` ${cat.title}`));

  return (
    <Link
      to={getEventsUrl(props.slug.current)}
      sx={{textDecoration: "none"}}
    >
      <Text sx={{ variant: 'text.label', color: 'black'}}>{catString}</Text>
      <Card
        sx={{
          textDecoration: "none",
          color: "text",
          backgroundColor: "lightgrey",
          width: "100%",
          maxWidth: "600px",
          mx: "auto",
          borderRadius: "8px"
        }}
      >{props.mainImage && props.mainImage.asset && (
            <SanityImage
              {...props.mainImage}
              width={600}
              sx={{
                width: '100%',
                height: '240px',
                objectFit: 'cover',
                borderTopRightRadius: "8px",
                borderTopLeftRadius: "8px",
              }}
            />
          )}
        <Container p={3}>
          <Heading sx={{ textDecoration: "none", variant: "styles.h3"}} >{props.title}</Heading>
          <Text sx={{variant: "styles.h5"}}>{format(parseISO(props.startTime), "MMMM do, yyyy")}</Text>
        </Container>
      </Card>
    </Link>
  );
}

export default EventPagePreview;