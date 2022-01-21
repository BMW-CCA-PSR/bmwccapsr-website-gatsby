/** @jsxImportSource theme-ui */
import React from 'react';
import SanityImage from 'gatsby-plugin-sanity-image';
import { Card, Container, Heading, Text, Flex } from '@theme-ui/components';
import { Link } from "gatsby";
import {BoxIcon, BoxIconFlipped} from './box-icons';

const HomepageSponsors = (props) => {
    return (
        <div>
            <Flex sx={{
                flexDirection: "row", 
                mx: "auto",
                my: "20px",
                justifyContent: "center"
                }}>
                <BoxIcon />
                    <Heading
                    sx={{
                        mx: "15px",
                        variant: 'styles.h2',
                        lineHeight: "0.7"
                    }}>
                    Our Partners
                    </Heading>
                <BoxIconFlipped />
            </Flex>
            <div>
                <ul sx={{
                    listStyle: 'none',
                    display: 'grid',
                    gridGap: 3,
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                    //gridAutoRows: "minmax(auto, auto)",
                    m: 0,
                    p: 0,
                    maxWidth: '1000px',
                    mx: "auto",
                    padding: '1.5rem'
                }}>
                    {props.edges &&
                    props.edges.map((logo) => (
                        <li>
                            <SanityImage 
                            {...logo.node._rawLogo}
                            width={100}
                            config={{
                                saturation: "-100"
                            }}
                            sx={{
                                width: '100%',
                                height: '100%',
                                maxHeight: '300px',
                                objectFit: 'contain',
                            }}/>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default HomepageSponsors;