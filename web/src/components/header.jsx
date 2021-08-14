/** @jsxImportSource theme-ui */
import { Heading, Container, Flex } from "theme-ui"
import { Link } from "gatsby";
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
      width={200}
    />
  )
}

const Header = ({ showNav, siteTitle, scrolled, navMenuItems = [] }) => {

  let headerClass = "fixed w-full z-30 top-0 text-white";
  headerClass += scrolled ? " bg-white shadow" : "";

  let navActionClass =
    "mx-auto lg:mx-0 hover:underline font-bold rounded-full mt-4 lg:mt-0 py-4 px-8 shadow opacity-75";

  let navContentClass =
    "w-full flex-grow lg:flex lg:items-center lg:w-auto hidden lg:block mt-2 lg:mt-0 text-black p-4 lg:p-0 z-20";

  let titleClass = "toggleColour no-underline hover:no-underline font-bold text-2xl lg:text-4xl";
  return (

<header
  sx={{
    variant: 'styles.header',
    zIndex: 30,
    top: 0,
    
  }}>
  <Container>
    <Flex
      sx={{
        maxWidth: 768,
        mx: 'auto',
        px: 3,
        py: 2,
        display: 'flex',
        alignItems: 'baseline',
      }}>
      {Logo()}
      <Link
        id="siteTitle"
        to="/"
        sx={{
          variant: 'styles.navlink',
          fontSize: 5,
          py: 2,
        }}>
        <h2>{siteTitle}</h2>
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
      borderColor: "gray",
      opacity: .25
    }} />
</header>

    // <nav>
    //   <div className="w-full container mx-auto flex flex-wrap items-center justify-between mt-0 py-2">
    //     <div className="pl-4 flex items-center">
    //       <Link id="siteTitle" className={titleClass} to="/">
    //         {siteTitle}
    //       </Link>
    //     </div>


    //   </div>

    //   <hr className="border-b border-gray-100 opacity-25 my-0 py-0" />
    // </nav>
  );
};

export default Header;