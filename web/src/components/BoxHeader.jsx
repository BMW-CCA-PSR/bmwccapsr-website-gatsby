/** @jsxImportSource theme-ui */
import React from 'react';
import {BoxIcon, BoxIconFlipped} from './box-icons';
import { Heading, Flex} from '@theme-ui/components';

function BoxHeader(props) {
    const title = props.title
    return (
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
                {props.title}
                </Heading>
            <BoxIconFlipped />
        </Flex>
    )
}

export default BoxHeader