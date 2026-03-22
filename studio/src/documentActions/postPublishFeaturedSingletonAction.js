import { PublishIcon } from "@sanity/icons";
import { useClient, useDocumentOperation } from "sanity";

const API_VERSION = "2023-08-01";

function normalizeDocumentId(value) {
  return String(value || "").replace(/^drafts\./, "").trim();
}

function isFeatured(doc) {
  return !!(doc && doc.featured === true);
}

async function unsetFeaturedOnOtherPosts(client, currentBaseId) {
  const draftId = `drafts.${currentBaseId}`;
  const rows = await client.fetch(
    '*[_type == "post" && featured == true && _id != $publishedId && _id != $draftId]{_id}',
    { publishedId: currentBaseId, draftId }
  );

  if (!Array.isArray(rows) || rows.length === 0) return;

  const tx = client.transaction();
  rows.forEach((row) => {
    if (!row || !row._id) return;
    tx.patch(row._id, { set: { featured: false } });
  });
  await tx.commit();
}

export function PostPublishFeaturedSingletonAction(props) {
  const { id, type, draft, published, onComplete } = props;
  const { publish } = useDocumentOperation(id, type);
  const client = useClient({ apiVersion: API_VERSION });

  if (type !== "post") return null;

  const currentDoc = draft || published;
  const disabled = !draft || publish.disabled;

  const onHandle = async () => {
    try {
      if (isFeatured(currentDoc)) {
        const currentBaseId = normalizeDocumentId((currentDoc && currentDoc._id) || id);
        if (currentBaseId) {
          await unsetFeaturedOnOtherPosts(client, currentBaseId);
        }
      }

      publish.execute();
    } catch (error) {
      console.error("Failed to enforce featured singleton before publish:", error);
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
