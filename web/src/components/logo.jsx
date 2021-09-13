/** @jsxImportSource theme-ui */
import React from "react";
import { Heading, Container, Flex, Divider, Button, Box } from "theme-ui"
import { Link } from 'gatsby'
import { StaticImage } from "gatsby-plugin-image"

function Logo() {
  return (
    <Flex sx={{flexDirection: "row"}}>
      <div sx={{minWidth: 75, width: 75, height: 36, display: "flex", flexDirection: "column", justifyContent: "center",}}>
      <StaticImage
        alt="BMW CCA PSR"
        src="../images/psr_sig.png"
        placeholder="blurred"
        layout="constrained"
        sx={{
          objectFit: "cover"
        }}
      />
    </div>
    <Flex sx={{flexDirection: "column", pl: 3}}>
      <Heading sx={{fontSize: [14, 16, 20], letterSpacing: "-.025em", lineHeight: "0.9", color: "black"}} >BMW Car Club of America</Heading>
      <Heading sx={{fontSize: [14, 16, 20], letterSpacing: "-.025em", lineHeight: "0.9", color: "grey"}} >Puget Sound Region</Heading>
      </Flex>
  </Flex>
  )
}

export default Logo