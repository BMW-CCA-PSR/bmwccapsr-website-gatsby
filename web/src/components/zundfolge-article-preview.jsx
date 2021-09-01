import { format, parseISO } from "date-fns";
import { Link } from "gatsby";
import React from "react";
import { buildImageObj, cn, getZundfolgeUrl } from "../lib/helpers";
import { imageUrlFor } from "../lib/image-url";
import PortableText from "./portableText";

function ZundfolgeArticlePreview(props) {
  return (
    <Link
      to={getZundfolgeUrl(props.slug.current)}
    >
      <div >
        {props.mainImage && props.mainImage.asset && (
          <img
            src={imageUrlFor(buildImageObj(props.mainImage))
              .width(600)
              .height(Math.floor((9 / 16) * 600))
              .auto("format")
              .url()}
            alt={props.mainImage.alt}
          />
        )}
      </div>
      <div>
        <h3>{props.title}</h3>
        {props._rawExcerpt && (
          <div>
            <PortableText blocks={props._rawExcerpt} />
          </div>
        )}
        <div>{format(parseISO(props.publishedAt), "MMMM do, yyyy")}</div>
      </div>
    </Link>
  );
}

export default ZundfolgeArticlePreview;