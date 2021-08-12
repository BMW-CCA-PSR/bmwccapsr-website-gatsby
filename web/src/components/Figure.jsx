import React from "react";
import {GatsbyImage} from 'gatsby-plugin-image'
import {getGatsbyImageData} from 'gatsby-source-sanity'
import clientConfig from "../../client-config";

export default ({ node }) => {
  if (!node || !node.asset || !node.asset._id) {
    return null;
  }
  const fluidProps = getGatsbyImageData(node.asset._id, { maxWidth: 675 }, clientConfig.sanity);
  return (
    <figure>
      <GatsbyImage fluid={fluidProps} alt={node.alt} />
      <figcaption>{node.caption}</figcaption>
    </figure>
  );
};