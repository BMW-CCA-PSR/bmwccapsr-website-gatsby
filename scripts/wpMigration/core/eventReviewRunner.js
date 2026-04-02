const { fetchTribeEventsPage } = require('../services/wpApi');
const { mapTribeEventToSanityDraft } = require('./eventReviewMapper');

// Always fetch page=1 for each chunk so MySQL OFFSET is always 0 (avoids the
// expensive postmeta JOIN + OFFSET scan that hangs on pages 3+).
const YEAR_START = 2010;
const YEAR_END = new Date().getFullYear() + 1;
const PER_PAGE = 50;   // Tribe API caps at 50; fine since no year has >50 events
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 3000;
const PAGE_TIMEOUT_MS = 30000;
const INTER_CHUNK_DELAY_MS = 1500;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchChunkWithRetry(tribeBaseUrl, startDate, endDate, page, options, emit) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    const attemptNote = attempt > 1 ? ` (attempt ${attempt}/${MAX_RETRIES})` : '';
    emit('fetch-page', `Fetching ${startDate}–${endDate} p${page}${attemptNote}...`);
    try {
      return await fetchTribeEventsPage(
        tribeBaseUrl,
        { page, perPage: PER_PAGE, startDate, endDate },
        { ...options, timeoutMs: PAGE_TIMEOUT_MS }
      );
    } catch (error) {
      if (attempt === MAX_RETRIES) throw error;
      emit('retry', `${startDate} failed (${error.message}), retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await sleep(RETRY_DELAY_MS);
    }
  }
}

async function generateEventsReviewPayload(tribeBaseUrl, options, onProgress, onRows) {
  const emit = (step, message) => {
    console.log(`[EventsReview] ${step}: ${message}`);
    if (onProgress) onProgress({ step, message });
  };

  // Quick probe to get the total count (page=1, per_page=1 → OFFSET=0, fast).
  emit('fetch-summary', 'Fetching total event count...');
  const probe = await fetchTribeEventsPage(
    tribeBaseUrl,
    { page: 1, perPage: 1, startDate: `${YEAR_START}-01-01`, endDate: `${YEAR_END}-12-31` },
    { ...options, timeoutMs: 30000 }
  );
  const total = probe.total || 0;
  emit('fetch-summary', `${total} total events — fetching year by year to avoid offset lag`);

  const seenIds = new Set();
  const rows = [];

  for (let year = YEAR_START; year <= YEAR_END; year += 1) {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    let page = 1;
    while (true) {
      let result;
      try {
        result = await fetchChunkWithRetry(tribeBaseUrl, startDate, endDate, page, options, emit);
      } catch (error) {
        emit('skip-chunk', `${startDate}–${endDate} p${page} failed after retries, skipping: ${error.message}`);
        break;
      }

      const events = result.events || [];
      if (!events.length) break;

      emit('map-page', `Mapping ${year} p${page} (${events.length} events)...`);
      const pageRows = [];
      for (const event of events) {
        if (seenIds.has(event.id)) continue;
        seenIds.add(event.id);
        try {
          const row = await mapTribeEventToSanityDraft(event);
          pageRows.push(row);
          rows.push(row);
        } catch (error) {
          console.error(`[EventsReview] Error mapping event ${event && event.id}: ${error.message}`);
        }
      }
      if (pageRows.length) onRows && onRows(pageRows);

      // Only fetch page 2+ if the year returned exactly PER_PAGE (unlikely for a car club).
      if (events.length < PER_PAGE) break;
      page += 1;
      await sleep(INTER_CHUNK_DELAY_MS);
    }

    if (rows.length >= total) break; // got everything early
    await sleep(INTER_CHUNK_DELAY_MS);
  }

  emit('done', `${rows.length} events mapped`);
  return { rows, total };
}

module.exports = { generateEventsReviewPayload };
