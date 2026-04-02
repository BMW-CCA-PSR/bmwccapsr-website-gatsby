const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const DEFAULT_WIDTH = 1600;
const DEFAULT_HEIGHT = 900;
const DEFAULT_SUBHEADING = 'From the Archive';
const DEFAULT_TITLE = 'Zundfolge';

const FRIZ_TTF_PATH = path.resolve(
  __dirname,
  '../../../web/static/font/friz-quadrata-regular.ttf'
);

function escapeXml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function readFrizFontBase64() {
  const buffer = fs.readFileSync(FRIZ_TTF_PATH);
  return buffer.toString('base64');
}

function buildArchiveCoverSvg({ width, height, subheading, title, dateLabel, fontBase64 }) {
  const safeSubheading = escapeXml(subheading || DEFAULT_SUBHEADING);
  const safeTitle = escapeXml(title || DEFAULT_TITLE);
  const safeDate = escapeXml(dateLabel || 'Unknown date');
  const leftMargin = Math.round(width * 0.14);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Archive cover image">
  <defs>
    <linearGradient id="bgGradient" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0F1B2D"/>
      <stop offset="55%" stop-color="#1D2C45"/>
      <stop offset="100%" stop-color="#6B7A8F"/>
    </linearGradient>
    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#D4A84A"/>
      <stop offset="100%" stop-color="#F6E2B5"/>
    </linearGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.35"/>
    </filter>
  </defs>

  <style>
    @font-face {
      font-family: 'Friz Quadrata';
      src: url('data:font/ttf;base64,${fontBase64}') format('truetype');
      font-weight: 400;
      font-style: normal;
    }

    .subheading {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
      font-size: 54px;
      letter-spacing: -0.025em;
      font-weight: 700;
      fill: #F6E2B5;
      text-transform: none;
    }

    .title {
      font-family: 'Friz Quadrata', serif;
      font-size: 168px;
      letter-spacing: 0.01em;
      fill: #FFFFFF;
    }

    .date {
      font-family: 'Friz Quadrata', serif;
      font-size: 64px;
      letter-spacing: 0.025em;
      fill: #DCE7F6;
    }
  </style>

  <rect width="${width}" height="${height}" fill="url(#bgGradient)"/>
  <rect x="0" y="0" width="${width}" height="${height}" fill="rgba(0, 0, 0, 0.16)"/>
  <rect x="${leftMargin}" y="195" width="420" height="7" rx="3.5" fill="url(#lineGradient)" opacity="0.9"/>

  <g filter="url(#softShadow)">
    <text x="${leftMargin}" y="275" class="subheading">${safeSubheading}</text>
    <text x="${leftMargin}" y="500" class="title">${safeTitle}</text>
    <text x="${leftMargin}" y="635" class="date">${safeDate}</text>
  </g>
</svg>`;
}

async function generateArchiveCoverBuffer(options = {}) {
  const width = Number.isFinite(Number(options.width)) ? Number(options.width) : DEFAULT_WIDTH;
  const height = Number.isFinite(Number(options.height)) ? Number(options.height) : DEFAULT_HEIGHT;
  const fontBase64 = readFrizFontBase64();
  const svg = buildArchiveCoverSvg({
    width,
    height,
    subheading: options.subheading || DEFAULT_SUBHEADING,
    title: options.title || DEFAULT_TITLE,
    dateLabel: options.dateLabel,
    fontBase64,
  });

  return sharp(Buffer.from(svg, 'utf8')).png({ compressionLevel: 9 }).toBuffer();
}

module.exports = {
  generateArchiveCoverBuffer,
  DEFAULT_SUBHEADING,
  DEFAULT_TITLE,
};