/** @jsxImportSource theme-ui */
import { Heading, Container, Flex } from "theme-ui"
import { Link } from 'gatsby'
import React from "react";
import CTALink from "./CTALink";
import { StaticImage } from "gatsby-plugin-image"

export function Logo() {
  return (
    <StaticImage
      alt="BMW CCA PSR"
      src="../images/PSR-logo.jpeg"
      placeholder="blurred"
      layout="constrained"
      width={150}
    />
  )
}

const Header = ({ showNav, siteTitle, scrolled, navMenuItems = [] }) => {


  return (

    <header
      sx={{
        variant: 'styles.header',
        zIndex: 0,
        top: 0,
        position: 'sticky',
        backgroundColor: 'background'
      }}>
      <Container>
        <Flex
          sx={{
            maxWidth: 768,
            mx: 'auto',
            px: 3,
            py: 2,
            display: 'flex',
            alignItems: 'center',
          }}>
          <Link
            activeClassName="active"
            id="siteTitle"
            to="/"
            sx={{
              color: 'text',
              textDecoration: 'none'
            }}>
            {Logo()}
            {/* <Heading>{siteTitle}</Heading> */}
          </Link>
          <div sx={{ mx: 'auto' }} />
          {showNav && navMenuItems && (
            <div>
              <ul
                sx={{
                  justifyContent: "end",
                  alignItems: "center",
                  display: "flex"
                }}
              >
                {navMenuItems.map((i) => (
                  <CTALink {...i} />
                ))}
              </ul>
            </div>
          )}
        </Flex>
      </Container>
      <hr
        sx={{
          my: 0,
          py: 0,
          borderColor: "highlight",
          borderBottomWidth: 3
        }} />
    </header>
  );
};

export default Header;