// The history kept in the repository: one row per repository and per day.
// GitHub only answers with the last fourteen days, so the rows older than
// that exist nowhere else and must never be lost or counted twice.

/** What GitHub measured for one repository on one day. */
export interface DayRow {
  repository: string;
  /** ISO day, YYYY-MM-DD. */
  date: string;
  views: number;
  visitors: number;
}

export interface Totals {
  views: number;
  visitors: number;
  days: number;
  repositories: number;
  /** The most recent day the history holds, empty when it is empty. */
  lastDay: string;
}

function key(row: DayRow): string {
  return `${row.repository}|${row.date}`;
}

// A day already stored and received again is replaced, not added: running
// twice in a row, or ten times, leaves exactly the same history.
export function merge(stored: readonly DayRow[], incoming: readonly DayRow[]): DayRow[] {
  const rows = new Map<string, DayRow>();
  for (const row of stored) rows.set(key(row), row);
  for (const row of incoming) rows.set(key(row), row);
  return [...rows.values()].sort(
    (a, b) => a.date.localeCompare(b.date) || a.repository.localeCompare(b.repository),
  );
}

// Visitors are GitHub's daily unique visitors added up, so somebody who
// comes back on another day counts again. Views are plain page views.
export function totals(rows: readonly DayRow[]): Totals {
  let views = 0;
  let visitors = 0;
  const days = new Set<string>();
  const repositories = new Set<string>();
  for (const row of rows) {
    views += row.views;
    visitors += row.visitors;
    days.add(row.date);
    repositories.add(row.repository);
  }
  const lastDay = [...days].sort().at(-1) ?? '';
  return { views, visitors, days: days.size, repositories: repositories.size, lastDay };
}

// What each repository brought in, heaviest first, for the site to show.
export function byRepository(rows: readonly DayRow[]): { repository: string; views: number; visitors: number }[] {
  const sums = new Map<string, { repository: string; views: number; visitors: number }>();
  for (const row of rows) {
    const sum = sums.get(row.repository) ?? { repository: row.repository, views: 0, visitors: 0 };
    sum.views += row.views;
    sum.visitors += row.visitors;
    sums.set(row.repository, sum);
  }
  return [...sums.values()].sort((a, b) => b.views - a.views || a.repository.localeCompare(b.repository));
}
