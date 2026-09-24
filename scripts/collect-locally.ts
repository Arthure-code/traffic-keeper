// A run that reads GitHub but writes to this folder instead of to the
// repository, so the result can be looked at before anything is
// published. The token is read from the environment, never stored.
//
//   GITHUB_TOKEN=... GITHUB_OWNER=... npm run collect

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { renderBadge } from '../src/badge.js';
import { listRepositories, readViews } from '../src/github.js';
import { byRepository, merge, totals, type DayRow } from '../src/history.js';
import { BADGE_PATH, HISTORY_PATH, README_PATH } from '../src/collect.js';
import { buildBlock, updateBlock } from '../src/readme.js';

const token = process.env.GITHUB_TOKEN;
const owner = process.env.GITHUB_OWNER;
if (!token || !owner) {
  console.error('GITHUB_TOKEN and GITHUB_OWNER are required.');
  process.exit(1);
}

const names = await listRepositories(token, owner);
console.log(`${names.length} repositories followed`);

const rows: DayRow[] = [];
for (const name of names) {
  const days = await readViews(token, owner, name);
  rows.push(...days);
}

const days = merge([], rows);
const summary = totals(days);
const file = {
  updatedAt: new Date().toISOString(),
  totals: summary,
  perRepository: byRepository(days),
  days,
};

const readme = await readFile(README_PATH, 'utf8').catch(() => '');
const rewritten = updateBlock(readme, buildBlock(days, summary, new Date()));

const written: (readonly [string, string])[] = [
  [HISTORY_PATH, `${JSON.stringify(file, null, 2)}\n`],
  [BADGE_PATH, renderBadge(summary)],
];
if (rewritten !== readme) written.push([README_PATH, rewritten]);

for (const [path, content] of written) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content, 'utf8');
}

console.log(summary);
console.log(byRepository(days).slice(0, 8));
