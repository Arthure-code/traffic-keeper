// A full run, driven by the environment and nothing else. Any scheduler
// can call it: a cron line on a server, a container, a hosted function.
//
//   GITHUB_TOKEN=... GITHUB_OWNER=... npm start

import { run } from '../src/collect.js';

const token = process.env.GITHUB_TOKEN;
const owner = process.env.GITHUB_OWNER;
const repository = process.env.GITHUB_REPOSITORY_NAME ?? 'traffic-keeper';
const readmeRepositories = (process.env.README_REPOSITORIES ?? repository)
  .split(',')
  .map((name) => name.trim())
  .filter(Boolean);

if (!token || !owner) {
  console.error('GITHUB_TOKEN and GITHUB_OWNER are required.');
  process.exit(1);
}

try {
  const result = await run({ token, owner, repository, readmeRepositories });
  console.log(result);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
