/** @jsxImportSource theme-ui */
import React from "react";
import { getZundfolgeUrl } from "../lib/helpers";
import { Link } from "gatsby";
import { Container, Heading, Text, Flex, Box } from "@theme-ui/components";


function RelatedContent(props) {
    const { categories, title, mainImage, publishedAt, slug } = props;
    return (
        <content>
            <Flex
            sx ={{minWidth: "100px"}}>
                <Link to={getZundfolgeUrl(slug.current)} >{title}</Link>
            </Flex>
        </content>
    )
}


export default RelatedContent;