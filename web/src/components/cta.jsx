/** @jsxImportSource theme-ui */
import React from "react";
import PortableText from "../components/portableText";
import CTALink from "./CTALink";
import ContentContainer from "./content-container";
import { Box, Flex, Heading } from "@theme-ui/components";

const Cta = ({ label, title, body, ctas }) => (
  <Box sx={{ py: ["1.5rem", "2rem"], my: 4 }}>
    <ContentContainer sx={{ px: ["16px", "16px", "50px", "100px"] }}>
      <Box
        sx={{
          backgroundColor: "secondary",
          color: "white",
          borderRadius: "16px",
          p: ["1.5rem", "2rem", "2.5rem"],
          textAlign: "center",
          width: "100%",
        }}
      >
        <Heading
          sx={{
            width: "100%",
            my: "0.5rem",
            variant: "styles.h2",
            color: "white",
            textAlign: "center",
          }}
        >
          {title}
        </Heading>
        <div sx={{ variant: "styles.h3" }}>
          <PortableText body={body} color="white" />
        </div>

        <Flex sx={{ justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}>
          {(ctas || []).map((c, index) => (
            <div
              key={c?._key || `${c?.title || "cta"}-${index}`}
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
      </Box>
    </ContentContainer>
  </Box>
);
export default Cta;
