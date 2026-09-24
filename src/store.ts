// The repository is the database. Two files are read and written back
// through the contents API, so there is nothing else to host and every
// change is a commit anyone can audit.

const API = 'https://api.github.com';

interface StoredFile {
  /** Decoded text, empty when the file does not exist yet. */
  text: string;
  /** The blob the write must replace, undefined for a first write. */
  sha?: string;
}

function headers(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'traffic-keeper',
    'Content-Type': 'application/json',
  };
}

export async function readFile(
  token: string,
  owner: string,
  repository: string,
  path: string,
): Promise<StoredFile> {
  const response = await fetch(`${API}/repos/${owner}/${repository}/contents/${path}`, {
    headers: headers(token),
  });
  if (response.status === 404) return { text: '' };
  if (!response.ok) throw new Error(`Reading ${path} answered ${response.status}`);
  const answer = (await response.json()) as { content: string; sha: string };
  return { text: Buffer.from(answer.content, 'base64').toString('utf8'), sha: answer.sha };
}

export async function writeFile(
  token: string,
  owner: string,
  repository: string,
  path: string,
  text: string,
  sha: string | undefined,
  message: string,
): Promise<void> {
  const response = await fetch(`${API}/repos/${owner}/${repository}/contents/${path}`, {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify({
      message,
      content: Buffer.from(text, 'utf8').toString('base64'),
      ...(sha ? { sha } : {}),
    }),
  });
  if (!response.ok) {
    throw new Error(`Writing ${path} answered ${response.status}: ${(await response.text()).slice(0, 200)}`);
  }
}
