const http = require('http');
const https = require('https');

function requestJson(url, options = {}) {
  const { insecure = false, timeoutMs = 45000 } = options;
  const isHttps = url.protocol === 'https:';
  const client = isHttps ? https : http;

  return new Promise((resolve, reject) => {
    const req = client.request(
      url,
      {
        method: 'GET',
        headers: { Accept: 'application/json' },
        timeout: timeoutMs,
        ...(isHttps ? { rejectUnauthorized: !insecure } : {}),
      },
      (res) => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          if (res.statusCode >= 400) {
            reject(
              new Error(
                `Request failed (${res.statusCode}) ${url.toString()}\n${raw.slice(0, 500)}`
              )
            );
            return;
          }

          let data = null;
          if (raw.trim()) {
            try {
              data = JSON.parse(raw);
            } catch (error) {
              reject(
                new Error(`Failed to parse JSON from ${url.toString()}: ${error.message}`)
              );
              return;
            }
          }

          resolve({ status: res.statusCode, headers: res.headers, data });
        });
      }
    );

    req.on('timeout', () => {
      req.destroy(new Error(`Request timed out for ${url.toString()}`));
    });

    req.on('error', (error) => reject(error));
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