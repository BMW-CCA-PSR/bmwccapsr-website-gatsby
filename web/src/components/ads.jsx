/** @jsxImportSource theme-ui */
import SanityImage from "gatsby-plugin-sanity-image"
import React from "react";
import { Box, Flex } from "@theme-ui/components";
import { Link } from "gatsby";

const BoxAd = props => {
    const box = props._rawBox
    return (
        <Box sx={{
            height: "250px",
            width: "300px"
        }}>
        {box && box.asset && (
        <a
            href={props.href}
            target="_blank"
            rel="noopener noreferrer"
            sx={{textDecoration: "none"}}
        >
            <SanityImage {...box} width={300}
            sx={{
                width: "100%", 
                height: "100%", 
            }} /> 
        </a>
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
            <a
                href={props.href}
                target="_blank"
                rel="noopener noreferrer"
                sx={{textDecoration: "none"}}
            >
                <SanityImage {...banner} width={728}
                sx={{
                    width: "100%", 
                    height: "100%", 
                    objectFit: "contain",
                }} /> 
            </a>
            )}
            </Box>
        </Flex>
    )
}

export {
    BoxAd,
    BannerAd
} 