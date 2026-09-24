// The badge, drawn here rather than fetched from a badge service: the
// file is committed to the repository and served by GitHub, so a reader
// never reaches any server of ours.

import type { Totals } from './history.js';

const HEIGHT = 20;
const PADDING = 6;
const FONT = 11;
const LABEL_BACKGROUND = '#555';
const VALUE_BACKGROUND = '#0a7bbd';

// Verdana at eleven pixels, measured on the characters a count uses.
// Wide enough for letters, narrow enough that the badge does not gape.
function width(text: string): number {
  let total = 0;
  for (const character of text) {
    if ('0123456789'.includes(character)) total += 7;
    else if (character === ' ') total += 3.5;
    else if (character === ',' || character === '.' || character === '·') total += 4;
    else if ('ijlt'.includes(character)) total += 3.5;
    else if ('mw'.includes(character)) total += 10;
    else total += 6.5;
  }
  return Math.ceil(total);
}

function escape(text: string): string {
  return text.replace(/[<>&'"]/g, (c) => `&#${c.charCodeAt(0)};`);
}

export function renderBadge(totals: Totals, label = 'github traffic'): string {
  const value = `${totals.views.toLocaleString('en-US')} views · ${totals.visitors.toLocaleString('en-US')} visitors`;
  const labelWidth = width(label) + PADDING * 2;
  const valueWidth = width(value) + PADDING * 2;
  const total = labelWidth + valueWidth;
  const description = `${label}: ${value}`;

  // The text is drawn twice: once in black at a third of opacity, one
  // pixel lower, which is the shadow every badge uses to stay readable
  // on both backgrounds, then once in white.
  const text = (content: string, centre: number) => `
    <text x="${centre}" y="15" fill="#010101" fill-opacity=".3">${escape(content)}</text>
    <text x="${centre}" y="14">${escape(content)}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="${HEIGHT}" role="img" aria-label="${escape(description)}">
  <title>${escape(description)}</title>
  <linearGradient id="shine" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="rounded">
    <rect width="${total}" height="${HEIGHT}" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#rounded)">
    <rect width="${labelWidth}" height="${HEIGHT}" fill="${LABEL_BACKGROUND}"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="${HEIGHT}" fill="${VALUE_BACKGROUND}"/>
    <rect width="${total}" height="${HEIGHT}" fill="url(#shine)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,DejaVu Sans,Geneva,sans-serif" font-size="${FONT}">${text(label, labelWidth / 2)}${text(value, labelWidth + valueWidth / 2)}
  </g>
</svg>
`;
}
