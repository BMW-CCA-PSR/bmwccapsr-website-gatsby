/** @jsxImportSource theme-ui */
import React from "react";
import { format, parseISO } from "date-fns";
import { getEventsUrl, getZundfolgeUrl } from "../lib/helpers";
import { Link } from "gatsby";
import { Heading, Text, Box, Card, Avatar, Flex } from "@theme-ui/components";
import SanityImage from 'gatsby-plugin-sanity-image';


function RelatedContent(props) {
    const { title, mainImage, slug, publishedAt, authors, category, startTime } = props;
    const isArticle = publishedAt ? true : false;
    var avatarImg = null
    const cat = category.title
    var authorString = null
    var cityState = null
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
    } else {
        cityState = props.address && props.address.city && props.address.state ? `${props.address.city}, ${props.address.state}` : "TBD"
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
                    <div sx={{position: "relative"}}>
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
                        {!isArticle && <Box sx={{
                            position: "absolute",
                            backgroundColor: "white",
                            height: "65px",
                            width: "60px",
                            alignContent: "center",
                            bottom: "20px",
                            right: "20px",
                            m: "auto",
                            borderBottom: "5px",
                            borderBottomStyle: "solid",
                            borderBottomColor: "highlight"
                          }}>
                            <div sx={{justifyContent: "center", textAlign: "center"}}>
                              <Text sx={{variant: "styles.h4", display: "block"}}>{format(parseISO(startTime), "MMM")}</Text>
                              <Text sx={{variant: "styles.h3", }}>{format(parseISO(startTime), "i")}</Text>
                            </div>
                          </Box>}
                    </div>
                    )}
                    </div>
                    <Box p={3}>
                        <Text sx={{ variant: 'text.label'}}>{cat}</Text>
                        <Heading sx={{ textDecoration: "none" }} variant="styles.h4">{title}</Heading>
                        {!isArticle && <Text sx={{variant: "styles.h5"}}>{cityState}</Text>}
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