// The badge, drawn here rather than fetched from a badge service: the
// file is committed to the repository and served by GitHub, so a reader
// never reaches any server of ours.

import type { Totals } from './history.js';

const HEIGHT = 28;
const PADDING = 9;
const FONT = 10;
const TRACKING = 1.1;
const LOGO = 14;
const LOGO_GAP = 4;
const LABEL_BACKGROUND = '#414141';
const VALUE_BACKGROUND = '#8A2BE2';

// The GitHub mark, drawn on a 24 by 24 grid and scaled down beside the
// label.
const MARK =
  'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12';

// Bold capitals at ten pixels, plus the tracking this style carries.
// The figures were measured in a browser, then rounded up, so a badge is
// never too narrow for its own text.
function width(text: string): number {
  let total = 0;
  for (const character of text) {
    if (character === ' ') total += 3.6;
    else if ('IJ'.includes(character)) total += 5.5;
    else if ('M'.includes(character)) total += 9.6;
    else if ('W'.includes(character)) total += 10.6;
    else if ('0123456789'.includes(character)) total += 7.2;
    else if ('.·'.includes(character)) total += 3.7;
    else total += 7.9;
    total += TRACKING;
  }
  return Math.ceil(total);
}

// The clip has to be named, and two badges on the same page must not
// share that name: the browser would apply the first one's clip to both.
// The name comes from the content, so it stays the same between runs.
function clipName(text: string): string {
  let hash = 0;
  for (const character of text) hash = (hash * 31 + character.codePointAt(0)!) >>> 0;
  return `c${hash.toString(36)}`;
}

function escape(text: string): string {
  return text.replace(/[<>&'"]/g, (c) => `&#${c.charCodeAt(0)};`);
}

/** 160 stays 160, 108 400 becomes 108.4K, 2 100 000 becomes 2.1M. */
export function shorten(count: number): string {
  const units = ['', 'K', 'M', 'B'];
  let value = count;
  let unit = 0;
  while (value >= 1000 && unit < units.length - 1) {
    value /= 1000;
    unit += 1;
  }
  const rounded = unit === 0 ? String(value) : (Math.round(value * 10) / 10).toFixed(1).replace(/\.0$/, '');
  return rounded + units[unit];
}

export function renderBadge(totals: Totals, label = 'repo views'): string {
  const shown = label.toUpperCase();
  const value = shorten(totals.views);
  const labelWidth = PADDING + LOGO + LOGO_GAP + width(shown) + PADDING;
  const valueWidth = PADDING + width(value) + PADDING;
  const total = labelWidth + valueWidth;
  const description = `${label}: ${totals.views.toLocaleString('en-US')}`;
  const clip = clipName(description);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="${HEIGHT}" role="img" aria-label="${escape(description)}">
  <title>${escape(description)}</title>
  <clipPath id="${clip}">
    <rect width="${total}" height="${HEIGHT}" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#${clip})">
    <rect width="${labelWidth}" height="${HEIGHT}" fill="${LABEL_BACKGROUND}"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="${HEIGHT}" fill="${VALUE_BACKGROUND}"/>
  </g>
  <g transform="translate(${PADDING}, ${(HEIGHT - LOGO) / 2}) scale(${LOGO / 24})">
    <path fill="#fff" d="${MARK}"/>
  </g>
  <g fill="#fff" font-family="Verdana,DejaVu Sans,Geneva,sans-serif" font-size="${FONT}" font-weight="bold" letter-spacing="${TRACKING}">
    <text x="${PADDING + LOGO + LOGO_GAP}" y="${HEIGHT / 2 + 3.5}">${escape(shown)}</text>
    <text x="${labelWidth + PADDING}" y="${HEIGHT / 2 + 3.5}">${escape(value)}</text>
  </g>
</svg>
`;
}
