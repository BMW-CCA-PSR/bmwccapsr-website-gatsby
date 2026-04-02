const sanityClient = require('@sanity/client');
const http = require('http');
const https = require('https');
const {getSanityConfig} = require('../utils/constants');
const {generateDefaultAvatarBuffer} = require('../utils/defaultAvatar');
const {generateArchiveCoverBuffer, DEFAULT_SUBHEADING, DEFAULT_TITLE} = require('../utils/archiveCoverImage');

function createSanityReadClient() {
  const config = getSanityConfig();
  return sanityClient.createClient({
    projectId: config.projectId,
    dataset: config.dataset,
    token: config.token || undefined,
    apiVersion: config.apiVersion,
    useCdn: true,
  });
}

function createSanityWriteClient() {
  const config = getSanityConfig();
  if (!config.token) {
    throw new Error('Missing SANITY_API_TOKEN or GATSBY_SANITY_TOKEN for write operations.');
  }

  return sanityClient.createClient({
    projectId: config.projectId,
    dataset: config.dataset,
    token: config.token,
    apiVersion: config.apiVersion,
    useCdn: false,
  });
}

async function createOrReplaceDocument(client, doc) {
  const normalizedDoc = normalizeMigrationDocumentIds(doc);

  // Ensure referenced category exists when custom category data is provided
  const docWithCategory = await ensureCategoryReferenceExists(client, normalizedDoc);

  // Ensure all referenced authors exist (create with default avatar if needed)
  const docWithAuthors = await ensureAuthorReferencesExist(client, docWithCategory);
  const docForWrite = stripImporterOnlyFields(docWithAuthors);
  
  const preparedWithMainImage = await hydrateMainImageAsset(client, docForWrite);
  const prepared = await hydrateInlineBodyImageAssets(client, preparedWithMainImage);
  return client.createOrReplace(prepared);
}

function stripImporterOnlyFields(doc) {
  const next = JSON.parse(JSON.stringify(doc || {}));
  if (!next || typeof next !== 'object') return next;

  // Used by migration logic to resolve category refs, but not part of the post schema.
  delete next.categoryTitle;

  return next;
}

function migrateLegacyPrefixedId(value, legacyPrefix, currentPrefix) {
  const raw = String(value || '').trim();
  if (!raw || !raw.startsWith(legacyPrefix)) return raw;
  return `${currentPrefix}${raw.slice(legacyPrefix.length)}`;
}

function normalizeMigrationDocumentIds(doc) {
  const next = JSON.parse(JSON.stringify(doc || {}));
  if (!next || typeof next !== 'object') return next;

  next._id = migrateLegacyPrefixedId(next._id, 'wp-post-', 'migration-post-') || next._id;

  if (next.category && next.category._ref) {
    next.category._ref = migrateLegacyPrefixedId(next.category._ref, 'wp-category-', 'migration-category-') || next.category._ref;
  }

  if (Array.isArray(next.authors)) {
    next.authors = next.authors.map((entry) => {
      if (!entry || !entry.author || !entry.author._ref) return entry;
      const authorRef = migrateLegacyPrefixedId(entry.author._ref, 'wp-author-', 'migration-author-') || entry.author._ref;
      return {
        ...entry,
        author: {
          ...entry.author,
          _ref: authorRef,
        },
      };
    });
  }

  return next;
}

function filenameFromUrl(url) {
  const pathname = new URL(url).pathname;
  const name = pathname.split('/').pop();
  return name || `image-${Date.now()}.jpg`;
}

function normalizeExternalImageUrl(rawValue) {
  const raw = String(rawValue || '').trim();
  if (!raw) {
    throw new Error('Image source URL is empty.');
  }

  const absoluteCandidate = raw.startsWith('//') ? `https:${raw}` : raw;
  try {
    return new URL(absoluteCandidate).toString();
  } catch (firstError) {
    try {
      return new URL(encodeURI(absoluteCandidate)).toString();
    } catch (secondError) {
      throw new Error(`Invalid image source URL: ${raw}`);
    }
  }
}

function buildPortableTextImageBlock(item, fallbackTitle, assetRef) {
  const sourceUrl = String(item && item.sourceUrl || '').trim();
  const fallbackAlt = sourceUrl
    ? filenameFromUrl(sourceUrl).replace(/[-_]/g, ' ').replace(/\.[^.]+$/, '').trim()
    : 'Image';
  const alt = String((item && (item.alt || item.caption)) || fallbackTitle || fallbackAlt || 'Image').trim();
  const caption = String((item && (item.caption || item.alt)) || fallbackTitle || '').trim();

  if (!assetRef) return null;

  return {
    _type: 'mainImage',
    _key: item && item._key,
    caption,
    alt: alt || fallbackAlt || 'Image',
    asset: {
      _type: 'reference',
      _ref: assetRef,
    },
  };
}

function formatArchiveDateLabel(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function isArchiveCategory(doc) {
  const categoryTitle = String(doc && doc.categoryTitle || '').trim().toLowerCase();
  const categoryRef = String(doc && doc.category && doc.category._ref || '').trim().toLowerCase();

  if (categoryTitle === 'archive') return true;
  if (categoryRef === 'migration-category-archive') return true;
  return /(^|[-_\s])archive($|[-_\s])/.test(categoryRef);
}

async function generateArchiveMainImageIfEligible(doc) {
  if (!isArchiveCategory(doc)) return null;

  const dateLabel = formatArchiveDateLabel(doc && doc.publishedAt);
  const buffer = await generateArchiveCoverBuffer({
    subheading: DEFAULT_SUBHEADING,
    title: DEFAULT_TITLE,
    dateLabel,
  });

  return {
    buffer,
    filename: `archive-cover-${dateLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`,
    contentType: 'image/png',
    alt: `${DEFAULT_TITLE} ${dateLabel}`,
    caption: `${DEFAULT_SUBHEADING} ${dateLabel}`,
  };
}

function requestBufferWithTlsFallback(urlString, timeoutMs = 20000) {
  const parsed = new URL(urlString);
  const client = parsed.protocol === 'https:' ? https : http;
  return new Promise((resolve, reject) => {
    const req = client.request(
      parsed,
      {
        method: 'GET',
        timeout: timeoutMs,
        rejectUnauthorized: false,
        headers: {
          Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
          'User-Agent': 'wp-migration-local-review-server/1.0',
        },
      },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve({
            ok: (res.statusCode || 0) >= 200 && (res.statusCode || 0) < 300,
            status: res.statusCode || 0,
            buffer,
            contentType: (res.headers && res.headers['content-type']) || undefined,
          });
        });
      }
    );

    req.on('timeout', () => req.destroy(new Error(`Request timed out (${timeoutMs}ms)`)));
    req.on('error', reject);
    req.end();
  });
}

async function downloadImageBuffer(sourceUrl, label) {
  const normalizedUrl = normalizeExternalImageUrl(sourceUrl);
  try {
    const response = await fetch(normalizedUrl, {
      redirect: 'follow',
      headers: {
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        'User-Agent': 'wp-migration-local-review-server/1.0',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return {
      buffer: Buffer.from(arrayBuffer),
      contentType: response.headers.get('content-type') || undefined,
      sourceUrl: normalizedUrl,
    };
  } catch (error) {
    if (!normalizedUrl.startsWith('https://')) {
      throw new Error(`Failed to download ${label} from ${normalizedUrl}: ${error.message || error}`);
    }

    try {
      const fallback = await requestBufferWithTlsFallback(normalizedUrl);
      if (!fallback.ok) {
        throw new Error(`HTTP ${fallback.status}`);
      }
      return {
        buffer: fallback.buffer,
        contentType: fallback.contentType,
        sourceUrl: normalizedUrl,
      };
    } catch (fallbackError) {
      throw new Error(`Failed to download ${label} from ${normalizedUrl}: ${fallbackError.message || error.message || error}`);
    }
  }
}

async function hydrateMainImageAsset(client, doc) {
  const next = JSON.parse(JSON.stringify(doc || {}));
  let image = next.mainImage;

  if (!image || typeof image !== 'object') {
    const generated = await generateArchiveMainImageIfEligible(next);
    if (!generated) return next;

    const asset = await client.assets.upload('image', generated.buffer, {
      filename: generated.filename,
      contentType: generated.contentType,
    });

    next.mainImage = buildPortableTextImageBlock(
      { alt: generated.alt, caption: generated.caption },
      next.title || '',
      asset._id
    );
    return next;
  }

  if (image.asset && image.asset._ref) {
    next.mainImage = buildPortableTextImageBlock(image, next.title || '', image.asset._ref) || next.mainImage;
    return next;
  }

  const sourceUrl = String(image.sourceUrl || '').trim();
  if (!sourceUrl) {
    const generated = await generateArchiveMainImageIfEligible(next);
    if (!generated) {
      throw new Error('Featured image is missing both asset reference and source URL.');
    }

    const asset = await client.assets.upload('image', generated.buffer, {
      filename: generated.filename,
      contentType: generated.contentType,
    });

    next.mainImage = buildPortableTextImageBlock(
      { alt: generated.alt, caption: generated.caption },
      next.title || '',
      asset._id
    );
    return next;
  }

  const downloaded = await downloadImageBuffer(sourceUrl, 'featured image');
  const asset = await client.assets.upload('image', downloaded.buffer, {
    filename: filenameFromUrl(downloaded.sourceUrl),
    contentType: downloaded.contentType,
  });

  next.mainImage = buildPortableTextImageBlock(image, next.title || '', asset._id);
  if (!next.mainImage || !next.mainImage.asset || !next.mainImage.asset._ref) {
    throw new Error('Featured image could not be converted into a valid Sanity image reference.');
  }

  return next;
}

async function hydrateInlineBodyImageAssets(client, doc) {
  const next = JSON.parse(JSON.stringify(doc || {}));
  if (!Array.isArray(next.body) || !next.body.length) return next;

  const uploadCache = new Map();

  async function resolveAssetRef(sourceUrl) {
    if (uploadCache.has(sourceUrl)) return uploadCache.get(sourceUrl);

    const downloaded = await downloadImageBuffer(sourceUrl, 'inline image');
    const asset = await client.assets.upload('image', downloaded.buffer, {
      filename: filenameFromUrl(downloaded.sourceUrl),
      contentType: downloaded.contentType,
    });

    uploadCache.set(sourceUrl, asset._id);
    return asset._id;
  }

  const hydratedBody = [];

  for (let index = 0; index < next.body.length; index += 1) {
    const item = next.body[index];
    if (!item || item._type !== 'mainImage') {
      hydratedBody.push(item);
      continue;
    }

    if (item.asset && item.asset._ref) {
      const hydrated = buildPortableTextImageBlock(item, next.title || '', item.asset._ref);
      if (hydrated) hydratedBody.push(hydrated);
      continue;
    }

    const sourceUrl = String(item.sourceUrl || '').trim();
    if (!sourceUrl) {
      console.warn(`Dropping inline image block ${item._key || index}: missing sourceUrl and asset ref`);
      continue;
    }

    try {
      const assetRef = await resolveAssetRef(sourceUrl);
      const hydrated = buildPortableTextImageBlock(item, next.title || '', assetRef);
      if (hydrated) {
        hydratedBody.push(hydrated);
      }
    } catch (error) {
      console.warn(
        `Dropping inline image block ${item._key || index}: ${error.message || error}`
      );
    }
  }

  next.body = hydratedBody;

  return next;
}

async function fetchSanityAuthors(client) {
  const query = '*[_type == "author"] | order(coalesce(name, title, _id) asc) { _id, name, title }';
  const rows = await client.fetch(query);
  return (Array.isArray(rows) ? rows : []).map((row) => ({
    _id: row && row._id ? String(row._id) : '',
    name: String((row && (row.name || row.title)) || '').trim() || String((row && row._id) || ''),
  })).filter((row) => row._id);
}

async function fetchSanityCategories(client) {
  const query = '*[_type == "category"] | order(coalesce(title, name, _id) asc) { _id, title, name }';
  const rows = await client.fetch(query);
  return (Array.isArray(rows) ? rows : []).map((row) => ({
    _id: row && row._id ? String(row._id) : '',
    title: String((row && (row.title || row.name)) || '').trim() || String((row && row._id) || ''),
  })).filter((row) => row._id);
}

/**
 * Cache for the default author avatar asset ID to avoid re-uploading
 */
let defaultAvatarAssetId = null;

/**
 * Get or upload the default author avatar
 * @param {Object} client - Sanity write client
 * @returns {Promise<string>} Asset ID of the default avatar
 */
async function getOrUploadDefaultAvatar(client) {
  if (defaultAvatarAssetId) {
    return defaultAvatarAssetId;
  }

  try {
    const buffer = generateDefaultAvatarBuffer();
    const asset = await client.assets.upload('image', buffer, {
      filename: 'default-author-avatar.svg',
      contentType: 'image/svg+xml',
    });
    defaultAvatarAssetId = asset._id;
    return asset._id;
  } catch (error) {
    throw new Error(`Failed to upload default author avatar: ${error.message}`);
  }
}

/**
 * Check if an author document exists
 * @param {Object} client - Sanity read client
 * @param {string} authorId - Author document ID
 * @returns {Promise<boolean>} True if author exists
 */
async function authorExists(client, authorId) {
  if (!authorId) return false;
  try {
    const query = '*[_id == $id]';
    const results = await client.fetch(query, { id: authorId });
    return Array.isArray(results) && results.length > 0;
  } catch (error) {
    return false;
  }
}

function toTitleCase(value) {
  return String(value || '')
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function deriveAuthorNameFromId(authorId) {
  const raw = String(authorId || '').trim();
  if (!raw) return '';
  const withoutPrefix = raw
    .replace(/^wp-author-/, '')
    .replace(/^migration-author-/, '');
  const words = withoutPrefix
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!words) return '';
  return toTitleCase(words);
}

function normalizeAuthorNameForMatch(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function buildExistingAuthorNameMap(authors) {
  const map = new Map();
  (Array.isArray(authors) ? authors : []).forEach((author) => {
    const normalized = normalizeAuthorNameForMatch(author && author.name);
    if (!normalized || map.has(normalized)) return;
    map.set(normalized, author);
  });
  return map;
}

function normalizeCategoryTitleForMatch(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function findMatchingSanityCategoryByTitle(categories, title) {
  const normalizedTitle = normalizeCategoryTitleForMatch(title);
  if (!normalizedTitle) return null;

  return (Array.isArray(categories) ? categories : []).find(
    (category) => normalizeCategoryTitleForMatch(category && category.title) === normalizedTitle
  ) || null;
}

function deriveCategoryTitleFromRef(categoryRef) {
  const raw = String(categoryRef || '').trim();
  if (!raw) return '';

  const withoutPrefix = raw
    .replace(/^migration-category-/, '')
    .replace(/^wp-category-/, '');
  const words = withoutPrefix
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!words) return '';

  return toTitleCase(words);
}

/**
 * Create an author document if it doesn't exist
 * @param {Object} client - Sanity write client
 * @param {string} authorId - Author document ID
 * @param {string} authorName - Author name
 * @returns {Promise<Object>} Created or existing author document
 */
async function createAuthorIfNeeded(client, authorId, authorName) {
  if (!authorId) {
    throw new Error('Author ID is required.');
  }

  const exists = await authorExists(client, authorId);
  if (exists) {
    return { _id: authorId, _type: 'author' };
  }

  const defaultAvatarId = await getOrUploadDefaultAvatar(client);
  const providedName = String(authorName || '').trim();
  const displayName = providedName || deriveAuthorNameFromId(authorId) || authorId;

  const author = {
    _id: authorId,
    _type: 'author',
    name: displayName,
    image: {
      _type: 'mainImage',
      caption: `Default avatar for ${displayName}`,
      alt: `Avatar for ${displayName}`,
      asset: {
        _type: 'reference',
        _ref: defaultAvatarId,
      },
    },
    bio: [],
  };

  return client.create(author);
}

async function createCategoryIfNeeded(client, categoryId, categoryTitle) {
  if (!categoryId) {
    throw new Error('Category ID is required.');
  }

  const exists = await authorExists(client, categoryId);
  if (exists) {
    return { _id: categoryId, _type: 'category' };
  }

  const title = String(categoryTitle || '').trim() || categoryId;
  const category = {
    _id: categoryId,
    _type: 'category',
    title,
  };

  return client.create(category);
}

async function ensureCategoryReferenceExists(client, doc) {
  const next = JSON.parse(JSON.stringify(doc || {}));
  const categoryRef = next && next.category && next.category._ref
    ? String(next.category._ref).trim()
    : '';

  if (!categoryRef) return next;

  const exists = await authorExists(client, categoryRef);
  if (exists) return next;

  const customTitle = String(next.categoryTitle || '').trim() || deriveCategoryTitleFromRef(categoryRef);
  if (!customTitle) {
    return next;
  }

  const existingCategories = await fetchSanityCategories(client);
  const matchedCategory = findMatchingSanityCategoryByTitle(existingCategories, customTitle);
  if (matchedCategory && matchedCategory._id) {
    next.category._ref = matchedCategory._id;
    return next;
  }

  await createCategoryIfNeeded(client, categoryRef, customTitle);
  return next;
}

/**
 * Ensure all referenced authors in a document exist, creating them if necessary
 * @param {Object} client - Sanity write client
 * @param {Object} doc - Document being imported
 * @returns {Promise<Object>} Updated document with guaranteed author references
 */
async function ensureAuthorReferencesExist(client, doc) {
  const next = JSON.parse(JSON.stringify(doc || {}));
  
  if (!Array.isArray(next.authors) || next.authors.length === 0) {
    return next;
  }

  const existingAuthors = await fetchSanityAuthors(client);
  const existingAuthorNameMap = buildExistingAuthorNameMap(existingAuthors);

  for (const authorRef of next.authors) {
    if (!authorRef || !authorRef.author || !authorRef.author._ref) {
      continue;
    }

    const authorId = authorRef.author._ref;
    const authorName = deriveAuthorNameFromId(authorId);
    const matchedAuthor = existingAuthorNameMap.get(normalizeAuthorNameForMatch(authorName));

    if (matchedAuthor && matchedAuthor._id) {
      authorRef.author._ref = matchedAuthor._id;
      continue;
    }

    try {
      await createAuthorIfNeeded(client, authorId, authorName);
    } catch (error) {
      console.error(`Warning: Could not create author ${authorId}: ${error.message}`);
      // Don't throw - continue importing but log the issue
    }
  }

  return next;
}

/**
 * Ensure an author document has an image (applies default if missing)
 * Can be used for any author, whether created via import or studio
 * @param {Object} client - Sanity write client
 * @param {string} authorId - Author document ID
 * @returns {Promise<Object>} Updated author document
 */
async function ensureAuthorHasImage(client, authorId) {
  if (!authorId) {
    throw new Error('Author ID is required.');
  }

  try {
    // Fetch the author
    const query = '*[_id == $id][0]';
    const author = await client.fetch(query, { id: authorId });
    
    if (!author) {
      throw new Error(`Author not found: ${authorId}`);
    }

    // If author already has an image, we're done
    if (author.image && author.image.asset && author.image.asset._ref) {
      return author;
    }

    // Author is missing image - apply default
    const defaultAvatarId = await getOrUploadDefaultAvatar(client);
    
    const patched = await client
      .patch(authorId)
      .set({
        image: {
          _type: 'mainImage',
          caption: `Default avatar for ${author.name}`,
          alt: `Avatar for ${author.name}`,
          asset: {
            _type: 'reference',
            _ref: defaultAvatarId,
          },
        },
      })
      .commit();

    return patched;
  } catch (error) {
    throw new Error(`Failed to ensure author has image: ${error.message}`);
  }
}

// ─── Event document pipeline ────────────────────────────────────────────────

async function fetchSanityEventCategories(client) {
  return client.fetch('*[_type == "eventCategory"]{ _id, title }');
}

async function ensureEventCategoryReferenceExists(client, doc) {
  const next = JSON.parse(JSON.stringify(doc || {}));
  const categoryRef = next && next.category && next.category._ref
    ? String(next.category._ref).trim()
    : '';

  if (!categoryRef) return next;

  const exists = await authorExists(client, categoryRef);
  if (exists) return next;

  const customTitle = String(next.categoryTitle || '').trim();
  if (!customTitle) return next;

  const existingCategories = await fetchSanityEventCategories(client);
  const match = existingCategories.find(
    (c) => String(c.title || '').trim().toLowerCase() === customTitle.toLowerCase()
  );
  if (match && match._id) {
    next.category._ref = match._id;
    return next;
  }

  await client.createIfNotExists({
    _id: categoryRef,
    _type: 'eventCategory',
    title: customTitle,
  });
  return next;
}

/**
 * Write pipeline for events (skips author hydration; uses eventCategory upsert).
 */
async function createOrReplaceEventDocument(client, doc) {
  const docWithCategory = await ensureEventCategoryReferenceExists(client, doc);
  const docForWrite = stripImporterOnlyFields(docWithCategory);
  const preparedWithMainImage = await hydrateMainImageAsset(client, docForWrite);
  const prepared = await hydrateInlineBodyImageAssets(client, preparedWithMainImage);
  return client.createOrReplace(prepared);
}

module.exports = {
  createSanityReadClient,
  createSanityWriteClient,
  createOrReplaceDocument,
  createOrReplaceEventDocument,
  fetchSanityAuthors,
  fetchSanityCategories,
  fetchSanityEventCategories,
  getOrUploadDefaultAvatar,
  authorExists,
  createAuthorIfNeeded,
  createCategoryIfNeeded,
  ensureAuthorReferencesExist,
  ensureCategoryReferenceExists,
  ensureEventCategoryReferenceExists,
  ensureAuthorHasImage,
};