const { requestJson, isRetryableError } = require('./http');

function normalizeBaseUrl(baseUrl) {
  const trimmed = String(baseUrl || '').trim();
  if (!trimmed) throw new Error('Missing WordPress API base URL.');
  return trimmed.replace(/\/+$/, '');
}

function buildUrl(baseUrl, path, query = {}) {
  const cleanPath = String(path || '').replace(/^\/+/, '');
  const url = new URL(`${normalizeBaseUrl(baseUrl)}/${cleanPath}`);
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    url.searchParams.set(key, String(value));
  });
  return url;
}

async function discoverApiSurface(baseUrl, options) {
  const res = await requestJson(buildUrl(baseUrl, ''), options);
  const routes = Object.keys((res.data && res.data.routes) || {});
  const interesting = routes.filter((route) =>
    /\/wp\/v2\/(posts|users|categories|tags|media|types)/.test(route)
  );
  return { routeCount: routes.length, interestingRoutes: interesting.slice(0, 20) };
}

async function fetchPostsWithFallback(baseUrl, args, options) {
  const perPageCandidates = [Math.max(1, args.perPage), Math.min(Math.max(1, args.perPage), 25), 10, 5].filter(
    (value, index, arr) => arr.indexOf(value) === index
  );
  let lastError = null;

  for (const perPage of perPageCandidates) {
    const postsUrl = buildUrl(baseUrl, 'posts', {
      page: args.page,
      per_page: perPage,
      status: 'publish',
      order: 'desc',
      orderby: 'date',
    });

    try {
      const response = await requestJson(postsUrl, options);
      return {
        postsRes: response,
        usedPerPage: perPage,
        usedEmbed: false,
        attemptedFallback: perPage !== args.perPage,
      };
    } catch (error) {
      lastError = error;
      if (!isRetryableError(error)) throw error;
    }
  }

  throw lastError || new Error('Failed to fetch posts with fallback strategy.');
}

async function fetchPostsPageSummary(baseUrl, perPage, options) {
  const requestedPerPage = Math.max(1, Number(perPage) || 10);
  const postsUrl = buildUrl(baseUrl, 'posts', {
    page: 1,
    per_page: requestedPerPage,
    status: 'publish',
    order: 'desc',
    orderby: 'date',
  });
  const response = await requestJson(postsUrl, options);
  const totalPosts = Number(response.headers['x-wp-total'] || 0);
  const totalPagesFromHeader = Number(response.headers['x-wp-totalpages'] || 0);
  return {
    totalPosts,
    totalPages: totalPagesFromHeader || Math.ceil(totalPosts / requestedPerPage),
  };
}

async function fetchMediaByIds(baseUrl, mediaIds, options) {
  if (!mediaIds.length) return new Map();
  const url = buildUrl(baseUrl, 'media', {
    include: mediaIds.join(','),
    per_page: Math.min(mediaIds.length, 100),
    page: 1,
  });
  const res = await requestJson(url, options);
  const map = new Map();
  (res.data || []).forEach((media) => map.set(media.id, media));
  return map;
}

async function fetchUsersByIds(baseUrl, userIds, options) {
  if (!userIds.length) return new Map();
  const url = buildUrl(baseUrl, 'users', {
    include: userIds.join(','),
    per_page: Math.min(userIds.length, 100),
    page: 1,
  });
  const res = await requestJson(url, options);
  const map = new Map();
  (res.data || []).forEach((user) => map.set(user.id, user.name || null));
  return map;
}

async function fetchCategoriesByIds(baseUrl, categoryIds, options) {
  if (!categoryIds.length) return new Map();
  const url = buildUrl(baseUrl, 'categories', {
    include: categoryIds.join(','),
    per_page: Math.min(categoryIds.length, 100),
    page: 1,
  });
  const res = await requestJson(url, options);
  const map = new Map();
  (res.data || []).forEach((category) => map.set(category.id, category.name || null));
  return map;
}

async function fetchMediaForPost(baseUrl, postId, options) {
  if (!postId) return [];
  const url = buildUrl(baseUrl, 'media', {
    parent: postId,
    per_page: 100,
    orderby: 'date',
    order: 'asc',
  });
  try {
    const res = await requestJson(url, options);
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.warn(`[wpApi] Failed to fetch media for post ${postId}:`, error.message);
    return [];
  }
}

/**
 * Fetch a page of events from the tribe/events/v1 REST API (The Events Calendar plugin).
 * Note: this namespace uses a different base URL than /wp/v2.
 * @param {string} tribeBaseUrl  e.g. http://example.com/wp-json/tribe/events/v1
 * @param {{ page: number, perPage: number, startDate: string, endDate: string }} args
 * @param {object} options
 * @returns {{ events: object[], total: number, total_pages: number }}
 */
async function fetchTribeEventsPage(tribeBaseUrl, args, options) {
  const base = normalizeBaseUrl(tribeBaseUrl);
  const url = new URL(`${base}/events`);
  url.searchParams.set('page', String(args.page || 1));
  url.searchParams.set('per_page', String(args.perPage || 50));
  url.searchParams.set('start_date', args.startDate || '2010-01-01');
  url.searchParams.set('end_date', args.endDate || '2030-12-31');
  url.searchParams.set('status', 'publish');

  const response = await requestJson(url, options);
  const data = response.data || {};
  return {
    events: Array.isArray(data.events) ? data.events : [],
    total: Number(data.total) || 0,
    total_pages: Number(data.total_pages) || 0,
  };
}

module.exports = {
  normalizeBaseUrl,
  buildUrl,
  discoverApiSurface,
  fetchPostsPageSummary,
  fetchPostsWithFallback,
  fetchMediaByIds,
  fetchUsersByIds,
  fetchCategoriesByIds,
  fetchMediaForPost,
  fetchTribeEventsPage,
};