/** @jsxImportSource theme-ui */
import React from "react";
import SanityImage from "gatsby-plugin-sanity-image"
import { Card, Box, Text, Heading, Flex } from "theme-ui"
import { BoxIcon } from "./box-icons";
import { OutboundLink } from "gatsby-plugin-google-gtag"

const PartnerCard = (props) => {
  const tier = props.tier === null ? "" : props.tier.title;
  const tierStyles = {
    platinum: {
      borderColor: "#e5e4e2",
      borderWidth: "4px",
      boxShadow:
        "0 0 0 2px rgba(229, 228, 226, 0.7), 0 0 26px rgba(255, 255, 255, 0.65)"
    },
    gold: {
      borderColor: "#d4af37",
      borderWidth: "4px",
      boxShadow:
        "0 0 0 1px rgba(212, 175, 55, 0.6), 0 0 20px rgba(212, 175, 55, 0.35)"
    },
    silver: {
      borderColor: "#c0c0c0",
      borderWidth: "4px",
      boxShadow:
        "0 0 0 1px rgba(192, 192, 192, 0.55), 0 0 18px rgba(192, 192, 192, 0.3)"
    }
  };
  const tierKey = tier.toLowerCase();
  const tierStyle = tierStyles[tierKey] || {};
  return (
    <Card
    sx={{
      textDecoration: "none",
      color: "text",
      width: '100%',
      height: '100%',
      borderRadius: "18px",
      display: "flex",
      flexDirection: "column",
      borderStyle: "solid",
      borderWidth: tierStyle.borderWidth || "1px",
      borderColor: tierStyle.borderColor,
      boxShadow: tierStyle.boxShadow,
    }}
  >
  {props._rawLogo && props._rawLogo.asset && (
      <SanityImage
        {...props._rawLogo}
        width={600}
        sx={{
          width: '100%',
          height: '100%',
          maxHeight: '200px',
          minHeight: '200px',
          objectFit: 'contain',
          borderTopRightRadius: "18px",
          borderTopLeftRadius: "18px",
        }}
      />
    )}
    <Box sx={{py: "5px", px: "10px",  display: "flex", justifyContent: "center", flexDirection: "column"}}>
      <Text sx={{ variant: 'text.label', color: 'black'}}>{tier}</Text>
      <Heading sx={{ textDecoration: "none", variant: "styles.h3"}} >{props.name}</Heading>
    </Box>
  </Card>
)}

const DiscountCard = (props) => {
  return (
    <Card
    sx={{
      textDecoration: "none",
      color: "text",
      width: '100%',
      height: '100%',
      borderRadius: "18px",
      display: "flex",
      flexDirection: "column",
      borderStyle: "solid",
      borderWidth: "1px",
    }}
  >
    <Flex
        sx={{
          flexDirection: 'row'
        }}
      >
    {props._rawLogo && props._rawLogo.asset && (
        <SanityImage
          {...props._rawLogo}
          width={600}
          sx={{
            p: "10px",
            maxHeight: '100px',
            minHeight: '100px',
            maxWidth: '100px',
            objectFit: 'contain',
            borderTopRightRadius: "18px",
            borderTopLeftRadius: "18px",
          }}
        />
      )}
      <Box sx={{py: "5px", px: "10px",  display: "flex", justifyContent: "center", flexDirection: "column", alignContent: "right"}}>
        <Heading sx={{ textDecoration: "none", variant: "styles.h4"}} >{props.name}</Heading>
        <Text sx={{ variant: 'styles.h5', pt: "5px"}}>{props.discount}</Text>
      </Box>
    </Flex>
  </Card>
)}

function SponsorPageGrid(props) {
  let advertisers = props.edges.filter(advertisers => advertisers.node.active);
  let partners = props.edges.filter(partner => partner.node.partner);
  console.log(props)
  return (
    <div>
      {/* <Heading sx={{variant: "styles.h3", borderBottomStyle: "solid", pb: "3px", borderBottomWidth: "3px", my: "0.5rem"}}></Heading> */}
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
        {advertisers &&
          advertisers
            .filter(ad => ad.node.tier.title === 'Platinum')
            .map(ad => (
              <OutboundLink
                target="_blank"
                rel="noopener noreferrer"
                href={ad.node.href}
                sx={{textDecoration: "none"}}
              >
                <PartnerCard {...ad.node} />
              </OutboundLink>
            ))}
      </ul>
      {/* <Heading sx={{variant: "styles.h3", borderBottomStyle: "solid", pb: "3px", borderBottomWidth: "3px", my: "0.5rem"}}>All Partners</Heading> */}
      <ul sx={{
        listStyle: 'none',
        display: 'grid',
        gridGap: 3,
        gridTemplateColumns: 'repeat(auto-fit, minmax(256px, 1fr))',
        m: 0,
        p: 0
      }}>
        {advertisers &&
          advertisers
            .filter(ad => ad.node.tier.title !== 'Platinum')
            .map(ad => (
              <OutboundLink
                target="_blank"
                rel="noopener noreferrer"
                href={ad.node.href}
                sx={{textDecoration: "none"}}
              >
                <PartnerCard {...ad.node} />
              </OutboundLink>
            ))}
      </ul>
      {partners.length !== 0 ? (
        <>
          <Heading sx={{ variant: "styles.h2", mt: "1rem", mb: "1rem" }}>
            Partner Discounts
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
              mb: "1.5rem"
            }}
          />
        </>
      ) : null}
      <ul sx={{
        listStyle: 'none',
        display: 'grid',
        gridGap: 3,
        gridTemplateColumns: [
          "1fr",
          "1fr",
          "repeat(2, minmax(0, 1fr))",
          "repeat(2, minmax(0, 1fr))"
        ],
        m: 0,
        p: 0,
        mb: "5rem"
      }}>
        {partners &&
          partners
            .filter(ad => ad.node.partner)
            .map(ad => (
            <OutboundLink
              target="_blank"
              rel="noopener noreferrer"
              href={ad.node.href}
              sx={{textDecoration: "none"}}
            >
              <DiscountCard {...ad.node} />
            </OutboundLink>
            ))}
      </ul>
    </div>
  );
}


export default SponsorPageGrid;
