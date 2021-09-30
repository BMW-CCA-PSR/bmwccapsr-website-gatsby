/** @jsxImportSource theme-ui */
import { Link } from "gatsby";
import React from "react";
import ZundfolgeArticlePreview from "./zundfolge-article-preview";

function ZundfolgeArticlePreviewGrid(props) {
  return (
    <div>
      <ul sx={{
        listStyle: 'none',
        display: 'grid',
        gridGap: 3,
        gridTemplateColumns: 'repeat(auto-fit, minmax(256px, 1fr))',
        gridAutoRows: "minmax(50px, 250px)",
        m: 0,
        p: 0
      }}>
        {props.nodes &&
          props.nodes.map(node => (
            <li
              key={node.id}>
              <ZundfolgeArticlePreview {...node} />
            </li>
          ))}
      </ul>
      {props.browseMoreHref && (
        <div>
          <Link to={props.browseMoreHref}>Browse more</Link>
        </div>
      )}
    </div>
  );
}

ZundfolgeArticlePreviewGrid.defaultProps = {
  title: "",
  nodes: [],
  browseMoreHref: ""
};

export default ZundfolgeArticlePreviewGrid;