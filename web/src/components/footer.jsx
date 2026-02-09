/** @jsxImportSource theme-ui */
import { Link } from "gatsby";
import React from "react";
import { Box, Container } from "@theme-ui/components";
import { StaticImage } from "gatsby-plugin-image";
import { OutboundLink } from "gatsby-plugin-google-gtag";
import { FiExternalLink } from "react-icons/fi";

const Footer = ({ siteTitle }) => (
  <div
    sx={{
      fontSize: "sm",
      color: "gray",
      bg: "darkgray",
      textDecoration: "none",
      width: "100%",
      left: 0,
      bottom: 0,
    }}>
    <Container
      sx={{
        display: "grid",
        gridTemplateColumns: ["1fr", "1fr", "auto 1fr auto"],
        gap: "1.5rem",
        alignItems: "start",
        maxWidth: "1200px",
        mx: "auto",
        px: ["16px", "16px", "50px", "100px"],
        py: "2rem",
      }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <Link to="/" sx={{ textDecoration: "none" }}>
          <StaticImage
            alt="BMW CCA PSR"
            src="../images/new-logo.png"
            placeholder="blurred"
            layout="constrained"
            width={120}
            sx={{
              objectFit: "contain",
              width: "120px",
              filter: "grayscale(100%)"
            }}
          />
        </Link>
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: ["1fr", "1fr", "1fr 1fr"],
          gap: "0.6rem 2rem"
        }}
      >
        <Link to="/zundfolge/" sx={{ textDecoration: "none", color: "gray" }}>
          Zündfolge
        </Link>
        <Link to="/events" sx={{ textDecoration: "none", color: "gray" }}>
          Events
        </Link>
        <Link to="/partners" sx={{ textDecoration: "none", color: "gray" }}>
          Partners
        </Link>
        <Link to="/volunteer" sx={{ textDecoration: "none", color: "gray" }}>
          Volunteer
        </Link>
        <OutboundLink
          href="https://cdn.bmwcca.org/static/join/index.html"
          rel="noopener noreferrer"
          target="_blank"
          sx={{
            textDecoration: "none",
            color: "gray",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem"
          }}
        >
          Join
          <FiExternalLink size={14} aria-hidden="true" />
        </OutboundLink>
        <OutboundLink
          href="http://bmw-cca-puget-sound-chapter.square.site/"
          rel="noopener noreferrer"
          target="_blank"
          sx={{
            textDecoration: "none",
            color: "gray",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem"
          }}
        >
          Shop
          <FiExternalLink size={14} aria-hidden="true" />
        </OutboundLink>
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: ["flex-start", "flex-start", "flex-end"],
          alignItems: "flex-start",
        }}
      >
        <OutboundLink
          href="https://www.bmwcca.org/"
          rel="noopener noreferrer"
          target="_blank"
          sx={{ display: "inline-flex" }}
        >
          <img
            src="/images/bmwcca.png"
            alt="BMW CCA"
            sx={{
              width: "230px",
              height: "auto",
              filter: "grayscale(100%)",
            }}
          />
        </OutboundLink>
      </Box>
      <Box sx={{ gridColumn: ["1", "1", "1 / -1"], mt: "0.5rem" }}>
        <Box sx={{ fontSize: "xs", color: "gray", lineHeight: "1.6" }}>
          This site is not in any way connected with Bayerische Motoren Werke AG
          or BMW of North America, Inc. The club assumes no liability for any of
          the information, opinion, or suggestions contained herein. It is
          provided by and for the club membership only.
        </Box>
        <Box
          as="hr"
          sx={{
            border: "none",
            borderTop: "1px solid",
            borderColor: "gray",
            opacity: 0.4,
            my: "0.75rem"
          }}
        />
        <Box sx={{ fontSize: "xs", color: "gray", lineHeight: "1.6", mt: "0.5rem" }}>
          © {new Date().getFullYear()} BMW Car Club of America
        </Box>
      </Box>
    </Container>
  </div>
);

export default Footer;
