/** @jsxImportSource theme-ui */
import { Link } from "gatsby";
import React from "react";


function SponsorPageGrid(props) {
    console.log(props)
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
        {props.edges &&
          props.edges.map(node => (
              <p>test</p>
          ))}
      </ul>
    </div>
  );
}


export default SponsorPageGrid;