import { describe, expect, it } from 'vitest';
import { renderBadge } from '../src/badge.js';
import type { Totals } from '../src/history.js';

const totals = (views: number, visitors: number): Totals => ({
  views,
  visitors,
  days: 1,
  repositories: 1,
  lastDay: '2026-09-22',
});

describe('renderBadge', () => {
  it('writes both counts, grouped by thousands', () => {
    const svg = renderBadge(totals(1248, 312));

    expect(svg).toContain('1,248 views · 312 visitors');
  });

  it('is an image with a readable description for a screen reader', () => {
    const svg = renderBadge(totals(1248, 312));

    expect(svg).toContain('role="img"');
    expect(svg).toContain('aria-label="github traffic: 1,248 views · 312 visitors"');
    expect(svg).toContain('<title>github traffic: 1,248 views · 312 visitors</title>');
  });

  it('grows with the text so nothing is cut off', () => {
    const narrow = Number(/width="(\d+)"/.exec(renderBadge(totals(1, 1)))?.[1]);
    const wide = Number(/width="(\d+)"/.exec(renderBadge(totals(1234567, 123456)))?.[1]);

    expect(wide).toBeGreaterThan(narrow);
  });

  it('escapes a label that carries markup', () => {
    const svg = renderBadge(totals(1, 1), '<script>');

    expect(svg).not.toContain('<script>');
    expect(svg).toContain('&#60;script&#62;');
  });

  it('draws an empty history without failing', () => {
    const svg = renderBadge(totals(0, 0));

    expect(svg).toContain('0 views · 0 visitors');
    expect(svg.startsWith('<svg')).toBe(true);
  });
});
