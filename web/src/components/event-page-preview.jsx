/** @jsxImportSource theme-ui */
import { format, parseISO } from "date-fns";
import { Link } from "gatsby";
import React from "react";
import { Card, Box, Text, Heading, Flex } from "theme-ui"
import { buildImageObj, cn, getEventsUrl } from "../lib/helpers";
import { imageUrlFor } from "../lib/image-url";

function EventPagePreview(props) {
  return (
    <Link
      to={getEventsUrl(props.slug.current)}
      sx={{textDecoration: "none"}}
    >
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
      >
        <div>
          {props.mainImage && props.mainImage.asset && (
            <img
              src={imageUrlFor(buildImageObj(props.mainImage))
                .width(600)
                .height(Math.floor((9 / 16) * 600))
                .fit("crop")
                .auto("format")
                .url()}
              alt={props.mainImage.alt}
              sx={{
                borderTopRightRadius: "8px",
                borderTopLeftRadius: "8px",
                width: "100%",
                height: "100%"
              }}
            />
          )}
        </div>
        <Box p={3}>
          <Heading sx={{ textDecoration: "none", variant: "styles.h3"}} >{props.title}</Heading>
          <Text sx={{
            color: "grey"
          }}>{format(parseISO(props.startTime), "MMMM do, yyyy")}</Text>
        </Box>
      </Card>
    </Link>
  );
}

export default EventPagePreview;