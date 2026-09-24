// The only route. Vercel calls it once a day on the schedule declared in
// vercel.json; nobody else can, because a caller without the scheduler's
// secret is refused before anything is read or written.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { run } from '../src/collect.js';

export default async function refresh(request: VercelRequest, response: VercelResponse) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.authorization !== `Bearer ${secret}`) {
    return response.status(401).json({ error: 'This route is for the scheduler.' });
  }

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repository = process.env.GITHUB_REPOSITORY_NAME ?? 'traffic-keeper';
  const readmeRepositories = (process.env.README_REPOSITORIES ?? repository)
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);
  if (!token || !owner) {
    return response.status(500).json({ error: 'GITHUB_TOKEN and GITHUB_OWNER are required.' });
  }

  try {
    const result = await run({ token, owner, repository, readmeRepositories });
    return response.status(200).json(result);
  } catch (error) {
    // The message never carries the token: it is read from the
    // environment and never put in a URL or an error.
    return response.status(502).json({ error: error instanceof Error ? error.message : 'Unknown failure' });
  }
}
