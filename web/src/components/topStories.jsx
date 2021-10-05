/** @jsxImportSource theme-ui */
import React from "react";
import { Box } from "@theme-ui/components";
import { StaticQuery, graphql } from 'gatsby'

  const TopStories = (props) => {
    return (
        <StaticQuery
         query={graphql`
         query topStoriesQuery {
            post: allSanityPost(
              filter: {slug: {current: {ne: null}}, isPublished: {eq: true}}
              sort: {fields: [publishedAt], order: DESC}
            ) {
              edges {
                node {
                  id
                  publishedAt
                  slug {
                    current
                  }
                }
              }
            }
          }
          `}
          render={data => (
            <div>
            {data.post.edges.map((edge) => (
              <h1>{edge.node.slug.current}</h1>
            ))}
            </div>
          )}
        />
    )
}
export default TopStories;