const crypto = require('crypto');
const { decode } = require('html-entities');
const { htmlToPortableTextBlocks } = require('./portableText');

function contentHash(input) {
  return crypto.createHash('sha1').update(String(input || ''), 'utf8').digest('hex');
}

function studioSlugify(input) {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w/\-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/(^[-/]+|[-/]+$)/g, '');
}

function toEventSlug({ title, startTime }) {
  const datePrefix = String(startTime || '').slice(0, 7).replace('-', '/') || 'unknown/unknown';
  const slug = studioSlugify(`${datePrefix}/${title || 'event'}`);
  return slug.length > 96 ? slug.slice(0, 96).replace(/[-/]+$/, '') : slug;
}

/**
 * "2017-10-25 18:00:00" → "2017-10-25T18:00:00.000Z"
 * The tribe/events/v1 API returns dates as local time strings; the sample event
 * shows timezone: "UTC+0", so we treat them as UTC.
 */
function tribeLocalDateToIso(value) {
  if (!value) return null;
  const normalized = String(value).trim().replace(' ', 'T') + '.000Z';
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function tribeLocalDateToDateStr(value) {
  if (!value) return null;
  return String(value).slice(0, 10);
}

function decodeHtmlTitle(raw) {
  return decode(String(raw || '').replace(/<[^>]+>/g, '')).trim();
}

function parseEventCost(event) {
  const vals = event.cost_details && Array.isArray(event.cost_details.values)
    ? event.cost_details.values
    : [];
  if (vals.length > 0) {
    const n = Number(vals[0]);
    return Number.isFinite(n) ? n : 0;
  }
  const rawCost = String(event.cost || '').trim();
  if (!rawCost) return undefined;
  const n = parseFloat(rawCost.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function buildAddress(venue) {
  if (!venue) return undefined;
  const line1 = String(venue.address || '').trim();
  const city = String(venue.city || '').trim();
  if (!line1 && !city) return undefined;
  const out = {};
  if (line1) out.line1 = line1;
  if (city) out.city = city;
  const state = String(venue.stateprovince || venue.state || '').trim();
  if (state) out.state = state;
  const postalCode = String(venue.zip || '').trim();
  if (postalCode) out.postalCode = postalCode;
  return out;
}

async function mapTribeEventToSanityDraft(event) {
  const id = event.id;
  const title = decodeHtmlTitle(event.title);
  const startTime = tribeLocalDateToIso(event.start_date);
  const endTime = tribeLocalDateToIso(event.end_date);
  const slugCurrent = toEventSlug({ title, startTime });

  // Category — use the first tribe_events_cat entry
  const firstCat = Array.isArray(event.categories) && event.categories.length > 0
    ? event.categories[0]
    : null;
  const categoryTitle = firstCat ? decodeHtmlTitle(firstCat.name) : '';
  const categorySlug = firstCat ? String(firstCat.slug || '').trim() : '';
  const categoryRef = categorySlug
    ? `migration-event-category-${studioSlugify(categorySlug)}`
    : null;

  // Body — strip Divi shortcodes before conversion (removeWordPressShortcodes runs inside
  // htmlToPortableTextBlocks already, but description may have double-encoded entities too)
  let body = [];
  if (event.description) {
    try {
      body = await htmlToPortableTextBlocks(decode(String(event.description)), 'body');
    } catch (_) {
      body = [];
    }
  }

  // Excerpt
  let excerpt = [];
  if (event.excerpt) {
    try {
      excerpt = await htmlToPortableTextBlocks(String(event.excerpt), 'excerpt');
    } catch (_) {
      excerpt = [];
    }
  }

  // Featured image — tribe API embeds image.url directly on the event object
  const imageUrl = event.image && event.image.url ? String(event.image.url).trim() : '';
  const mainImage = imageUrl
    ? { _type: 'mainImage', sourceUrl: imageUrl, alt: title, caption: '' }
    : null;

  // Venue
  const venueName = event.venue
    ? decode(String(event.venue.venue || '').replace(/&#0*38;/g, '&')).trim()
    : '';
  const address = buildAddress(event.venue);
  const website = String(
    (event.venue && event.venue.website) || event.website || ''
  ).trim();

  // POC from organizer
  const firstOrganizer = Array.isArray(event.organizer) && event.organizer.length > 0
    ? event.organizer[0]
    : null;
  const poc = firstOrganizer
    ? { name: decode(String(firstOrganizer.organizer || '').trim()) }
    : undefined;

  const cost = parseEventCost(event);

  const sanityDraft = {
    _id: `migration-event-${id}`,
    _type: 'event',
    source: 'manual',
    title,
    slug: { _type: 'slug', current: slugCurrent },
    ...(startTime ? { startTime } : {}),
    ...(endTime ? { endTime } : {}),
    ...(cost !== undefined ? { cost } : {}),
    ...(venueName ? { venueName } : {}),
    ...(address ? { address } : {}),
    ...(website ? { website } : {}),
    ...(poc ? { poc } : {}),
    ...(mainImage ? { mainImage } : {}),
    ...(excerpt.length > 0 ? { excerpt } : {}),
    ...(body.length > 0 ? { body } : {}),
    ...(categoryRef
      ? { category: { _type: 'reference', _ref: categoryRef }, categoryTitle }
      : {}),
    onlineEvent: false,
  };

  const trackingKey = contentHash(
    `tribe_event:${id}:${event.modified_utc || event.modified || ''}`
  );

  const migrationNotes = [];
  if (!mainImage) migrationNotes.push('No featured image');
  if (body.length === 0) migrationNotes.push('Empty body');
  if (!categoryRef) migrationNotes.push('No category');

  return {
    key: `tribe-event-${id}`,
    wpId: id,
    wpTitle: title,
    wpStartDate: startTime ? startTime.slice(0, 10) : '',
    wpEndDate: endTime ? endTime.slice(0, 10) : '',
    wpCategoryName: categoryTitle,
    wpVenueName: venueName,
    wpImageUrl: imageUrl,
    trackingKey,
    migrationNotes,
    sanityDraft,
  };
}

module.exports = { mapTribeEventToSanityDraft };
