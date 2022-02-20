/** @jsxImportSource theme-ui */
import { format, parseISO } from "date-fns";
import { Link } from "gatsby";
import React from "react";
import { Card, Text, Heading, Box, Flex } from "theme-ui"
import { getEventsUrl } from "../lib/helpers";
import SanityImage from 'gatsby-plugin-sanity-image';

function EventPagePreview(props) {
  const category = props.category ?  props.category.title : ''
  const cityState = props.address && props.address.city && props.address.state ? `${props.address.city}, ${props.address.state}` : "TBD"
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
					width: '100%',
					height: '100%',
          maxWidth: ["","","50vw","50vw"],
					mx: 'auto',
          borderRadius: "8px"
        }}
      >
      {props.mainImage && props.mainImage.asset && (
        <div sx={{position: "relative"}}>
          <SanityImage
            {...props.mainImage}
            width={600}
            sx={{
              width: '100%',
              height: '100%',
              maxHeight: "220px",
              objectFit: 'cover',
              borderTopRightRadius: "8px",
              borderTopLeftRadius: "8px",
            }}
          />
            <Box sx={{
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
            }}>
              <div sx={{justifyContent: "center", textAlign: "center", pt: "5px"}}>
                <Text sx={{variant: "styles.h4", display: "block"}}>{format(parseISO(props.startTime), "MMM")}</Text>
                <Text sx={{variant: "styles.h3", }}>{format(parseISO(props.startTime), "d")}</Text>
              </div>
            </Box>
          </div>
        )}
        <Box sx={{pt: "5px", pl: "10px", height: "100%"}}>
          <Text sx={{ variant: 'text.label', color: 'black'}}>{category}</Text>
          <Heading sx={{ textDecoration: "none", variant: "styles.h3"}} >{props.title}</Heading>
          <Text sx={{variant: "styles.h5", textTransform: "capitalize"}}>{cityState}</Text>
        </Box>
      </Card>
    </Link>
  );
}

export default EventPagePreview;