/** @jsxImportSource theme-ui */
import { Link } from "gatsby";
import React from "react";
import { Container, Flex } from "@theme-ui/components";

const Footer = ({ siteTitle }) => (
  <div
    sx={{
      fontSize: "sm",
      color: 'text',
      bg: 'gray',
      variant: 'styles.footer',
      textDecoration: "none",
      width: "100%",
      left: 0,
      bottom: 0,
    }}>
    <Container
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        maxWidth: 768,
        mx: 'auto',
        px: 2,
        py: 1,
      }}>
      <Link to="/" sx={{ variant: 'styles.p', p: 2, textDecoration: "none", color: "text" }}>
        Home
      </Link>
      {/* <Link to="/" sx={{ variant: 'styles.navlink', p: 2, textDecoration: "none", color:"text"}}>
        Blog
      </Link>
      <Link to="/" sx={{ variant: 'styles.navlink', p: 2,textDecoration: "none", color: "text"}}>
        About
      </Link> */}
      <div sx={{ mx: 'auto' }} />
      <div sx={{ variant: 'styles.p', p: 2 }}>© {new Date().getFullYear()} BMW Car Club of America</div>
      <div>
        <p sx={{ fontSize: "xs", p: 2 }}>This site is not in any way connected with Bayerische Motoren Werke AG or BMW of North America, Inc. The club assumes no liability for any of the information, opinion, or suggestions contained herein. It is provided by and for the club membership only.</p>
      </div>
    </Container>
  </div>
);

export default Footer;