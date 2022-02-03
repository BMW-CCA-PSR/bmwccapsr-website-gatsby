/** @jsxImportSource theme-ui */
import React from "react";
import PortableText from "../components/portableText";
import CTALink from "./CTALink";
import { Container, Flex, Heading } from "@theme-ui/components";
import HorizontalLine from "./horizontal-line";
import { displayPartsToString } from "typescript";

const Cta = ({ label, title, body, ctas }) => (
  <Container sx={{
    mx: "auto",
    textAlign:"center",
    py: "1.5rem",
    mb: "3rem",
  }}>
    <Heading sx={{
      width: "100%",
      my: "0.5rem",
      variant: "styles.h2",
      textAlign: "center",
    }}>{title}</Heading>
    <HorizontalLine width="300"/>
    <div sx={{
      //my: "0.5rem",
      variant: "styles.h3"
    }}>
      <PortableText body={body} />
    </div>

    <Flex>
      {(ctas || []).map((c) => (
        <div sx={{
          flex: "1 1 0%",
          py: "0.5rem",
          textAlign: "center"
        }}>
          <CTALink
            key={c._key}
            {...c}
          />
        </div>
      ))}
    </Flex>
  </Container>
);
export default Cta;