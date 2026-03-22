function normalizeWhitespace(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .trim();
}

function sanitizeAuthorName(value) {
  const cleaned = normalizeWhitespace(value)
    .replace(/^by\s+/i, '')
    .replace(/^author\s*[:\-]\s*/i, '')
    .replace(/^written\s+by\s+/i, '')
    .replace(/[|•].*$/, '')
    .trim();

  if (!cleaned || cleaned.length < 2 || cleaned.length > 80) return null;
  return cleaned;
}

function inferAuthorFromBody(paragraphs) {
  const tail = paragraphs.slice(-3);
  const roleWords = /instructor|editor|president|director|manager|chair|chief|co-chief|staff writer|communications|department/i;

  const isLikelyPersonName = (line) => {
    if (!line || roleWords.test(line)) return false;
    if (!/^[A-Z][A-Za-z .,'&-]{2,80}$/.test(line)) return false;
    const words = line.split(' ').filter(Boolean);
    if (words.length < 2 || words.length > 5) return false;
    return words.every((word) => /^[A-Z][A-Za-z.'-]*$/.test(word));
  };

  for (let i = tail.length - 1; i >= 0; i -= 1) {
    const line = normalizeWhitespace(tail[i]);
    if (!line) continue;

    const byMatch = line.match(/^(?:by|author|written by)\s+(.+)$/i);
    if (byMatch) {
      const name = sanitizeAuthorName(byMatch[1]);
      if (name) return { name, source: 'body-tail-byline', confidence: 'high', line };
    }

    if (/press|communications|newsroom|staff/i.test(line)) {
      const name = sanitizeAuthorName(line);
      if (name) return { name, source: 'body-tail-organization', confidence: 'medium', line };
    }
  }

  for (let i = tail.length - 1; i >= 0; i -= 1) {
    const line = normalizeWhitespace(tail[i]);
    if (!isLikelyPersonName(line)) continue;
    const name = sanitizeAuthorName(line);
    if (name) return { name, source: 'body-tail-signature', confidence: 'high', line };
  }

  for (let i = tail.length - 1; i >= 0; i -= 1) {
    const line = normalizeWhitespace(tail[i]);
    if (!line) continue;
    if (/^[A-Z][A-Za-z .,'&-]{2,80}$/.test(line) && line.split(' ').length <= 6) {
      const name = sanitizeAuthorName(line);
      if (name) return { name, source: 'body-tail-signature', confidence: 'medium', line };
    }
  }

  return null;
}

function inferAuthor(wpAuthorName, paragraphs) {
  const bodyInference = inferAuthorFromBody(paragraphs);
  if (bodyInference) return bodyInference;
  const fallback = sanitizeAuthorName(wpAuthorName);
  if (fallback) return { name: fallback, source: 'wp-user', confidence: 'medium', line: null };
  return { name: 'Unknown Author', source: 'fallback-unknown', confidence: 'low', line: null };
}

module.exports = {
  inferAuthor,
};