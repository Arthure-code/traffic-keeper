# traffic-keeper

Simple traffic counter for GitHub profiles and READMEs.

## Demo

![repo views](data/badge.svg)

## Deploy

Want this for your repositories?

1. Fork this repository.
2. Import your fork on Vercel.
3. Create a GitHub token and add it on Vercel as `GITHUB_TOKEN`, with your
   account name as `GITHUB_OWNER`.
4. The daily schedule writes `data/badge.svg` back to your fork. Point at it
   from any README:

```markdown
![repo views](https://raw.githubusercontent.com/OWNER/traffic-keeper/main/data/badge.svg)
```

## Support

💖 If you like this project, give it a ⭐ and share it with friends!

## Licence

MIT. See [LICENSE](LICENSE).
