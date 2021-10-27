/** @jsxImportSource theme-ui */
import SanityImage from "gatsby-plugin-sanity-image"
import React from "react";
import { Box } from "@theme-ui/components";


const BoxAd = props => {
    const box = props._rawBox
    console.log(box)
    return (
        <Box sx={{
            height: "250px",
            width: "300px"
          }}>
        {box && box.asset && (
            <SanityImage {...box} width={300}
            sx={{
                width: "100%", 
                height: "100%", 
                objectFit: "fit",
            }} /> 
        )}
        </Box>
    )
}

export default BoxAd