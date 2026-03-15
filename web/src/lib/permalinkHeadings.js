export const slugifyHeadingText = (value) => {
  const normalized = String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");

  const slug = normalized
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || "section";
};

export const getPortableTextBlockText = (block) => {
  if (!block || !Array.isArray(block.children)) return "";

  return block.children
    .map((child) => child?.text || "")
    .join("")
    .trim();
};

export const buildPortableTextHeadingIds = (blocks) => {
  const counts = new Map();
  const ids = {};

  (Array.isArray(blocks) ? blocks : []).forEach((block) => {
    if (!block || block._type !== "block") return;
    if (!["h2", "h3", "h4"].includes(block.style)) return;

    const text = getPortableTextBlockText(block);
    if (!text) return;

    const baseId = slugifyHeadingText(text);
    const nextCount = (counts.get(baseId) || 0) + 1;
    counts.set(baseId, nextCount);

    ids[block._key] = nextCount === 1 ? baseId : `${baseId}-${nextCount}`;
  });

  return ids;
};
