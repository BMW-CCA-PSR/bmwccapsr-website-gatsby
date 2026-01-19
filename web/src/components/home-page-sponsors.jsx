/** @jsxImportSource theme-ui */
import React from 'react';
import SanityImage from 'gatsby-plugin-sanity-image';
import { Box, Heading } from "@theme-ui/components";
import { BoxIcon } from "./box-icons";
import { OutboundLink } from "gatsby-plugin-google-gtag"

const HomepageSponsors = (props) => {
    return (
        <div sx={{ py: '1.5rem', width: '100%' }}> {/* Ensure full width */}
            <Box sx={{ maxWidth: "1000px", mx: "auto", mb: "1.5rem" }}>
                <Heading
                    as="h2"
                    sx={{
                        variant: "styles.h2",
                        mb: 0
                    }}
                >
                    {props.title}
                    <BoxIcon
                        as="span"
                        sx={{
                            display: "inline-grid",
                            ml: "0.5rem",
                            verticalAlign: "middle"
                        }}
                    />
                </Heading>
                <Box
                    as="hr"
                    sx={{
                        border: "none",
                        borderTop: "3px solid",
                        borderColor: "text",
                        mt: "0.75rem",
                        mb: 0
                    }}
                />
            </Box>
            <div>
                <ul sx={{
                    listStyle: 'none',
                    display: 'grid',
                    gridGap: 3,
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    m: 0,
                    p: 0,
                    maxWidth: '1000px',
                    mx: "auto",
                    padding: '1.5rem',
                    width: '100%', // Ensure the grid takes up the full width
                }}>
                    {props.edges && props.edges.map((ad, index) => (
                        <li key={index} sx={{ // Wrap each link in an li for proper grid behavior
                            justifySelf: 'center', // Center each grid item
                            width: '100%', // Ensure each grid item takes up the full cell width
                        }}>
                            <OutboundLink
                                href={ad.node.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                    textDecoration: "none",
                                    display: "block",
                                    ":hover picture, :hover img": {
                                        filter: "none"
                                    }
                                }}
                            >
                                <SanityImage
                                    {...ad.node._rawLogo}
                                    width={100}
                                    sx={{
                                        width: '100%',
                                        height: 'auto', // Adjust height to be auto for proper scaling
                                        maxHeight: '300px',
                                        objectFit: 'contain',
                                        display: 'block', // Ensure image is block level to respect width and height
                                        mx: 'auto', // Center the image within the link
                                        filter: "grayscale(100%)",
                                        transition: "filter 0.2s ease"
                                    }}
                                />
                            </OutboundLink>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default HomepageSponsors;
