// The figures written into a README as text, next to the badge. A reader
// sees the numbers themselves, not only a picture of them.

import { byRepository, type DayRow, type Totals } from './history.js';

export const START = '<!-- traffic-keeper:start -->';
export const END = '<!-- traffic-keeper:end -->';

/** How many repositories the table shows. */
const SHOWN = 5;

function day(iso: string): string {
  if (!iso) return '';
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function buildBlock(rows: readonly DayRow[], summary: Totals, now: Date): string {
  const firstDay = rows.length ? (rows[0] as DayRow).date : '';
  const lines = [
    START,
    '',
    `**${summary.views.toLocaleString('en-US')} views** across ${summary.repositories} repositories since ${day(firstDay)}.`,
    '',
    '| Repository | Views |',
    '| --- | ---: |',
  ];
  for (const repository of byRepository(rows).slice(0, SHOWN)) {
    lines.push(`| ${repository.repository} | ${repository.views} |`);
  }
  lines.push('', `Updated ${day(now.toISOString().slice(0, 10))}.`, '', END);
  return lines.join('\n');
}

/**
 * Puts the block between the two markers.
 *
 * A README without them is left exactly as it is: nothing is ever
 * appended to a file that did not ask for it.
 */
export function updateBlock(readme: string, block: string): string {
  const from = readme.indexOf(START);
  const to = readme.indexOf(END);
  if (from === -1 || to === -1 || to < from) return readme;
  return readme.slice(0, from) + block + readme.slice(to + END.length);
}
