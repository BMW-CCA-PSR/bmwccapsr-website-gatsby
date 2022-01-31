/** @jsxImportSource theme-ui */
import React from 'react';
import SanityImage from 'gatsby-plugin-sanity-image';
import { Heading, Flex } from '@theme-ui/components';
import { Link } from "gatsby";
import {BoxIcon, BoxIconFlipped} from './box-icons';
import BoxHeader from './BoxHeader';

const HomepageSponsors = (props) => {
    return (
        <div>
			<BoxHeader title='Our Partners'/>
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
                    props.edges.map((ad) => (
                        <Link
                            to={ad.node.href}
                            sx={{textDecoration: "none"}}
                        >
                            <SanityImage 
                            {...ad.node._rawLogo}
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
                        </Link>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default HomepageSponsors;