const API_VERSION = '2023-08-01';

function normalizeValue(value) {
  return String(value || '').trim().toLowerCase();
}

function toDraftAndPublishedIds(documentId) {
  const raw = String(documentId || '').trim();
  if (!raw) return { draftId: 'drafts.__none__', publishedId: '__none__' };
  const publishedId = raw.replace(/^drafts\./, '');
  const draftId = `drafts.${publishedId}`;
  return { draftId, publishedId };
}

export function buildUniqueFieldValidator({ typeName, fieldPath, label }) {
  const query = `*[_type == $typeName && !(_id in [$draftId, $publishedId]) && defined(${fieldPath})]{_id, "value": ${fieldPath}}`;

  return async (value, context) => {
    const normalizedInput = normalizeValue(value);
    if (!normalizedInput) return true;

    const getClient = context && context.getClient;
    if (typeof getClient !== 'function') return true;

    const { draftId, publishedId } = toDraftAndPublishedIds(context && context.document && context.document._id);
    const client = getClient({ apiVersion: API_VERSION });
    const rows = await client.fetch(query, {
      typeName,
      draftId,
      publishedId,
    });

    const hasDuplicate = Array.isArray(rows)
      && rows.some((row) => normalizeValue(row && row.value) === normalizedInput);

    return hasDuplicate ? `${label} must be unique.` : true;
  };
}
