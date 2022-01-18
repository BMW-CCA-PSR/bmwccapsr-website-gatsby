/** @jsxImportSource theme-ui */
import React from "react";
import { buildImageObj, getEventsUrl, getZundfolgeUrl } from "../lib/helpers";
import { Link } from "gatsby";
import { imageUrlFor } from "../lib/image-url";
import { Heading, Text, Box, Card } from "@theme-ui/components";


function RelatedContent(props) {
    const { categories, title, mainImage, slug, publishedAt } = props;
    const isArticle = publishedAt ? true : false;
    return (
        <Link
        to={isArticle ? getZundfolgeUrl(slug.current) : getEventsUrl(slug.current)}
        sx={{textDecoration: "none"}}
        >
            <Card
            sx ={{
                textDecoration: "none",
                color: "text",
                backgroundColor: "lightgrey",
                maxWidth: "300px",
                minWidth: "200px",
                mx: "auto",
                mb: "1rem",
                borderRadius: "8px"
                }}>
                    <div>
                    {mainImage && mainImage.asset && (
                        <img
                        src={imageUrlFor(buildImageObj(mainImage))
                            .width(300)
                            .height(Math.floor((9 / 16) * 300))
                            .fit("crop")
                            .auto("format")
                            .url()}
                        alt={mainImage.alt}
                        sx={{
                            borderTopRightRadius: "8px",
                            borderTopLeftRadius: "8px",
                            width: "100%",
                            height: "100%"
                        }}
                        />
                    )}
                    </div>
                    <Box p={3}>
                        <Heading sx={{ textDecoration: "none" }} variant="styles.h4">{title}</Heading>
                    </Box>
            </Card>
        </Link>
    )
}


export default RelatedContent;