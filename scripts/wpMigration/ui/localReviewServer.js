#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { toHTML } = require('@portabletext/to-html');
const { parseReviewArgs } = require('../utils/cli');
const { generateReviewPayload } = require('../core/reviewRunner');
const { generateEventsReviewPayload } = require('../core/eventReviewRunner');
const {
  createSanityReadClient,
  fetchSanityAuthors,
  fetchSanityCategories,
  fetchSanityEventCategories,
  createSanityWriteClient,
  createOrReplaceDocument,
  createOrReplaceEventDocument,
  ensureAuthorHasImage,
} = require('../services/sanity');
const { discoverApiSurface, fetchPostsPageSummary } = require('../services/wpApi');

const DEFAULT_TRIBE_BASE_URL =
  process.env.TRIBE_EVENTS_API_BASE ||
  'http://ec2-16-148-107-247.us-west-2.compute.amazonaws.com/wp-json/tribe/events/v1';
const { generateArchiveCoverBuffer, DEFAULT_SUBHEADING, DEFAULT_TITLE } = require('../utils/archiveCoverImage');

function readFlag(argv, name, defaultValue) {
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    const [key, inlineValue] = token.split('=');
    if (key === name && inlineValue !== undefined) return inlineValue;
    if (token === name && argv[i + 1]) return argv[i + 1];
  }
  return defaultValue;
}

function hasFlag(argv, name) {
  return argv.includes(name) || argv.some((token) => token.startsWith(`${name}=`));
}

function toInt(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildReviewArgsFromQuery(query) {
  const args = parseReviewArgs([]);
  return {
    ...args,
    baseUrl: query.baseUrl || args.baseUrl,
    page: Math.max(1, toInt(query.page, args.page)),
    perPage: Math.max(1, toInt(query.perPage, args.perPage)),
    previewLimit: Math.max(1, toInt(query.previewLimit, args.previewLimit)),
    timeoutMs: Math.max(1000, toInt(query.timeoutMs, args.timeoutMs)),
    insecure: query.insecure === '1' || query.insecure === 'true' || args.insecure,
    embed: false,
    outputFile: '',
  };
}

function createReviewJobId() {
  return `review-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function buildReviewResponse(reviewPayload, metrics) {
  const rows = Array.isArray(reviewPayload && reviewPayload.rows)
    ? reviewPayload.rows.map((row) => {
        const bodyBlocks = row && row.sanityDraft && Array.isArray(row.sanityDraft.body)
          ? row.sanityDraft.body
          : [];
        return {
          ...row,
          previewBodyHtml: renderPortableTextBodyHtml(bodyBlocks),
        };
      })
    : [];

  return {
    ok: true,
    source: {
      type: 'node-review-mapper',
      generatedAt: new Date().toISOString(),
    },
    metrics,
    payload: {
      ...reviewPayload,
      rows,
    },
  };
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(payload, null, 2));
}

function sendHtml(res, html) {
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(html);
}

function sendBinaryFile(res, filePath, contentType) {
  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, {
      'Content-Type': contentType || 'application/octet-stream',
      'Cache-Control': 'public, max-age=3600',
    });
    res.end(data);
  } catch (error) {
    sendJson(res, 404, { ok: false, error: 'Asset not found.' });
  }
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

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 2 * 1024 * 1024) {
        reject(new Error('Request body too large.'));
      }
    });
    req.on('end', () => {
      if (!raw.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new Error(`Invalid JSON body: ${error.message}`));
      }
    });
    req.on('error', (error) => reject(error));
  });
}

function buildUiHtml(htmlContent, port) {
  return htmlContent.replace(/__WP_MIGRATION_API_BASE__/g, `http://127.0.0.1:${port}`);
}

function renderPortableTextBodyHtml(blocks) {
  if (!Array.isArray(blocks) || blocks.length === 0) return '';

  // Debug logging
  const blockTypes = blocks.map((b) => b._type || b.type || '').join(', ');
  const hasMainImage = blocks.some((b) => (b && (b._type === 'mainImage' || b.type === 'mainImage')));
  console.log(`[Render] Body has ${blocks.length} blocks: [${blockTypes}] | hasMainImage: ${hasMainImage}`);
  if (blocks.length <= 5) {
    console.log(`[Render] Full blocks:`, JSON.stringify(blocks, null, 2));
  }

  return toHTML(blocks, {
    components: {
      types: {
        mainImage: ({ value }) => {
          const src = value && value.sourceUrl ? String(value.sourceUrl) : '';
          if (!src) return '';
          const alt = value && value.alt ? String(value.alt) : '';
          const escapedSrc = escapeHtml(src);
          const escapedAlt = escapeHtml(alt);
          console.log(`[Render] Rendering mainImage: ${escapedSrc}`);
          return `<figure><img src="${escapedSrc}" alt="${escapedAlt}" loading="lazy" /></figure>`;
        },
      },
    },
  });
}

function sanitizeProxyUrl(raw) {
  const value = String(raw || '').trim();
  if (!value) throw new Error('Missing source URL.');
  const parsed = new URL(value);
  if (!/^https?:$/.test(parsed.protocol)) {
    throw new Error('Only http/https source URLs are allowed.');
  }
  return parsed;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isRedirectStatus(statusCode) {
  return statusCode === 301 || statusCode === 302 || statusCode === 303 || statusCode === 307 || statusCode === 308;
}

function requestTextWithTlsFallback(rawUrl, { headers = {}, rejectUnauthorized = true, maxRedirects = 6 } = {}) {
  return new Promise((resolve, reject) => {
    const visit = (currentUrl, redirectsLeft) => {
      let parsed;
      try {
        parsed = new URL(currentUrl);
      } catch (error) {
        reject(error);
        return;
      }

      const transport = parsed.protocol === 'https:' ? https : http;
      const requestOptions = {
        method: 'GET',
        headers,
      };
      if (parsed.protocol === 'https:') {
        requestOptions.rejectUnauthorized = rejectUnauthorized;
      }

      const req = transport.request(parsed, requestOptions, (response) => {
        const status = Number(response.statusCode || 0);
        const location = response.headers && response.headers.location;

        if (isRedirectStatus(status) && location && redirectsLeft > 0) {
          response.resume();
          const nextUrl = new URL(location, parsed).toString();
          visit(nextUrl, redirectsLeft - 1);
          return;
        }

        let body = '';
        response.setEncoding('utf8');
        response.on('data', (chunk) => {
          body += chunk;
        });
        response.on('end', () => {
          resolve({
            ok: status >= 200 && status < 300,
            status,
            text: body,
          });
        });
      });

      req.on('error', (error) => reject(error));
      req.end();
    };

    visit(rawUrl, maxRedirects);
  });
}

function createServer({ port }) {
  const uiPath = path.resolve(__dirname, 'wpMigrationApprovalTool.html');
  const rawUiHtml = fs.readFileSync(uiPath, 'utf8');
  const uiHtml = buildUiHtml(rawUiHtml, port);
  let lastReviewResult = null;
  const reviewJobs = new Map();

  return http.createServer(async (req, res) => {
    const requestUrl = new URL(req.url, `http://127.0.0.1:${port}`);

    if (requestUrl.pathname === '/health') {
      return sendJson(res, 200, { ok: true, now: new Date().toISOString() });
    }

    if (requestUrl.pathname === '/' || requestUrl.pathname === '/wpMigrationApprovalTool.html') {
      return sendHtml(res, uiHtml);
    }

    if (requestUrl.pathname === '/assets/logo') {
      const logoPath = path.resolve(__dirname, '../../../web/src/images/new-logo.png');
      return sendBinaryFile(res, logoPath, 'image/png');
    }

    if (requestUrl.pathname === '/api/review-result') {
      console.log(`[Server] /api/review-result request received`);
      if (!lastReviewResult) {
        return sendJson(res, 404, { ok: false, error: 'No review result available. Run /api/review first.' });
      }
      // Use compact JSON — this payload can be 100KB+
      const body = JSON.stringify(lastReviewResult);
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(body),
        'Cache-Control': 'no-store',
        'Connection': 'close',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(body);
      return;
    }

    if (requestUrl.pathname === '/api/review-start') {
      try {
        console.log(`[Server] /api/review-start request received: ${requestUrl.search}`);
        const args = buildReviewArgsFromQuery(Object.fromEntries(requestUrl.searchParams.entries()));
        const jobId = createReviewJobId();
        const job = {
          id: jobId,
          status: 'running',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          progress: { step: 'start', message: 'Starting review', durationMs: 0 },
          result: null,
          error: null,
        };
        reviewJobs.set(jobId, job);

        void (async () => {
          const startTime = Date.now();
          try {
            const onProgress = (event) => {
              job.progress = event;
              job.updatedAt = new Date().toISOString();
            };

            const result = await generateReviewPayload(args, onProgress);
            const finalResponse = buildReviewResponse(result.reviewPayload, result.metrics);
            lastReviewResult = finalResponse;
            job.status = 'completed';
            job.result = finalResponse;
            job.progress = {
              step: 'complete',
              message: `Completed in ${Date.now() - startTime}ms`,
              durationMs: Date.now() - startTime,
            };
            job.updatedAt = new Date().toISOString();
            console.log(`[Server] review job ${jobId} completed in ${Date.now() - startTime}ms`);
          } catch (error) {
            job.status = 'error';
            job.error = String(error && error.message ? error.message : error);
            job.updatedAt = new Date().toISOString();
            console.error(`[Server] review job ${jobId} failed:`, error);
          }
        })();

        return sendJson(res, 202, { ok: true, jobId, status: job.status });
      } catch (error) {
        return sendJson(res, 500, { ok: false, error: String(error && error.message ? error.message : error) });
      }
    }

    if (requestUrl.pathname === '/api/review-status') {
      const jobId = String(requestUrl.searchParams.get('jobId') || '').trim();
      if (!jobId) {
        return sendJson(res, 400, { ok: false, error: 'Missing jobId query parameter.' });
      }

      const job = reviewJobs.get(jobId);
      if (!job) {
        return sendJson(res, 404, { ok: false, error: 'Review job not found.' });
      }

      return sendJson(res, 200, {
        ok: true,
        jobId: job.id,
        status: job.status,
        progress: job.progress,
        error: job.error,
        result: job.status === 'completed' ? job.result : null,
      });
    }

    if (requestUrl.pathname === '/api/review') {
      try {
        console.log(`[Server] /api/review request received: ${requestUrl.search}`);
        const startTime = Date.now();
        const args = buildReviewArgsFromQuery(Object.fromEntries(requestUrl.searchParams.entries()));
        let clientClosed = false;
        req.on('close', () => {
          clientClosed = true;
        });

        const writeSse = (eventName, payload) => {
          if (clientClosed || res.writableEnded || res.destroyed) return false;
          res.write(`event: ${eventName}\ndata: ${JSON.stringify(payload)}\n\n`);
          return true;
        };
        
        // Set up SSE headers
        res.writeHead(200, {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-store',
          'Connection': 'close',
          'Access-Control-Allow-Origin': '*',
        });
        
        // Send initial progress event
        writeSse('progress', { step: 'start', message: 'Starting review', durationMs: 0 });
        
        let reviewPayload = null;
        let metrics = null;
        
        const onProgress = (event) => writeSse('progress', event);
        
        const result = await generateReviewPayload(args, onProgress);
        reviewPayload = result.reviewPayload;
        metrics = result.metrics;
        
        const elapsed = Date.now() - startTime;
        const finalResponse = buildReviewResponse(reviewPayload, metrics);
        
        // Store result (also available via /api/review-result)
        lastReviewResult = finalResponse;
        
        console.log(`[Server] /api/review completed in ${elapsed}ms`);
        // Send small completion signal (large payloads fail via SSE streaming)
        writeSse('complete', { ok: true });
        if (!res.writableEnded && !res.destroyed) {
          res.end();
        }
      } catch (error) {
        console.error(`[Server] /api/review error:`, error);
        if (!res.writableEnded && !res.destroyed) {
          res.write(`event: error\ndata: ${JSON.stringify({ ok: false, error: String(error && error.message ? error.message : error) })}\n\n`);
          res.end();
        }
      }
      return;
    }

    if (requestUrl.pathname === '/api/validate-wp-base') {
      try {
        const baseUrl = String(requestUrl.searchParams.get('baseUrl') || '').trim();
        if (!baseUrl) {
          return sendJson(res, 400, { ok: false, valid: false, error: 'Missing baseUrl query parameter.' });
        }

        const apiSurface = await discoverApiSurface(baseUrl, { timeoutMs: 12000, insecure: false });
        const valid = Boolean(apiSurface && apiSurface.routeCount > 0);
        return sendJson(res, 200, {
          ok: true,
          valid,
          routeCount: apiSurface && apiSurface.routeCount ? apiSurface.routeCount : 0,
          normalizedBaseUrl: apiSurface && apiSurface.normalizedBaseUrl ? apiSurface.normalizedBaseUrl : baseUrl,
        });
      } catch (error) {
        return sendJson(res, 200, {
          ok: true,
          valid: false,
          error: String(error && error.message ? error.message : error),
        });
      }
    }

    if (requestUrl.pathname === '/api/wp-posts-summary') {
      try {
        const baseUrl = String(requestUrl.searchParams.get('baseUrl') || '').trim();
        const perPage = Math.max(1, Number(requestUrl.searchParams.get('perPage') || 10));
        if (!baseUrl) {
          return sendJson(res, 400, {
            ok: false,
            error: 'Missing baseUrl query parameter.',
          });
        }

        const summary = await fetchPostsPageSummary(baseUrl, perPage, { timeoutMs: 12000, insecure: false });
        return sendJson(res, 200, {
          ok: true,
          perPage,
          totalPosts: summary.totalPosts,
          totalPages: summary.totalPages,
        });
      } catch (error) {
        return sendJson(res, 500, {
          ok: false,
          error: String(error && error.message ? error.message : error),
        });
      }
    }

    if (requestUrl.pathname === '/api/sanity-authors') {
      try {
        const client = createSanityReadClient();
        const authors = await fetchSanityAuthors(client);
        return sendJson(res, 200, {
          ok: true,
          authors,
          count: authors.length,
        });
      } catch (error) {
        return sendJson(res, 500, {
          ok: false,
          error: String(error && error.message ? error.message : error),
          authors: [],
        });
      }
    }

    if (requestUrl.pathname === '/api/sanity-categories') {
      try {
        const client = createSanityReadClient();
        const categories = await fetchSanityCategories(client);
        return sendJson(res, 200, {
          ok: true,
          categories,
          count: categories.length,
        });
      } catch (error) {
        return sendJson(res, 500, {
          ok: false,
          error: String(error && error.message ? error.message : error),
          categories: [],
        });
      }
    }

    if (requestUrl.pathname === '/api/import-row' && req.method === 'POST') {
      try {
        const body = await readJsonBody(req);
        const draft = body && body.sanityDraft ? body.sanityDraft : null;
        if (!draft || typeof draft !== 'object') {
          return sendJson(res, 400, {
            ok: false,
            error: 'Missing sanityDraft payload.',
          });
        }

        const client = createSanityWriteClient();
        const result = await createOrReplaceDocument(client, draft);
        return sendJson(res, 200, {
          ok: true,
          importedId: result && result._id ? result._id : draft._id,
          trackingKey: body && body.trackingKey ? body.trackingKey : null,
        });
      } catch (error) {
        return sendJson(res, 500, {
          ok: false,
          error: String(error && error.message ? error.message : error),
        });
      }
    }

    if (requestUrl.pathname === '/api/generate-archive-cover' && req.method === 'POST') {
      try {
        const body = await readJsonBody(req);
        const publishedAt = body && body.publishedAt ? String(body.publishedAt) : '';
        const dateLabel = formatArchiveDateLabel(publishedAt);
        const buffer = await generateArchiveCoverBuffer({
          subheading: DEFAULT_SUBHEADING,
          title: DEFAULT_TITLE,
          dateLabel,
        });

        const fileName = `archive-cover-${dateLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
        const dataUrl = `data:image/png;base64,${buffer.toString('base64')}`;

        return sendJson(res, 200, {
          ok: true,
          image: {
            fileName,
            dataUrl,
            alt: `${DEFAULT_TITLE} ${dateLabel}`,
            caption: `${DEFAULT_SUBHEADING} ${dateLabel}`,
            dateLabel,
          },
        });
      } catch (error) {
        return sendJson(res, 500, {
          ok: false,
          error: String(error && error.message ? error.message : error),
        });
      }
    }

    if (requestUrl.pathname === '/api/ensure-author-image' && req.method === 'POST') {
      try {
        const body = await readJsonBody(req);
        const authorId = body && body.authorId ? body.authorId : null;
        if (!authorId) {
          return sendJson(res, 400, {
            ok: false,
            error: 'Missing authorId in request body.',
          });
        }

        const client = createSanityWriteClient();
        const result = await ensureAuthorHasImage(client, authorId);
        return sendJson(res, 200, {
          ok: true,
          authorId: result._id,
          message: `Author ${result.name} now has a default avatar if it was missing.`,
        });
      } catch (error) {
        return sendJson(res, 500, {
          ok: false,
          error: String(error && error.message ? error.message : error),
        });
      }
    }

    if (requestUrl.pathname === '/api/source-proxy') {
      try {
        const sourceUrl = sanitizeProxyUrl(requestUrl.searchParams.get('url'));
        const requestHeaders = {
          Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        };

        let html;
        let upstreamStatus = 0;

        try {
          const upstream = await fetch(sourceUrl.toString(), {
            redirect: 'follow',
            headers: requestHeaders,
          });
          upstreamStatus = upstream.status;
          if (!upstream.ok) {
            return sendHtml(
              res,
              `<!doctype html><html><body><p>Failed to load source page (${upstream.status}).</p></body></html>`
            );
          }
          html = await upstream.text();
        } catch (fetchError) {
          if (sourceUrl.protocol !== 'https:') {
            throw fetchError;
          }

          const fallback = await requestTextWithTlsFallback(sourceUrl.toString(), {
            headers: requestHeaders,
            rejectUnauthorized: false,
          });
          upstreamStatus = fallback.status;
          if (!fallback.ok) {
            return sendHtml(
              res,
              `<!doctype html><html><body><p>Failed to load source page (${fallback.status}).</p></body></html>`
            );
          }
          html = fallback.text;
          console.warn(
            `source-proxy: using insecure TLS fallback for ${sourceUrl.hostname} due to fetch error: ${fetchError.message || fetchError}`
          );
        }

        if (!html) {
          return sendHtml(
            res,
            `<!doctype html><html><body><p>Failed to load source page (${upstreamStatus || 'unknown'}).</p></body></html>`
          );
        }

        const withBase = html.includes('<head')
          ? html.replace(/<head([^>]*)>/i, `<head$1><base href="${sourceUrl.toString()}">`)
          : `<!doctype html><html><head><base href="${sourceUrl.toString()}"></head><body>${html}</body></html>`;
        return sendHtml(res, withBase);
      } catch (error) {
        const sourceUrl = String(requestUrl.searchParams.get('url') || '');
        const errorMessage = String(error && error.message ? error.message : error);
        return sendHtml(
          res,
          `<!doctype html><html><body data-proxy-error="1" data-source-url="${escapeHtml(sourceUrl)}"><p>Unable to load source page via local proxy: ${escapeHtml(errorMessage)}</p><p>Falling back to direct source URL for preview.</p></body></html>`
        );
      }
    }

    // ── Events approval tool UI ─────────────────────────────────────────────

    if (requestUrl.pathname === '/events' && req.method === 'GET') {
      const htmlPath = path.join(__dirname, 'wpEventsApprovalTool.html');
      try {
        const html = fs.readFileSync(htmlPath, 'utf8');
        return sendHtml(res, html);
      } catch (err) {
        return sendJson(res, 500, { ok: false, error: `Could not read events UI: ${err.message}` });
      }
    }

    // Fetch all events from the tribe API and map them to Sanity drafts (streamed via SSE).
    if (requestUrl.pathname === '/api/events-all' && req.method === 'GET') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      });
      if (res.socket) res.socket.setNoDelay(true);
      const sendSse = (eventName, data) => {
        res.write(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`);
      };
      try {
        const tribeBaseUrl = requestUrl.searchParams.get('tribeBaseUrl') || DEFAULT_TRIBE_BASE_URL;
        const options = { insecure: true };
        const { total } = await generateEventsReviewPayload(
          tribeBaseUrl,
          options,
          (progress) => {
            console.log(`[events-all] ${progress.step}: ${progress.message}`);
            sendSse('progress', progress);
          },
          (pageRows) => {
            sendSse('rows', { rows: pageRows });
          }
        );
        sendSse('done', { total });
      } catch (error) {
        sendSse('error', { error: String(error && error.message ? error.message : error) });
      }
      res.end();
      return;
    }

    // Fetch available event categories from Sanity (for the category selector in the UI).
    if (requestUrl.pathname === '/api/event-categories' && req.method === 'GET') {
      try {
        const client = createSanityReadClient();
        const categories = await fetchSanityEventCategories(client);
        return sendJson(res, 200, { ok: true, categories });
      } catch (error) {
        return sendJson(res, 500, {
          ok: false,
          error: String(error && error.message ? error.message : error),
          categories: [],
        });
      }
    }

    // Import a single event row to Sanity.
    if (requestUrl.pathname === '/api/import-event-row' && req.method === 'POST') {
      try {
        const body = await readJsonBody(req);
        const draft = body && body.sanityDraft ? body.sanityDraft : null;
        if (!draft || typeof draft !== 'object') {
          return sendJson(res, 400, { ok: false, error: 'Missing sanityDraft payload.' });
        }
        const client = createSanityWriteClient();
        const result = await createOrReplaceEventDocument(client, draft);
        return sendJson(res, 200, {
          ok: true,
          importedId: result && result._id ? result._id : draft._id,
          trackingKey: body && body.trackingKey ? body.trackingKey : null,
        });
      } catch (error) {
        return sendJson(res, 500, {
          ok: false,
          error: String(error && error.message ? error.message : error),
        });
      }
    }

    return sendJson(res, 404, { ok: false, error: 'Not Found' });
  });
}

function maybeOpenBrowser(url, shouldOpen) {
  if (!shouldOpen) return;
  const { spawn } = require('child_process');
  const child = spawn('open', [url], {
    detached: true,
    stdio: 'ignore',
  });
  child.unref();
}

function startServer(argv = process.argv.slice(2), openPath = '/') {
  const port = toInt(readFlag(argv, '--port', process.env.WP_MIGRATION_UI_PORT || '8787'), 8787);
  const shouldOpen = hasFlag(argv, '--open') || !hasFlag(argv, '--no-open');
  const server = createServer({ port });

  server.listen(port, '127.0.0.1', () => {
    const url = `http://127.0.0.1:${port}${openPath}`;
    console.log(`WP migration review server ready at http://127.0.0.1:${port}/`);
    console.log('All mapped rows are generated by the Node mapper for parity with CLI review output.');
    maybeOpenBrowser(url, shouldOpen);
  });

  server.on('error', (error) => {
    console.error('WP migration review server failed:', error.message || error);
    process.exitCode = 1;
  });

  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = {
  startServer,
};
