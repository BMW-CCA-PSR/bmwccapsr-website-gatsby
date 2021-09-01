import { Link } from "gatsby";
import React from "react";
import ZundfolgeArticlePreview from "./zundfolge-article-preview";

function ZundfolgeArticlePreviewGrid(props) {
  return (
    <div>
      {props.title && <h2>{props.title}</h2>}
      <ul>
        {props.nodes &&
          props.nodes.map(node => (
            <li key={node.id}>
              <ZundfolgeArticlePreview {...node} isInList />
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