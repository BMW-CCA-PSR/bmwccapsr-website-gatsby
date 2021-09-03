/** @jsxImportSource theme-ui */
import { format, formatDistance, differenceInDays } from "date-fns";
import React from "react";
import { buildImageObj } from "../lib/helpers";
import { imageUrlFor } from "../lib/image-url";
import PortableText from "./portableText";
import AuthorList from "./author-list";
import { Container, Heading, Text } from "@theme-ui/components";

function ZundfolgeArticle(props) {
  const { _rawBody, authors, categories, title, mainImage, publishedAt } = props;
  var pubDate = publishedAt && (differenceInDays(new Date(publishedAt), new Date()) > 3
        ? formatDistance(new Date(publishedAt), new Date())
        : format(new Date(publishedAt), "MMMM do, yyyy"))
  return (
    <article>
      <Container sx={{
        mt: "8rem",
        ml: "7rem"
      }}>
        <div>
          <div>
          <Heading variant="text.heading">{title}</Heading>
          <Text>By <b>{authors.map((author) => (author.author.name))}</b> | {pubDate}</Text>
            {mainImage && mainImage.asset && (
              <div sx={{ml: "-7rem", mt: "3rem"}}>
                <img
                  src={imageUrlFor(buildImageObj(mainImage))
                    .width(1200)
                    .height(Math.floor((9 / 20) * 1200))
                    .fit("crop")
                    .auto("format")
                    .url()}
                  alt={mainImage.alt}
                />
              </div>
            )}


            {_rawBody && <PortableText blocks={_rawBody} />}
          </div>
          <aside>
            {publishedAt && (
              <div>
                {pubDate}
              </div>
            )}
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
        </div>
      </Container>
    </article>
  );
}

export default ZundfolgeArticle;