const {parseReviewArgs} = require('../utils/cli');
const {fetchPostsWithFallback, fetchUsersByIds, fetchCategoriesByIds, fetchMediaByIds, normalizeBaseUrl} = require('../services/wpApi');
const {mapPostToSanityDraft} = require('./reviewMapper');
const {writeJsonFile} = require('../utils/files');

function printJson(title, value) {
  console.log(`\n=== ${title} ===`);
  console.log(JSON.stringify(value, null, 2));
}

async function generateReviewPayload(args, onProgress) {
  const options = { insecure: args.insecure, timeoutMs: args.timeoutMs };
  const startTime = Date.now();
  const emit = (step, message, durationMs) => {
    const msg = `[Review] ${step}: ${message}`;
    console.log(msg);
    if (onProgress) onProgress({ step, message, durationMs });
  };
  
  console.log(`[Review] Starting generateReviewPayload for baseUrl: ${args.baseUrl}, page: ${args.page}, perPage: ${args.perPage}`);

  emit('fetch-posts-start', `Fetching posts from WordPress (page ${args.page}, perPage ${args.perPage})...`);
  let t1 = Date.now();
  const postsResult = await fetchPostsWithFallback(args.baseUrl, args, options);
  const postsDuration = Date.now() - t1;
  emit('fetch-posts', `${postsResult.usedPerPage} posts, ${postsDuration}ms`, postsDuration);

  const {postsRes, usedPerPage, usedEmbed, attemptedFallback} = postsResult;
  const posts = Array.isArray(postsRes.data) ? postsRes.data : [];
  const totalPosts = Number(postsRes.headers['x-wp-total'] || 0);
  const totalPages = Number(postsRes.headers['x-wp-totalpages'] || 0);
  console.log(`[Review] Extracted ${posts.length} posts (${totalPosts} total, ${totalPages} pages)`);

  const userIds = [...new Set(posts.map((post) => post.author).filter((id) => Number.isFinite(id)))];
  const categoryIds = [...new Set(posts.flatMap((post) => (Array.isArray(post.categories) ? post.categories : [])).filter((id) => Number.isFinite(id)))];
  const mediaIds = [...new Set(posts.map((post) => post.featured_media).filter((id) => Number.isFinite(id) && id > 0))];
  console.log(`[Review] Found ${userIds.length} unique users, ${categoryIds.length} unique categories, ${mediaIds.length} unique media items`);

  emit('fetch-metadata-start', `Fetching users/categories/media for ${posts.length} posts...`);
  t1 = Date.now();
  const metadataOptions = {
    ...options,
    timeoutMs: Math.min(Math.max(5000, Number(options.timeoutMs) || 45000), 15000),
  };
  const mediaOptions = {
    ...options,
    timeoutMs: Math.min(Math.max(3000, Number(options.timeoutMs) || 45000), 7000),
  };

  const fetchWithProgress = async (name, count, fetcher) => {
    emit(`fetch-${name}-start`, `Fetching ${name} (${count} ids)...`);
    const startedAt = Date.now();
    let heartbeat = null;
    const startHeartbeat = () => {
      heartbeat = setInterval(() => {
        const elapsed = Date.now() - startedAt;
        emit(`fetch-${name}-waiting`, `Still fetching ${name}... ${elapsed}ms elapsed`, elapsed);
      }, 2000);
    };
    const stopHeartbeat = () => {
      if (heartbeat) {
        clearInterval(heartbeat);
        heartbeat = null;
      }
    };

    try {
      startHeartbeat();
      const result = await fetcher();
      stopHeartbeat();
      emit(`fetch-${name}-done`, `Fetched ${name} in ${Date.now() - startedAt}ms`, Date.now() - startedAt);
      return result;
    } catch (error) {
      stopHeartbeat();
      emit(
        `fetch-${name}-error`,
        `Failed ${name} (${error && error.message ? error.message : 'unknown error'}). Continuing without ${name}.`,
        Date.now() - startedAt
      );
      return new Map();
    }
  };

  const [usersById, categoriesById, mediaById] = await Promise.all([
    fetchWithProgress('users', userIds.length, () => fetchUsersByIds(args.baseUrl, userIds, metadataOptions)),
    fetchWithProgress('categories', categoryIds.length, () => fetchCategoriesByIds(args.baseUrl, categoryIds, metadataOptions)),
    fetchWithProgress('media', mediaIds.length, () => fetchMediaByIds(args.baseUrl, mediaIds, mediaOptions)),
  ]);
  const metadataDuration = Date.now() - t1;
  emit('fetch-metadata', `${userIds.length} users, ${categoryIds.length} categories, ${mediaIds.length} media, ${metadataDuration}ms`, metadataDuration);

  const context = {usersById, categoriesById, mediaById};
  emit('map-posts-start', `Starting PortableText conversion for ${posts.length} posts...`);
  t1 = Date.now();
  const mapped = [];
  for (let index = 0; index < posts.length; index += 1) {
    const post = posts[index];
    const postId = post && Number.isFinite(post.id) ? post.id : 'unknown';
    const title = String(post?.title?.rendered || '').replace(/<[^>]+>/g, '').trim();
    const safeTitle = title || '(Untitled)';
    const postStart = Date.now();

    emit(
      'map-post-start',
      `Converting HTML to PortableText for post ${postId} (${safeTitle}) [${index + 1}/${posts.length}]`
    );

    mapped.push(mapPostToSanityDraft(post, context));

    emit(
      'map-post-done',
      `Finished post ${postId} (${safeTitle}) in ${Date.now() - postStart}ms [${index + 1}/${posts.length}]`,
      Date.now() - postStart
    );
  }
  const mapDuration = Date.now() - t1;
  emit('map-posts', `${mapped.length} posts, ${mapDuration}ms`, mapDuration);
  const preview = mapped.slice(0, Math.max(1, args.previewLimit));

  const metrics = {
    wordpressApiBase: normalizeBaseUrl(args.baseUrl),
    insecureTlsMode: Boolean(args.insecure),
    requestTimeoutMs: args.timeoutMs,
    requestedPerPage: args.perPage,
    usedPerPage,
    requestedEmbed: args.embed,
    usedEmbed,
    usedFetchFallback: attemptedFallback,
    page: args.page,
    perPage: usedPerPage,
    totalPosts,
    totalPages,
    pulledPosts: posts.length,
    previewCount: preview.length,
    titleOver32Count: mapped.filter((entry) => entry.mappingSummary.title.length > 32).length,
    missingFeaturedImageCount: mapped.filter((entry) => !entry.mappingSummary.featuredImageUrl).length,
    missingCategoryCount: mapped.filter((entry) => !entry.mappingSummary.category.wpId).length,
    authorInferredFromBodyCount: mapped.filter((entry) => entry.mappingSummary.inferredAuthor.source.startsWith('body-tail-')).length,
    authorFallbackUnknownCount: mapped.filter((entry) => entry.mappingSummary.inferredAuthor.source === 'fallback-unknown').length,
    postsWithWordPressShortcodesCount: posts.filter((post) => /\[[^\]]+\]/.test(String(post?.content?.rendered || ''))).length,
  };

  const reviewPayload = {
    generatedAt: new Date().toISOString(),
    source: {
      wordpressApiBase: normalizeBaseUrl(args.baseUrl),
      page: args.page,
      perPage: usedPerPage,
      requestedPerPage: args.perPage,
      embed: usedEmbed,
      requestedEmbed: args.embed,
      timeoutMs: args.timeoutMs,
      totalPosts,
      totalPages,
      pulledPosts: posts.length,
    },
    metrics,
    rows: mapped,
  };

  const totalTime = Date.now() - startTime;
  console.log(`[Review] generateReviewPayload complete in ${totalTime}ms`);

  return {
    metrics,
    preview,
    reviewPayload,
  };
}

async function runReview(argv = process.argv.slice(2)) {
  const args = parseReviewArgs(argv);
  const { metrics, preview, reviewPayload } = await generateReviewPayload(args);

  const outputPath = args.outputFile ? writeJsonFile(args.outputFile, reviewPayload) : null;

  printJson('Migration Metrics', metrics);
  printJson(
    `Mapped Post Preview (first ${preview.length})`,
    preview.map((entry) => ({
      tracking: entry.tracking,
      wordpress: entry.wordpress,
      mappingSummary: entry.mappingSummary,
      migrationNotes: entry.migrationNotes,
      sanityDraft: {
        _id: entry.sanityDraft._id,
        _type: entry.sanityDraft._type,
        title: entry.sanityDraft.title,
        slug: entry.sanityDraft.slug,
        publishedAt: entry.sanityDraft.publishedAt,
        mainImage: entry.sanityDraft.mainImage,
        category: entry.sanityDraft.category,
        authors: entry.sanityDraft.authors,
        excerptFirstBlock: entry.sanityDraft.excerpt[0],
        bodyFirstBlock: entry.sanityDraft.body[0],
      },
    }))
  );

  if (outputPath) console.log(`\nWrote review JSON: ${outputPath}`);
  console.log('\nDry-run complete. No data was written to Sanity.');
}

module.exports = {
  generateReviewPayload,
  runReview,
};