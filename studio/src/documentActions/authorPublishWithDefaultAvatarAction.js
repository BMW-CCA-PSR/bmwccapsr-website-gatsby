import { PublishIcon } from "@sanity/icons";
import { useClient, useDocumentOperation } from "sanity";

const API_VERSION = "2023-08-01";
const DEFAULT_AVATAR_FILENAME = "default-author-avatar-v2.svg";

function buildDefaultAvatarSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
  <rect width="256" height="256" fill="#c5c8ce"/>
  <g fill="#707984">
    <circle cx="128" cy="79.36" r="40.96"/>
    <circle cx="128" cy="261.12" r="110.08"/>
  </g>
</svg>`;
}

function hasImageRef(doc) {
  return !!(doc && doc.image && doc.image.asset && doc.image.asset._ref);
}

async function getOrCreateDefaultAvatarAssetId(client) {
  const existing = await client.fetch(
    '*[_type == "sanity.imageAsset" && originalFilename == $filename][0]{_id}',
    { filename: DEFAULT_AVATAR_FILENAME }
  );
  if (existing && existing._id) return existing._id;

  const svg = buildDefaultAvatarSvg();
  const file = new File([svg], DEFAULT_AVATAR_FILENAME, { type: "image/svg+xml" });
  const uploaded = await client.assets.upload("image", file, {
    filename: DEFAULT_AVATAR_FILENAME,
    contentType: "image/svg+xml",
  });
  return uploaded._id;
}

export function AuthorPublishWithDefaultAvatarAction(props) {
  const { id, type, draft, published, onComplete } = props;
  const { publish } = useDocumentOperation(id, type);
  const client = useClient({ apiVersion: API_VERSION });

  if (type !== "author") return null;

  const currentDoc = draft || published;
  const disabled = !draft || publish.disabled;

  const onHandle = async () => {
    try {
      if (!hasImageRef(currentDoc)) {
        const assetId = await getOrCreateDefaultAvatarAssetId(client);
        const displayName = String((currentDoc && currentDoc.name) || "Author").trim() || "Author";

        // Patch the draft document explicitly and wait for commit before publishing.
        const targetId = (draft && draft._id) || `drafts.${id}`;
        await client
          .patch(targetId)
          .set({
            image: {
              _type: "mainImage",
              caption: `Default avatar for ${displayName}`,
              alt: `Avatar for ${displayName}`,
              asset: {
                _type: "reference",
                _ref: assetId,
              },
            },
          })
          .commit();
      }

      publish.execute();
    } catch (error) {
      console.error("Failed to publish author with default avatar:", error);
    } finally {
      if (typeof onComplete === "function") onComplete();
    }
  };

  return {
    label: "Publish",
    icon: PublishIcon,
    disabled,
    shortcut: "mod+shift+p",
    onHandle,
  };
}