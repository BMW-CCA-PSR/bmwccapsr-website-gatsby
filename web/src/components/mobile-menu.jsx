/** @jsxImportSource theme-ui */
import React from "react";
import { Heading, Container, Flex, Divider, Button, Box, Text } from "theme-ui"
import { Link } from 'gatsby'
import MobileNavLink from "./mobileNavLink";
import MobileCTALink from "./mobileCTALink";


const MobileMenu = props => {
const navItems = props.navItems
return (
<ul
sx={{
  listStyle: "none",
  m: 0,
  mt: "-152px",
  p: 0,
  backgroundColor: "grey",
  position: "absolute",
  width: "100%",
  zIndex: 30,
  textAlign: "center",
  display: "block",
}}
>
{navItems.map((i) => {
  const link = i.navigationItemUrl
  if (i.navigationItemUrl) {
    return <ul
    sx={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        color: "text",
    }}
>
    <li
        sx={{
            display: "block",
            height: "100%",
            mx: "0.5rem",
        }}
    >
        <Divider sx={{color: "darkgray"}}/>
        <Text variant="text.label">{i.title}</Text>
        {link.items && link.items.length > 0 ? (
            <div
                sx={{
                    listStyle: "none",
                    m: 0,
                    p: 0,
                    display: "flex",
                    flexDirection: "column",
                    cursor: "pointer",
                    left: "0",
                }}
            >
                {link.items.map((subLink) => (
                    <MobileNavLink {...subLink} />
                ))}
            </div>
        ) : null}
    </li>
</ul>
  } else if (i._type == "link") {
    return <MobileNavLink key={i._key} {...i} />;
  } else if (i._type == "cta") {
    return <MobileCTALink key={i._key} {...i} />;
  }
})}
</ul>
)
}
export default MobileMenu