/** @jsxImportSource theme-ui */
import React from 'react';
import SanityImage from 'gatsby-plugin-sanity-image';
import BoxHeader from './BoxHeader';
import { OutboundLink } from "gatsby-plugin-google-gtag"

const HomepageSponsors = (props) => {
    return (
        <div sx={{ py: '1.5rem', width: '100%' }}> {/* Ensure full width */}
            <BoxHeader title={props.title} />
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
                                sx={{ textDecoration: "none" }}
                            >
                                <SanityImage
                                    {...ad.node._rawLogo}
                                    width={100}
                                    config={{
                                        saturation: "-100"
                                    }}
                                    sx={{
                                        width: '100%',
                                        height: 'auto', // Adjust height to be auto for proper scaling
                                        maxHeight: '300px',
                                        objectFit: 'contain',
                                        display: 'block', // Ensure image is block level to respect width and height
                                        mx: 'auto', // Center the image within the link
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