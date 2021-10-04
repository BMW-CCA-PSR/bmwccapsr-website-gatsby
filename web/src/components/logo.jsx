/** @jsxImportSource theme-ui */
import React from "react";
import { Heading, Container, Flex, Divider, Button, Box } from "theme-ui"
import { Link } from 'gatsby'
import { StaticImage } from "gatsby-plugin-image"

function Logo() {
  return (
    <Flex sx={{flexDirection: "row"}}>
      {/* <div sx={{minWidth: 75, width: 75, height: 36, display: "flex", flexDirection: "column", justifyContent: "center",}}> */}
      <div>
        <StaticImage
          alt="BMW CCA PSR"
          //src="../images/psr_sig.png"
          src="../images/new-logo.png"
          placeholder="blurred"
          layout="constrained"
          sx={{
            objectFit: "cover",
            width: ["141px", "141px", "175px", "175px"],
            boxShadow: "0 2px 4px -1px rgba(0, 0, 0, 0.2), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 4px 5px 0 rgba(0, 0, 0, 0.14)",
          }}
        />
      </div>
      {/* <Flex sx={{flexDirection: "column", pl: 3}}>
        <Heading sx={{fontSize: [16, 20], letterSpacing: "-.025em", lineHeight: "0.9", color: "black"}} >BMW Car Club of America</Heading>
        <Heading sx={{fontSize: [16, 20], letterSpacing: "-.025em", lineHeight: "0.9", color: "grey"}} >Puget Sound Region</Heading>
      </Flex> */}
    </Flex>
  )
}

export default Logo