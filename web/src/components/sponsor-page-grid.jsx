/** @jsxImportSource theme-ui */
import { Link } from "gatsby";
import React from "react";
import SanityImage from "gatsby-plugin-sanity-image"
import { Card, Box, Text, Heading, Flex, Badge } from "theme-ui"


function SponsorPageGrid(props) {
  let sponsors = props.edges
  return (
    <div>
      <ul sx={{
        listStyle: 'none',
        display: 'grid',
        gridGap: 3,
        gridTemplateColumns: 'repeat(auto-fit, minmax(256px, 1fr))',
        m: 0,
        px: 0,
        pt: 0,
        pb: "1rem"
      }}>
        {sponsors &&
          sponsors
            .filter(sponsor => sponsor.node.tier.title == 'Platinum')
            .map(sponsor => (
              <Link
              to={sponsor.node.href}
              sx={{textDecoration: "none"}}
            >
              <Card
                sx={{
                  textDecoration: "none",
                  color: "text",
                  backgroundColor: "white",
                  width: "100%",
                  mx: "auto",
                  borderRadius: "8px",
                  boxShadow: "0 5px 5px -3px rgba(110, 131, 183, 0.2), 0 3px 14px 2px rgba(110, 131, 183, 0.12), 0 8px 10px 0 rgba(110, 131, 183, 0.14)",
                }}
              >
              {sponsor.node._rawLogo && sponsor.node._rawLogo.asset && (
                <SanityImage
                {...sponsor.node._rawLogo}
                width={600}
                sx={{
                  width: '100%',
                  height: '100%',
                  maxHeight: '200px',
                  minHeight: '200px',
                  objectFit: 'contain',
                  borderTopLeftRadius: "6px",
                  borderTopRightRadius: "6px"
                }}
                />
              )}
                <Box p={3} sx={{backgroundColor: "lightgrey"}}>
                  <Heading sx={{ textDecoration: "none", variant: "styles.h3"}} >{sponsor.node.name}</Heading>
                </Box>
              </Card>
            </Link>
            ))}
      </ul>
      <ul sx={{
        listStyle: 'none',
        display: 'grid',
        gridGap: 3,
        gridTemplateColumns: 'repeat(auto-fit, minmax(256px, 1fr))',
        m: 0,
        p: 0
      }}>
        {sponsors &&
          sponsors
            .filter(sponsor => sponsor.node.tier.title != 'Platinum')
            .map(sponsor => (
              <Link
              to={sponsor.node.href}
              sx={{textDecoration: "none"}}
            >
              <Card
                sx={{
                  textDecoration: "none",
                  color: "text",
                  backgroundColor: "white",
                  width: "100%",
                  mx: "auto",
                  borderRadius: "8px",
                  boxShadow: "0 5px 5px -3px rgba(110, 131, 183, 0.2), 0 3px 14px 2px rgba(110, 131, 183, 0.12), 0 8px 10px 0 rgba(110, 131, 183, 0.14)",
                }}
              >
              {sponsor.node._rawLogo && sponsor.node._rawLogo.asset && (
                <SanityImage
                {...sponsor.node._rawLogo}
                width={600}
                sx={{
                  width: '100%',
                  height: '100%',
                  maxHeight: '200px',
                  minHeight: '200px',
                  objectFit: 'contain',
                  borderTopLeftRadius: "6px",
                  borderTopRightRadius: "6px"
                }}
                />
              )}
                <Box p={3} sx={{backgroundColor:"lightgrey"}}>
                  <Heading sx={{ textDecoration: "none", variant: "styles.h3"}} >{sponsor.node.name}</Heading>
                </Box>
              </Card>
            </Link>
            ))}
      </ul>
    </div>
  );
}


export default SponsorPageGrid;