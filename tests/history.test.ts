import { describe, expect, it } from 'vitest';
import { byRepository, merge, totals, type DayRow } from '../src/history.js';

const day = (repository: string, date: string, views: number, visitors: number): DayRow => ({
  repository,
  date,
  views,
  visitors,
});

describe('merge', () => {
  it('keeps the days GitHub no longer answers with', () => {
    const stored = [day('home-market', '2026-09-01', 12, 3)];
    const incoming = [day('home-market', '2026-09-20', 25, 2)];

    const rows = merge(stored, incoming);

    expect(rows).toEqual([stored[0], incoming[0]]);
  });

  it('replaces a day received again instead of adding it', () => {
    const stored = [day('home-market', '2026-09-20', 2, 1)];
    const incoming = [day('home-market', '2026-09-20', 25, 2)];

    const rows = merge(stored, incoming);

    expect(rows).toEqual([day('home-market', '2026-09-20', 25, 2)]);
  });

  it('leaves the same history however many times it runs', () => {
    const incoming = [day('escale', '2026-09-20', 9, 1), day('home-market', '2026-09-20', 25, 2)];

    const once = merge([], incoming);
    const thrice = merge(merge(merge([], incoming), incoming), incoming);

    expect(thrice).toEqual(once);
    expect(totals(thrice).views).toBe(34);
  });

  it('sorts by date then by repository', () => {
    const rows = merge(
      [day('zulu', '2026-09-02', 1, 1), day('alpha', '2026-09-01', 1, 1)],
      [day('alpha', '2026-09-02', 1, 1)],
    );

    expect(rows.map((r) => `${r.date} ${r.repository}`)).toEqual([
      '2026-09-01 alpha',
      '2026-09-02 alpha',
      '2026-09-02 zulu',
    ]);
  });

  it('accepts a day at zero without losing it', () => {
    const rows = merge([], [day('quiet', '2026-09-20', 0, 0)]);

    expect(rows).toHaveLength(1);
    expect(totals(rows).views).toBe(0);
  });
});

describe('totals', () => {
  it('adds views and visitors and names the last day', () => {
    const rows = [
      day('home-market', '2026-09-20', 2, 1),
      day('home-market', '2026-09-22', 25, 2),
      day('escale', '2026-09-22', 9, 1),
    ];

    expect(totals(rows)).toEqual({
      views: 36,
      visitors: 4,
      days: 2,
      repositories: 2,
      lastDay: '2026-09-22',
    });
  });

  it('answers zero on an empty history', () => {
    expect(totals([])).toEqual({ views: 0, visitors: 0, days: 0, repositories: 0, lastDay: '' });
  });
});

describe('byRepository', () => {
  it('sums each repository and puts the most read first', () => {
    const rows = [
      day('quiet', '2026-09-20', 1, 1),
      day('home-market', '2026-09-20', 2, 1),
      day('home-market', '2026-09-22', 25, 2),
    ];

    expect(byRepository(rows)).toEqual([
      { repository: 'home-market', views: 27, visitors: 3 },
      { repository: 'quiet', views: 1, visitors: 1 },
    ]);
  });
});
