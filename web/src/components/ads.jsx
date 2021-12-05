/** @jsxImportSource theme-ui */
import SanityImage from "gatsby-plugin-sanity-image"
import React from "react";
import { Box, Flex } from "@theme-ui/components";

const BoxAd = props => {
    const box = props._rawBox
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

const BannerAd = props => {
    const banner = props._rawBanner
    return (
        <Flex sx={{my: "1rem"}}>
            <Box sx={{
                height: "90px",
                width: "728px",
                mx: "auto", 
            }}>
            {banner && banner.asset && (
                <SanityImage {...banner} width={728}
                sx={{
                    width: "100%", 
                    height: "100%", 
                    objectFit: "fit",
                }} /> 
            )}
            </Box>
        </Flex>
    )
}

export {
    BoxAd,
    BannerAd
} 