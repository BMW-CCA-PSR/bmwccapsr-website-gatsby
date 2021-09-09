/** @jsxImportSource theme-ui */
import { Link } from "gatsby";
import React from "react";
import { Heading } from "theme-ui"
import EventPagePreview from "./event-page-preview";

function EventPagePreviewGrid(props) {
  return (
    <div sx={{
      px: "1rem",
      pt: "3rem",
    }}>
      <Heading sx={{
        variant: "styles.h1",
        pb: "1rem"
        }}>Events</Heading>
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
            <li
              key={node.id}>
              <EventPagePreview {...node} isInList />
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

EventPagePreviewGrid.defaultProps = {
  title: "",
  nodes: [],
  browseMoreHref: ""
};

export default EventPagePreviewGrid;