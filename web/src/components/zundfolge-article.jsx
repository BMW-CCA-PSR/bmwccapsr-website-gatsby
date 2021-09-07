/** @jsxImportSource theme-ui */
import { format, formatDistance, differenceInDays } from "date-fns";
import React from "react";
import { buildImageObj } from "../lib/helpers";
import { imageUrlFor } from "../lib/image-url";
import PortableText from "./portableText";
import AuthorList from "./author-list";
import { Container, Heading, Text, Flex, Box } from "@theme-ui/components";

function ZundfolgeArticle(props) {
  const { _rawBody, authors, categories, title, mainImage, publishedAt, edges } = props;
  var pubDate = publishedAt && (differenceInDays(new Date(publishedAt), new Date()) > 3
    ? formatDistance(new Date(publishedAt), new Date())
    : format(new Date(publishedAt), "MMMM do, yyyy"))
  var authorString = String(authors.map((author) => (` ${author.author.name}`)))

  return (
    <article>
      <Flex sx={{
        mt: "6rem",
        width: "100%",
        flexDirection: "row",
        mx: "auto",
      }}>
        <Flex sx={{
          maxWidth: 768,
          pl: "1rem",
          pt: "5rem",
          flexDirection: "column",
        }}>
          <Heading variant="text.heading">{title}</Heading>
          <Text>By <b>{authorString}</b> | {pubDate}</Text>
          {mainImage && mainImage.asset && (
            <div sx={{
              position: "relative",
            }}>
              <img
                src={imageUrlFor(buildImageObj(mainImage))
                  .width(1200)
                  .height(Math.floor((9 / 16) * 1200))
                  .fit("crop")
                  .auto("format")
                  .url()}
                alt={mainImage.alt}
                sx={{
                  width: "100%",
                  height: "100%"
                }}
              />
            </div>
          )}
          {_rawBody && <PortableText blocks={_rawBody} />}
          <aside>
            {authors && <AuthorList items={authors} title="Authors" />}
            {categories && (
              <div>
                <h3>Categories</h3>
                <ul>
                  {categories.map(category => (
                    <li key={category._id}>{category.title}</li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </Flex>
        <Box sx={{
          m: "1rem",
          mt: "5rem",
          height: "600px",
          width: "1px",
          backgroundColor: "lightgray",
          visibility: ["hidden", "visible"]
        }}>

        </Box>
        <Flex sx={{
          visibility: ["hidden", "visible"]
          }}>

        </Flex>
      </Flex>
    </article>
  );
}

export default ZundfolgeArticle;