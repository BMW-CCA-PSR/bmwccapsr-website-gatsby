/** @jsxImportSource theme-ui */
import { Heading, Container, Flex, Divider, Button, Box } from "theme-ui"
import { Link } from 'gatsby'
import React from "react";
import CTALink from "./CTALink";
import Dropdown  from "./dropdown";
import NavLink from "./navLink";
import { StaticImage } from "gatsby-plugin-image"

function Logo() {
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
    <nav
      sx={{
        zIndex: 30,
        top: "0px",
        minWidth: "100%",
        position: 'fixed',
        backgroundColor: "white"
      }}>
      <Container sx={{
        mx: "auto",
        flexWrap: "wrap",
        mt: "0px",
        py: "0.4rem",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <Flex
          sx={{
            mx: 'auto',
            display: 'flex',
            alignItems: 'center',
            pl: "1rem",
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
          <div sx={{ mx: 'auto'}} />
          {showNav && navMenuItems && (
            <div>
              <ul
                sx={{
                  justifyContent: "end",
                  alignItems: "center",
                  display: "flex"
                }}
              >
                {navMenuItems.map((i) => {
                  if (i.navigationItemUrl) {
                    return <Dropdown {...i} />;
                  } else if (i._type == "link") {
                    return <NavLink {...i} />;
                  } else if (i._type == "cta") {
                    return <CTALink {...i} />;
                  }
                })}
              </ul>
            </div>
          )}
        </Flex>
      </Container>
      <Divider sx={{
          my: 0,
          py: 0,
          borderColor: "highlight",
          borderBottomWidth: 3
        }}/>
    </nav>
  );
};

export default Header;