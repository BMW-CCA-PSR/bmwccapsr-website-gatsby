/** @jsxImportSource theme-ui */
import { useResponsiveValue, useBreakpointIndex } from '@theme-ui/match-media'
import { Heading, Container, Flex, Divider, Button, Box, MenuButton, Close } from "theme-ui"
import { Link } from 'gatsby'
import React, { useState }  from "react";
import CTALink from "./CTALink";
import Dropdown  from "./dropdown";
import NavLink from "./navLink";
import { StaticImage } from "gatsby-plugin-image"
import Logo from "./logo";
import MobileMenu from './mobile-menu';

const Header = ({ showNav, siteTitle, scrolled, navMenuItems = [] }) => {
  const [isToggledOn, setToggle] = useState(false)
  const toggle = () => setToggle(!isToggledOn)
  const index = useBreakpointIndex()
  
  return (
    <nav
      sx={{
        //top: 0,
        minWidth: "100%",
        position: 'relative',
        backgroundColor: "white",
      }}>
      <Container sx={{
        zIndex: 30,
        mx: "auto",
        //height: "82px",
        maxHeight: "6rem",
        flexWrap: "wrap",
        mt: 0,
        //py: "0.4rem",
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
              textDecoration: 'none',
              my: "2rem"
            }}>
            <Logo />
          </Link>
          <div sx={{ mx: 'auto'}} />
          {showNav && navMenuItems && (
            <div>
              {index > 2 ?
              <ul
                sx={{
                  justifyContent: "end",
                  alignItems: "center",
                  display: "inline-flex"
                }}
              >
                {navMenuItems.map((i) => {
                  if (i.navigationItemUrl) {
                    return <Dropdown key={i._key} {...i} />;
                  } else if (i._type == "link") {
                    return <NavLink key={i._key} {...i} />;
                  } else if (i._type == "cta") {
                    return <CTALink key={i._key} {...i} />;
                  }
                })}
              </ul> 
              :
                <div sx={{display: "inline-flex", alignItems: "center"}}>
                  {!isToggledOn ? 
                  <MenuButton
                    aria-label='open menu'
                    sx={{ display: "block" }}
                    onClick={toggle} />
                    :
                  <Close                     
                    aria-label='close menu'
                    sx={{ display: "block" }}
                    onClick={toggle} />
                  }
                </div>
              }
            </div>
          )}
        </Flex>
        <Flex>
          {isToggledOn ?
            <MobileMenu navItems={navMenuItems} />
            : null}
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