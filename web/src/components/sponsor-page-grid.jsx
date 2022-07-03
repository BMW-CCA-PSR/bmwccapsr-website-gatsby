/** @jsxImportSource theme-ui */
import { Link } from "gatsby";
import React from "react";
import SanityImage from "gatsby-plugin-sanity-image"
import { Card, Box, Text, Heading, Flex, Badge } from "theme-ui"

const PartnerCard = (props) => {
  const tier = props.tier == null ? "" : props.tier.title;
  return (
    <Card
    sx={{
      textDecoration: "none",
      color: "text",
      width: '100%',
      height: '100%',
      maxWidth: ["","","50vw","50vw"],
      borderRadius: "9px",
      display: "flex",
      flexDirection: "column",
      borderStyle: "solid",
      borderWidth: "1px",
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
          borderTopRightRadius: "8px",
          borderTopLeftRadius: "8px",
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
  const tier = props.tier == null ? "" : props.tier.title;
  return (
    <Card
    sx={{
      textDecoration: "none",
      color: "text",
      width: '100%',
      height: '100%',
      maxWidth: ["","","50vw","50vw"],
      borderRadius: "9px",
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
            borderTopRightRadius: "8px",
            borderTopLeftRadius: "8px",
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
            .filter(ad => ad.node.tier.title == 'Platinum')
            .map(ad => (
              <Link
              to={ad.node.href}
              sx={{textDecoration: "none"}}
            >
              <PartnerCard {...ad.node} />
            </Link>
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
            .filter(ad => !ad.node.partner && ad.node.tier.title != 'Platinum')
            .map(ad => (
              <Link
              to={ad.node.href}
              sx={{textDecoration: "none"}}
            >
              <PartnerCard {...ad.node} />
            </Link>
            ))}
      </ul>
      {partners.length != 0 ? <Heading sx={{variant: "styles.h3", borderBottomStyle: "solid", pt: "1rem", pb: "3px", borderBottomWidth: "3px", my: "0.5rem"}}></Heading> : null}
      <ul sx={{
        listStyle: 'none',
        display: 'grid',
        gridGap: 3,
        gridTemplateColumns: 'repeat(auto-fit, minmax(max(250px, 35vw), 1fr))',
        m: 0,
        p: 0
      }}>
        {partners &&
          partners
            .filter(ad => ad.node.partner)
            .map(ad => (
            <Link
              to={ad.node.href}
              sx={{textDecoration: "none"}}
            >
              <DiscountCard {...ad.node} />
            </Link>
            ))}
      </ul>
    </div>
  );
}


export default SponsorPageGrid;