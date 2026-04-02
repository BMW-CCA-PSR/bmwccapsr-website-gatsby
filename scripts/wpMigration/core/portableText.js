const {decode} = require('html-entities');
const {JSDOM} = require('jsdom');
const {htmlToBlocks} = require('@sanity/block-tools');
const {Schema} = require('@sanity/schema');
const {parse} = require('@wordpress/block-serialization-default-parser');

const INLINE_IMAGE_MARKER = '__WP_INLINE_IMAGE__';

function removeWordPressShortcodes(input) {
  if (!input) return '';
  return String(input)
    .replace(/\[[^\]]+\]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

const schema = Schema.compile({
  name: 'wpMigration',
  types: [
    { type: 'object', name: 'link', fields: [{ name: 'href', type: 'url' }] },
    {
      type: 'array',
      name: 'excerptPortableText',
      of: [
        {
          type: 'block',
          styles: [{ title: 'Normal', value: 'normal' }],
          lists: [],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
            ],
            annotations: [],
          },
        },
      ],
    },
    {
      type: 'array',
      name: 'bodyPortableText',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H1', value: 'h1' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'H4', value: 'h4' },
            { title: 'Quote', value: 'blockquote' },
          ],
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Number', value: 'number' },
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
              { title: 'Code', value: 'code' },
            ],
            annotations: [
              { name: 'link', type: 'link' },
            ],
          },
        },
      ],
    },
  ],
});

const excerptType = schema.get('excerptPortableText');
const bodyType = schema.get('bodyPortableText');

function parseHtml(html) {
  return new JSDOM(html).window.document;
}

function isEmptyTextBlock(block) {
  if (!block || block._type !== 'block') return false;
  if (Array.isArray(block.markDefs) && block.markDefs.length > 0) return false;
  const children = Array.isArray(block.children) ? block.children : [];
  if (!children.length) return true;
  return children.every((child) => {
    if (!child || child._type !== 'span') return false;
    return !String(child.text || '').trim() && (!Array.isArray(child.marks) || child.marks.length === 0);
  });
}

const LEADING_BULLET_MARKER_RE = /^\s*[•●◦▪▸‣⁃·]\s+/;
const LEADING_NUMBER_MARKER_RE = /^\s*\d+[.)]\s+/;
const LEADING_QUOTE_MARKER_RE = /^\s*>\s+/;

function makeKey(prefix = 'k') {
  return `${prefix}${Math.random().toString(36).slice(2, 10)}`;
}

function makeSpan(text) {
  return {
    _type: 'span',
    _key: makeKey('s'),
    text: String(text || ''),
    marks: [],
  };
}

function makeTextBlock(text, extra = {}) {
  return {
    _type: 'block',
    _key: makeKey('b'),
    style: 'normal',
    markDefs: [],
    children: [makeSpan(text)],
    ...extra,
  };
}

function parseInlineImageMarker(text) {
  const source = String(text || '').trim();
  if (!source.startsWith(INLINE_IMAGE_MARKER)) return null;
  const payload = source.slice(INLINE_IMAGE_MARKER.length);
  try {
    const parsed = JSON.parse(payload);
    if (!parsed || !parsed.sourceUrl) return null;
    return {
      sourceUrl: String(parsed.sourceUrl || '').trim(),
      alt: String(parsed.alt || '').trim(),
      caption: String(parsed.caption || '').trim(),
    };
  } catch (error) {
    return null;
  }
}

function extractInlineImageMarkerSegments(text) {
  const source = String(text || '');
  const segments = [];
  let cursor = 0;

  while (cursor < source.length) {
    const markerIndex = source.indexOf(INLINE_IMAGE_MARKER, cursor);
    if (markerIndex < 0) {
      segments.push({ type: 'text', value: source.slice(cursor) });
      break;
    }

    if (markerIndex > cursor) {
      segments.push({ type: 'text', value: source.slice(cursor, markerIndex) });
    }

    const payloadStart = markerIndex + INLINE_IMAGE_MARKER.length;
    if (source[payloadStart] !== '{') {
      segments.push({ type: 'text', value: INLINE_IMAGE_MARKER });
      cursor = payloadStart;
      continue;
    }

    let index = payloadStart;
    let depth = 0;
    let inString = false;
    let isEscaped = false;
    let payloadEnd = -1;

    for (; index < source.length; index += 1) {
      const char = source[index];
      if (isEscaped) {
        isEscaped = false;
        continue;
      }
      if (char === '\\') {
        isEscaped = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (inString) continue;
      if (char === '{') depth += 1;
      if (char === '}') {
        depth -= 1;
        if (depth === 0) {
          payloadEnd = index;
          break;
        }
      }
    }

    if (payloadEnd < 0) {
      segments.push({ type: 'text', value: source.slice(markerIndex) });
      break;
    }

    const rawMarker = source.slice(markerIndex, payloadEnd + 1);
    const marker = parseInlineImageMarker(rawMarker);
    if (marker && marker.sourceUrl) {
      segments.push({ type: 'image', value: marker });
    } else {
      segments.push({ type: 'text', value: rawMarker });
    }
    cursor = payloadEnd + 1;
  }

  return segments.filter((segment) => {
    if (segment.type !== 'text') return true;
    return segment.value.length > 0;
  });
}

function firstNonEmptySpanIndex(children) {
  for (let index = 0; index < children.length; index += 1) {
    const child = children[index];
    if (!child || child._type !== 'span') continue;
    if (String(child.text || '').length === 0) continue;
    return index;
  }
  return -1;
}

function textFromBlock(block) {
  if (!block || block._type !== 'block') return '';
  return (Array.isArray(block.children) ? block.children : [])
    .filter((child) => child && child._type === 'span')
    .map((child) => String(child.text || ''))
    .join('');
}

function convertBlockToListType(block, listType, markerPattern) {
  if (!block || block._type !== 'block' || block.listItem) return block;
  const children = Array.isArray(block.children) ? block.children : [];
  if (!children.length) return block;

  const firstIndex = firstNonEmptySpanIndex(children);
  if (firstIndex < 0) return block;

  const firstSpan = children[firstIndex];
  const firstText = String(firstSpan.text || '');
  if (!markerPattern.test(firstText)) return block;

  const cleanedText = firstText.replace(markerPattern, '');
  const nextChildren = [...children];
  nextChildren[firstIndex] = {
    ...firstSpan,
    text: cleanedText,
  };

  return {
    ...block,
    style: 'normal',
    listItem: listType,
    level: typeof block.level === 'number' && block.level > 0 ? block.level : 1,
    children: nextChildren,
  };
}

function splitBlockByPatternedLines(block) {
  if (!block || block._type !== 'block' || block.listItem) return [block];

  const fullText = textFromBlock(block);
  if (!fullText.includes('\n')) return [block];

  const lines = fullText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return [block];

  const allBullet = lines.every((line) => LEADING_BULLET_MARKER_RE.test(line));
  if (allBullet) {
    return lines.map((line) => makeTextBlock(line.replace(LEADING_BULLET_MARKER_RE, ''), { listItem: 'bullet', level: 1 }));
  }

  const allNumber = lines.every((line) => LEADING_NUMBER_MARKER_RE.test(line));
  if (allNumber) {
    return lines.map((line) => makeTextBlock(line.replace(LEADING_NUMBER_MARKER_RE, ''), { listItem: 'number', level: 1 }));
  }

  const paragraphLines = fullText
    .split(/\r?\n\s*\r?\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
  if (paragraphLines.length > 1) {
    return paragraphLines.map((line) => makeTextBlock(line));
  }

  return [block];
}

function convertQuoteMarkers(block) {
  if (!block || block._type !== 'block') return block;
  if (block.style === 'blockquote') return block;

  const children = Array.isArray(block.children) ? block.children : [];
  if (!children.length) return block;
  const firstIndex = firstNonEmptySpanIndex(children);
  if (firstIndex < 0) return block;

  const firstSpan = children[firstIndex];
  const firstText = String(firstSpan.text || '');
  if (!LEADING_QUOTE_MARKER_RE.test(firstText)) return block;

  const nextChildren = [...children];
  nextChildren[firstIndex] = {
    ...firstSpan,
    text: firstText.replace(LEADING_QUOTE_MARKER_RE, ''),
  };

  return {
    ...block,
    style: 'blockquote',
    children: nextChildren,
  };
}

function cloneBlockWithText(block, text) {
  const value = String(text || '');
  if (!value.trim()) return null;
  return {
    ...block,
    _key: makeKey('b'),
    markDefs: [],
    children: [makeSpan(value)],
  };
}

function imageMarkerToBlock(marker) {
  const alt = marker.alt || marker.caption || '';
  const caption = marker.caption || marker.alt || '';
  return {
    _type: 'mainImage',
    _key: makeKey('img'),
    sourceUrl: marker.sourceUrl,
    alt,
    caption,
  };
}

function splitBlockByInlineImageMarkers(block) {
  if (!block || block._type !== 'block') return [block];

  const segments = extractInlineImageMarkerSegments(textFromBlock(block));
  const hasImageSegment = segments.some((segment) => segment.type === 'image');
  if (!hasImageSegment) return [block];

  return segments.flatMap((segment) => {
    if (segment.type === 'image') {
      return [imageMarkerToBlock(segment.value)];
    }
    const nextBlock = cloneBlockWithText(block, segment.value);
    return nextBlock ? [nextBlock] : [];
  });
}

function mapInlineImageMarkers(blocks) {
  return (Array.isArray(blocks) ? blocks : []).flatMap((block) => {
    if (!block || block._type !== 'block') return block;
    const text = textFromBlock(block).trim();
    const hasMarker = text.includes(INLINE_IMAGE_MARKER);
    if (hasMarker) {
      console.log(`[Converter] Found inline image marker in block, text: ${text.substring(0, 100)}...`);
    }
    
    const marker = parseInlineImageMarker(text);
    if (marker && marker.sourceUrl) {
      console.log(`[Converter] Block is entirely an image marker: ${marker.sourceUrl}`);
      return [imageMarkerToBlock(marker)];
    }

    const result = splitBlockByInlineImageMarkers(block);
    if (result.length > 1) {
      console.log(`[Converter] Split block into ${result.length} parts (markers: ${result.filter(b => b.type === 'mainImage').length})`);
    }
    return result;
  });
}

function normalizeHtmlForPortableText(html) {
  const doc = parseHtml(html);
  const images = Array.from(doc.querySelectorAll('img'));
  console.log(`[Converter] normalizeHtmlForPortableText found ${images.length} images`);
  
  images.forEach((imgEl) => {
    const sourceUrl = String(imgEl.getAttribute('src') || imgEl.getAttribute('data-src') || '').trim();
    if (!sourceUrl) {
      imgEl.remove();
      return;
    }
    const alt = String(imgEl.getAttribute('alt') || imgEl.getAttribute('title') || '').trim();

    // Extract caption from WordPress wrapper structures
    let caption = '';
    const parent = imgEl.parentElement;
    if (parent) {
      // WordPress classic: <div class="wp-caption"><img>...<p class="wp-caption-text">caption</p></div>
      const wpCaption = parent.querySelector('.wp-caption-text');
      if (wpCaption) {
        caption = String(wpCaption.textContent || '').trim();
      }
      // WordPress block editor: <figure><img><figcaption>caption</figcaption></figure>
      if (!caption) {
        const figcaption = parent.querySelector('figcaption');
        if (figcaption) {
          caption = String(figcaption.textContent || '').trim();
        }
      }
      // Also check grandparent for nested structures like <div class="wp-caption"><a><img></a><p class="wp-caption-text">...</p></div>
      if (!caption && parent.parentElement) {
        const gpCaption = parent.parentElement.querySelector('.wp-caption-text');
        if (gpCaption) {
          caption = String(gpCaption.textContent || '').trim();
        }
        if (!caption) {
          const gpFigcaption = parent.parentElement.querySelector('figcaption');
          if (gpFigcaption) {
            caption = String(gpFigcaption.textContent || '').trim();
          }
        }
      }
    }

    const markerPayload = JSON.stringify({ sourceUrl, alt, caption });
    const markerText = `${INLINE_IMAGE_MARKER}${markerPayload}`;
    const replacement = doc.createElement('p');
    replacement.textContent = markerText;
    console.log(`[Converter] Replacing image with marker: ${markerText.substring(0, 80)}...`);

    // Remove caption elements so they don't appear as duplicate text blocks
    if (parent) {
      const captionEl = parent.querySelector('.wp-caption-text') || parent.querySelector('figcaption');
      if (captionEl) captionEl.remove();
      if (parent.parentElement) {
        const gpCaptionEl = parent.parentElement.querySelector('.wp-caption-text') || parent.parentElement.querySelector('figcaption');
        if (gpCaptionEl) gpCaptionEl.remove();
      }
    }

    imgEl.replaceWith(replacement);
  });
  
  const result = doc.body ? doc.body.innerHTML : String(html || '');
  if (images.length > 0) {
    console.log(`[Converter] Result HTML snippet (first 200 chars): ${result.substring(0, 200)}`);
  }
  return result;
}

function convertLeadingBulletParagraphBlocks(blocks) {
  return (Array.isArray(blocks) ? blocks : []).map((block) => convertBlockToListType(block, 'bullet', LEADING_BULLET_MARKER_RE));
}

function convertLeadingNumberParagraphBlocks(blocks) {
  return (Array.isArray(blocks) ? blocks : []).map((block) => convertBlockToListType(block, 'number', LEADING_NUMBER_MARKER_RE));
}

function normalizeBodyBlocks(blocks) {
  const splitBlocks = (Array.isArray(blocks) ? blocks : []).flatMap((block) => splitBlockByPatternedLines(block));
  const bulletBlocks = convertLeadingBulletParagraphBlocks(splitBlocks);
  const numberBlocks = convertLeadingNumberParagraphBlocks(bulletBlocks);
  const quoteBlocks = numberBlocks.map((block) => convertQuoteMarkers(block));
  return mapInlineImageMarkers(quoteBlocks);
}

function htmlToPortableTextBlocks(html, { field = 'body' } = {}) {
  const source = String(html || '').trim();
  if (!source) return [];

  const cleaned = removeWordPressShortcodes(source);
  const parseResult = cleaned.includes('<!-- wp:') ? parse(cleaned) : [];
  const type = field === 'excerpt' ? excerptType : bodyType;
  const htmlSegments = Array.isArray(parseResult) && parseResult.length
    ? parseResult.map((block) => block.innerHTML || block.originalContent || '').filter(Boolean)
    : [cleaned];

  console.log(`[Converter] htmlToPortableTextBlocks(field=${field}): ${htmlSegments.length} segments, has ${(source.match(/<img/g) || []).length} img tags`);

  const blocks = htmlSegments.flatMap((segment) => {
    const normalized = normalizeHtmlForPortableText(decode(segment)
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, ''));
    return htmlToBlocks(normalized, type, { parseHtml });
  });
  
  console.log(`[Converter] htmlToBlocks produced ${blocks.length} blocks before normalization`);
  
  const normalizedBlocks = field === 'body' ? normalizeBodyBlocks(blocks) : blocks;
  
  const finalCount = Array.isArray(normalizedBlocks) ? normalizedBlocks.length : 0;
  const imageBlocks = Array.isArray(normalizedBlocks) ? normalizedBlocks.filter(b => (b._type || b.type) === 'mainImage').length : 0;
  console.log(`[Converter] Final: ${finalCount} blocks (${imageBlocks} mainImage)`);

  return Array.isArray(normalizedBlocks) ? normalizedBlocks.filter((block) => !isEmptyTextBlock(block)) : [];
}

function blocksToPlainParagraphs(blocks) {
  return (blocks || [])
    .filter((block) => block && block._type === 'block')
    .map((block) => (block.children || []).map((child) => child.text || '').join('').trim())
    .filter(Boolean);
}

module.exports = {
  htmlToPortableTextBlocks,
  blocksToPlainParagraphs,
};