/** @jsxImportSource theme-ui */
import React from "react";
import PortableText from "../components/portableText";
import CTALink from "./CTALink";
import ContentContainer from "./content-container";
import { Box, Flex, Heading } from "@theme-ui/components";

const Cta = ({ label, title, body, ctas }) => (
  <Box
    sx={{
      backgroundColor: "lightgray",
      py: ["1.5rem", "2rem"],
      my: 4,
    }}
  >
    <ContentContainer
      sx={{
        textAlign: "center",
        px: ["16px", "16px", "40px", "60px"],
      }}
    >
      <Heading
        sx={{
          width: "100%",
          my: "0.5rem",
          variant: "styles.h2",
          textAlign: "center",
        }}
      >
        {title}
      </Heading>
      <div sx={{ variant: "styles.h3" }}>
        <PortableText body={body} />
      </div>

      <Flex sx={{ justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}>
        {(ctas || []).map((c) => (
          <div
            key={c._key}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "0 1 auto",
              py: "0.5rem",
              mx: "10px",
              textAlign: "center",
            }}
          >
            <CTALink {...c} />
          </div>
        ))}
      </Flex>
    </ContentContainer>
  </Box>
);
export default Cta;
