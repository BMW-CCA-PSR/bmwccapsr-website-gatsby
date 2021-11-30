/** @jsxImportSource theme-ui */
import { Link } from "gatsby";
import React from "react";
import EventPagePreview from "./event-page-preview";

function EventPagePreviewGrid(props) {
  return (
    <div>
      <ul sx={{
        listStyle: 'none',
        display: 'grid',
        gridGap: 3,
        gridTemplateColumns: 'repeat(auto-fit, minmax(256px, 1fr))',
        m: 0,
        p: 0
      }}>
        {props.nodes &&
          props.nodes.map(node => (
              <EventPagePreview {...node} isInList />
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

EventPagePreviewGrid.defaultProps = {
  title: "",
  nodes: [],
  browseMoreHref: ""
};

export default EventPagePreviewGrid;