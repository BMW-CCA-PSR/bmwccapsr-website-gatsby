/** @jsxImportSource theme-ui */
import { format, formatDistance, differenceInDays } from "date-fns";
import React from "react";
import { buildImageObj } from "../lib/helpers";
import { imageUrlFor } from "../lib/image-url";
import PortableText from "./portableText";
import AuthorList from "./author-list";
import VerticalLine from "./vertical-line";
import { Container, Heading, Text, Flex, Box } from "@theme-ui/components";
import RelatedContent from "./related-content";

function ZundfolgeArticle(props) {
  const { _rawBody, authors, categories, title, mainImage, publishedAt, next, prev } = props;
  console.log(next)
  console.log(prev)
  var pubDate = publishedAt && (differenceInDays(new Date(publishedAt), new Date()) > 3
    ? formatDistance(new Date(publishedAt), new Date())
    : format(new Date(publishedAt), "MMMM do, yyyy"))
  var authorString = String(authors.map((author) => (` ${author.author.name}`)))

  return (
    <article>
      <Flex sx={{
        mt: "6rem",
        pt: "3rem",
        width: "100%",
        flexDirection: "row",
        mx: "auto",
      }}>
        <Flex sx={{
          //maxWidth: 768,
          px: "1rem",
          flexDirection: "column",
        }}>
          <Heading variant="styles.h1">{title}</Heading>
          <Text sx={{variant: "stypes.p", py: "1rem"}}>By <b>{authorString}</b> | {pubDate}</Text>
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
        <div sx={{
          display: ["none", "flex"],
          mx: "auto",
          }}>
          <VerticalLine height="600"/>
          <div sx={{
            mx: "auto",
            px: "1rem"
          }}>
            <Heading variant="styles.h3">Related Content</Heading>
            {next && <RelatedContent {...next} />}
            {prev && <RelatedContent {...prev} />}
          </div>
        </div>  
      </Flex>
    </article>
  );
}

export default ZundfolgeArticle;