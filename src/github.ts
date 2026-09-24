// What we read from GitHub: which repositories to follow, and what its
// traffic endpoint measured for each of them over the last fourteen days.

import type { DayRow } from './history.js';

const API = 'https://api.github.com';

export class GitHubError extends Error {
  constructor(
    readonly status: number,
    readonly path: string,
    message: string,
  ) {
    super(`${path} answered ${status}: ${message}`);
    this.name = 'GitHubError';
  }
}

async function get<T>(token: string, path: string): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'traffic-keeper',
    },
  });
  if (!response.ok) {
    throw new GitHubError(response.status, path, (await response.text()).slice(0, 200));
  }
  return (await response.json()) as T;
}

interface RepositoryAnswer {
  name: string;
  fork: boolean;
  archived: boolean;
  private: boolean;
}

// Every public repository the owner wrote themselves. Forks and archived
// ones are left out: their traffic says nothing about this account's work.
// A repository listed here later is picked up without changing anything.
export async function listRepositories(token: string, owner: string): Promise<string[]> {
  const names: string[] = [];
  for (let page = 1; page <= 10; page++) {
    const answer = await get<RepositoryAnswer[]>(
      token,
      `/users/${owner}/repos?per_page=100&type=owner&sort=full_name&page=${page}`,
    );
    for (const repository of answer) {
      if (!repository.fork && !repository.archived && !repository.private) names.push(repository.name);
    }
    if (answer.length < 100) break;
  }
  return names.sort((a, b) => a.localeCompare(b));
}

interface ViewsAnswer {
  views?: { timestamp: string; count: number; uniques: number }[];
}

// The fourteen day window, one row per day. GitHub sends whole days plus
// the day under way, which will be sent again tomorrow with its final
// figure; merging by date is what makes that harmless.
export async function readViews(token: string, owner: string, repository: string): Promise<DayRow[]> {
  const answer = await get<ViewsAnswer>(token, `/repos/${owner}/${repository}/traffic/views`);
  return (answer.views ?? []).map((day) => ({
    repository,
    date: day.timestamp.slice(0, 10),
    views: day.count,
    visitors: day.uniques,
  }));
}
