/** @jsxImportSource theme-ui */
import React from "react";


function NewsletterSignup(props) {
    return (
       <Box sx={{
          backgroundColor: "highlight",
          height: "100%",
          width: "100%",
          p: 3,
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          borderRadius: 8
          }}>
        <Text variant="styles.h3" sx={{pb: "6px"}}>Sign up for our newsletter</Text>
        <Flex sx={{flexDirection: "row"}}>
            <Input defaultValue="email" sx={{px: 2}}/>
            <CTALink title="submit"/>
            </Flex>
      </Box>
    )
}
export default NewsletterSignup