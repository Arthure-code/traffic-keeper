// One run: read what GitHub measured, merge it into the history the
// repository holds, write the history and the badge back.

import { renderBadge } from './badge.js';
import { listRepositories, readViews } from './github.js';
import { byRepository, merge, totals, type DayRow, type Totals } from './history.js';
import { readFile, writeFile } from './store.js';

export const HISTORY_PATH = 'data/traffic.json';
export const BADGE_PATH = 'data/badge.svg';

export interface Settings {
  token: string;
  /** The account whose repositories are followed. */
  owner: string;
  /** Where the two files live, this project's own repository. */
  repository: string;
}

export interface RunResult {
  totals: Totals;
  repositoriesRead: number;
  rowsAdded: number;
  /** False when nothing changed, in which case nothing was written. */
  written: boolean;
}

interface HistoryFile {
  updatedAt: string;
  totals: Totals;
  perRepository: ReturnType<typeof byRepository>;
  days: DayRow[];
}

function parse(text: string): DayRow[] {
  if (!text.trim()) return [];
  const file = JSON.parse(text) as Partial<HistoryFile>;
  return Array.isArray(file.days) ? file.days : [];
}

export async function run(settings: Settings, now = new Date()): Promise<RunResult> {
  const { token, owner, repository } = settings;

  const names = await listRepositories(token, owner);
  const incoming: DayRow[] = [];
  for (const name of names) incoming.push(...(await readViews(token, owner, name)));

  const stored = await readFile(token, owner, repository, HISTORY_PATH);
  const previous = parse(stored.text);
  const days = merge(previous, incoming);
  const summary = totals(days);

  // The day under way changes all the time; a run that adds nothing new
  // writes nothing, so the history keeps one commit a day at most.
  const unchanged =
    days.length === previous.length && JSON.stringify(days) === JSON.stringify(previous);
  if (unchanged) {
    return { totals: summary, repositoriesRead: names.length, rowsAdded: 0, written: false };
  }

  const file: HistoryFile = {
    updatedAt: now.toISOString(),
    totals: summary,
    perRepository: byRepository(days),
    days,
  };
  const message = `Traffic up to ${summary.lastDay}: ${summary.views} views, ${summary.visitors} visitors`;
  await writeFile(token, owner, repository, HISTORY_PATH, `${JSON.stringify(file, null, 2)}\n`, stored.sha, message);

  const badge = await readFile(token, owner, repository, BADGE_PATH);
  await writeFile(token, owner, repository, BADGE_PATH, renderBadge(summary), badge.sha, message);

  return {
    totals: summary,
    repositoriesRead: names.length,
    rowsAdded: days.length - previous.length,
    written: true,
  };
}
