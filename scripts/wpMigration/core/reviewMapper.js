const crypto = require('crypto');
const {decode} = require('html-entities');
const {htmlToPortableTextBlocks, blocksToPlainParagraphs} = require('./portableText');
const {inferAuthor} = require('./authors');

function toIsoOrNull(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function toTrackingKey(sourceType, sourceId, sourceUpdatedAt) {
  return `${sourceType}:${sourceId}:${sourceUpdatedAt || 'unknown'}`;
}

function contentHash(input) {
  return crypto.createHash('sha1').update(String(input || ''), 'utf8').digest('hex');
}

function studioSlugify(input) {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w/\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/(^[-/]+|[-/]+$)/g, '');
}

function toStudioPostSlug({ title, publishedAt }) {
  const publishedIso = toIsoOrNull(publishedAt) || new Date().toISOString();
  const datePrefix = publishedIso.substring(0, 7).split('-').join('/');
  const source = `${datePrefix}/${String(title || '').split(' ').join('-')}`;
  const slug = studioSlugify(source);
  return slug.length > 96 ? slug.slice(0, 96).replace(/[-/]+$/g, '') : slug;
}

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function cleanWordPressExcerptText(excerptHtml) {
  const decoded = decode(String(excerptHtml || ''));
  return decoded
    .replace(/\[[^\]]+\]/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getEmbeddedAuthorName(post) {
  const embedded = post && post._embedded;
  if (!embedded || !Array.isArray(embedded.author) || !embedded.author[0]) return null;
  return embedded.author[0].name || null;
}

function getFeaturedImageUrl(post, context) {
  const media = context && context.mediaById ? context.mediaById.get(post && post.featured_media) : null;
  return post.jetpack_featured_media_url || (media && media.source_url) || null;
}

function toDocumentIdSegment(value, fallback) {
  const slug = studioSlugify(value).replace(/\//g, '-').replace(/[^a-z0-9_-]+/g, '').trim();
  return slug || fallback;
}

function toImportedPostId(postId) {
  return `migration-post-${postId}`;
}

function toImportedAuthorId(authorName) {
  return `migration-author-${toDocumentIdSegment(authorName, 'unknown-author')}`;
}

function toImportedCategoryId(categoryId) {
  return `migration-category-${categoryId}`;
}

function mapPostToSanityDraft(post, context) {
  const title = decode(post?.title?.rendered || '').trim() || '(Untitled)';
  const publishedAt = toIsoOrNull(post?.date_gmt || post?.date) || new Date().toISOString();
  const slug = toStudioPostSlug({ title, publishedAt });
  const contentHtml = post?.content?.rendered || '';
  const excerptHtml = post?.excerpt?.rendered || '';

  const bodyBlocks = htmlToPortableTextBlocks(contentHtml, { field: 'body' });
  const bodyParagraphs = blocksToPlainParagraphs(bodyBlocks);
  const cleanedExcerptText = cleanWordPressExcerptText(excerptHtml);
  const excerptBlocks = cleanedExcerptText
    ? htmlToPortableTextBlocks(`<p>${escapeHtml(cleanedExcerptText)}</p>`, { field: 'excerpt' })
    : htmlToPortableTextBlocks(excerptHtml, { field: 'excerpt' });
  const excerptParagraphs = blocksToPlainParagraphs(excerptBlocks);

  const wpAuthorName = context.usersById.get(post.author) || getEmbeddedAuthorName(post) || null;
  const inferredAuthor = inferAuthor(wpAuthorName, bodyParagraphs);
  const primaryCategoryId = Array.isArray(post.categories) ? post.categories[0] : null;
  const categoryTitle = primaryCategoryId !== null ? context.categoriesById.get(primaryCategoryId) || null : null;
  const excerptText = excerptParagraphs[0] || cleanedExcerptText || '(No excerpt available)';
  const sourceUpdatedAt = toIsoOrNull(post?.modified_gmt || post?.modified || post?.date_gmt || post?.date);
  const trackingKey = toTrackingKey('post', post.id, sourceUpdatedAt);
  const sourceHash = contentHash(`${title}||${slug}||${contentHtml}`);
  const featuredImageUrl = getFeaturedImageUrl(post, context);

  return {
    tracking: {
      sourceType: 'post',
      sourceId: post.id,
      sourceUpdatedAt,
      sourceUrl: post.link || null,
      trackingKey,
      sourceHash,
    },
    wordpress: {
      id: post.id,
      authorId: post.author,
      categories: post.categories || [],
      featuredMediaId: post.featured_media,
      link: post.link,
      status: post.status,
    },
    mappingSummary: {
      title,
      slug,
      publishedAt,
      inferredAuthor,
      category: { wpId: primaryCategoryId, wpTitle: categoryTitle },
      featuredImageUrl,
      bodyParagraphCount: bodyParagraphs.length,
      excerptPreview: excerptText.slice(0, 220),
      bodyTail: bodyParagraphs.slice(-3),
    },
    sanityDraft: {
      _id: toImportedPostId(post.id),
      _type: 'post',
      title,
      publishedAt,
      slug: { _type: 'slug', current: slug },
      featured: Boolean(post.sticky),
      categoryTitle: categoryTitle || null,
      excerpt: excerptBlocks.length
        ? excerptBlocks
        : htmlToPortableTextBlocks(`<p>${excerptText}</p>`, { field: 'excerpt' }),
      authors: [
        {
          _type: 'authorReference',
          _key: `a${post.id}`,
          author: {
            _type: 'reference',
            _ref: toImportedAuthorId(inferredAuthor.name),
          },
        },
      ],
      category: primaryCategoryId ? { _type: 'reference', _ref: toImportedCategoryId(primaryCategoryId) } : null,
      body: bodyBlocks.length
        ? bodyBlocks
        : htmlToPortableTextBlocks('<p>(Body missing from source post)</p>', { field: 'body' }),
      mainImage: featuredImageUrl
        ? {
            _type: 'mainImage',
            caption: title,
            alt: title,
            sourceUrl: featuredImageUrl,
          }
        : null,
    },
    migrationNotes: [
      title.length > 32 ? 'Title exceeds current Sanity Studio validation max(32).' : null,
      !featuredImageUrl ? 'Missing featured image URL; Sanity schema currently requires mainImage.' : null,
      !primaryCategoryId ? 'Missing category; Sanity schema currently requires category reference.' : null,
      inferredAuthor.source !== 'wp-user' ? `Author inferred from body (${inferredAuthor.source}).` : null,
      /\[et_pb_|\[\//.test(contentHtml)
        ? 'Contains WP shortcodes/page-builder markup; conversion is best-effort.'
        : null,
    ].filter(Boolean),
  };
}

module.exports = {
  mapPostToSanityDraft,
};