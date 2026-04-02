const http = require('http');
const https = require('https');

function requestJson(url, options = {}) {
  const { insecure = false, timeoutMs = 45000 } = options;
  const isHttps = url.protocol === 'https:';
  const client = isHttps ? https : http;

  return new Promise((resolve, reject) => {
    let settled = false;
    const done = (fn, val) => {
      if (settled) return;
      settled = true;
      clearTimeout(deadline);
      fn(val);
    };

    // Absolute wall-clock deadline — fires regardless of whether data is trickling in.
    const deadline = setTimeout(() => {
      req.destroy();
      done(reject, new Error(`Request timed out after ${timeoutMs}ms for ${url.toString()}`));
    }, timeoutMs);

    const req = client.request(
      url,
      {
        method: 'GET',
        headers: { Accept: 'application/json' },
        ...(isHttps ? { rejectUnauthorized: !insecure } : {}),
      },
      (res) => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { raw += chunk; });
        res.on('end', () => {
          if (res.statusCode >= 400) {
            done(reject, new Error(
              `Request failed (${res.statusCode}) ${url.toString()}\n${raw.slice(0, 500)}`
            ));
            return;
          }

          let data = null;
          if (raw.trim()) {
            try {
              data = JSON.parse(raw);
            } catch (error) {
              done(reject, new Error(`Failed to parse JSON from ${url.toString()}: ${error.message}`));
              return;
            }
          }

          done(resolve, { status: res.statusCode, headers: res.headers, data });
        });
      }
    );

    req.on('error', (error) => { if (!settled) done(reject, error); });
    req.end();
  });
}

function isRetryableError(error) {
  const msg = String((error && error.message) || '').toLowerCase();
  return (
    msg.includes('timed out') ||
    msg.includes('socket hang up') ||
    msg.includes('econnreset') ||
    msg.includes('econnrefused') ||
    msg.includes('502') ||
    msg.includes('503') ||
    msg.includes('504')
  );
}

module.exports = {
  requestJson,
  isRetryableError,
};