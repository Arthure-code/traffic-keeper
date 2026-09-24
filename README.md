# traffic-keeper

Simple traffic counter for GitHub profiles and READMEs.

## Demo

![repo views](data/badge.svg)

## Deploy

Want this for your repositories?

1. Fork this repository.
2. Create a GitHub token, then set `GITHUB_TOKEN` and `GITHUB_OWNER`.
3. Run it once a day:

```bash
npm install
npm start
```

Any scheduler will do: a cron line on a server, a container, a hosted
function. For Vercel, `vercel.json` already carries the daily schedule and
`api/refresh.ts` is the route it calls.

4. Each run writes `data/badge.svg` back to your fork. Point at it from any
   README:

```markdown
![repo views](https://raw.githubusercontent.com/OWNER/traffic-keeper/main/data/badge.svg)
```

## Support

💖 If you like this project, give it a ⭐ and share it with friends!

## Licence

MIT. See [LICENSE](LICENSE).
