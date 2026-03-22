/**
 * Default avatar generator for authors created during import.
 * Generates a grey silhouette user icon as SVG.
 */

const AVATAR_SIZE = 256;
const AVATAR_BG_COLOR = '#c5c8ce';
const AVATAR_COLOR = '#707984';

/**
 * Generate a default user silhouette avatar as SVG (square).
 * The frontend component can apply circular masking via border-radius or border-radius CSS.
 * @returns {string} SVG markup for the avatar
 */
function generateDefaultAvatarSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${AVATAR_SIZE}" height="${AVATAR_SIZE}" viewBox="0 0 ${AVATAR_SIZE} ${AVATAR_SIZE}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${AVATAR_SIZE}" height="${AVATAR_SIZE}" fill="${AVATAR_BG_COLOR}"/>
  
  <g fill="${AVATAR_COLOR}">
    <circle cx="${AVATAR_SIZE / 2}" cy="${AVATAR_SIZE * 0.31}" r="${AVATAR_SIZE * 0.16}"/>
    <circle cx="${AVATAR_SIZE / 2}" cy="${AVATAR_SIZE * 1.02}" r="${AVATAR_SIZE * 0.43}"/>
  </g>
</svg>`;
}

/**
 * Convert SVG string to PNG-like Buffer for upload
 * (Returns SVG as-is since Sanity can handle SVG directly)
 * @returns {Buffer} Buffer containing SVG data
 */
function generateDefaultAvatarBuffer() {
  const svg = generateDefaultAvatarSvg();
  return Buffer.from(svg, 'utf-8');
}

module.exports = {
  generateDefaultAvatarSvg,
  generateDefaultAvatarBuffer,
  AVATAR_SIZE,
  AVATAR_BG_COLOR,
  AVATAR_COLOR,
};
