/** @jsxImportSource theme-ui */
import React from "react";
import { buildImageObj, getEventsUrl, getZundfolgeUrl } from "../lib/helpers";
import { Link } from "gatsby";
import { imageUrlFor } from "../lib/image-url";
import { Heading, Text, Box, Card, Avatar, Flex } from "@theme-ui/components";
import SanityImage from 'gatsby-plugin-sanity-image';


function RelatedContent(props) {
    const { title, mainImage, slug, publishedAt, authors, category } = props;
    const isArticle = publishedAt ? true : false;
    var avatarImg = null
    const cat = category.title
    var authorString = null
    if (isArticle){
        authorString = String(authors.map((author) => ` ${author.author.name}`));
        // commenting out author avatar on related content for now - 1/24/22
        //
        // avatarImg = authors[0].author.image && imageUrlFor(authors[0].author.image)
        //     .width(48)
        //     .height(48)
        //     .fit("fill")
        //     .auto("format")
        //     .url()
    }
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
                        <SanityImage
                            {...mainImage}
                            width={600}
                            sx={{
                                width: '100%',
                                height: '100%',
                                maxHeight: '200px',
                                objectFit: 'cover',
                                borderTopLeftRadius: "8px",
                                borderTopRightRadius: "8px"
                            }}
                        />
                    )}
                    </div>
                    <Box p={3}>
                        <Text sx={{ variant: 'text.label'}}>{cat}</Text>
                        <Heading sx={{ textDecoration: "none" }} variant="styles.h4">{title}</Heading>
                        {/* <Flex sx={{py:"0.5rem"}}>
						  <Avatar src={avatarImg} sx={{minWidth: "48px", maxHeight: "48px"}}/>
						  <Text sx={{variant: "stypes.p", py: "1rem", px: "0.5rem"}}>{authorString}</Text>
					  </Flex> */}
                    </Box>
            </Card>
        </Link>
    )
}


export default RelatedContent;