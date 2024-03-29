/** @jsxImportSource theme-ui */
import React from "react";
import PortableText from "../components/portableText";
import CTALink from "./CTALink";
import { Container, Flex, Heading } from "@theme-ui/components";

const Cta = ({ label, title, body, ctas }) => (
  <Container sx={{
    mx: "auto",
    textAlign:"center",
    py: "1.5rem",
  }}>
    <Heading sx={{
      width: "100%",
      my: "0.5rem",
      variant: "styles.h2",
      textAlign: "center",
    }}>{title}</Heading>
    <div sx={{
      variant: "styles.h3"
    }}>
      <PortableText body={body} />
    </div>

    <Flex>
      {(ctas || []).map((c) => (
        <div sx={{
          flex: "1 1 0%",
          flexDirection: "column",
          py: "0.5rem",
          mx: "10px",
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