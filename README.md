# NextUp

A live 1v1 viewer queue for streamers.

Create a queue, share one link, and everyone in chat can join
with nothing but a name. They see their position update in real
time. No accounts, no logins, no sign-ups.

- Static site on GitHub Pages
- Firebase Realtime Database for live state
- Zero cost by construction (no billing account, ever)

## Links

- `SETUP.md` — full setup guide in markdown
- `FIREBASE-SETUP.txt` — the same guide as plain text
- `REPUBLISH-RULES.txt` — plain text note about re-publishing rules

## Local development

```bash
npm install
npm run dev
```

The app runs in **demo mode** when `src/firebase-config.ts` still
contains placeholders. In demo mode all data lives in this
browser's local storage and a banner says so. Open two tabs to
see the queue sync between them.

## Build

```bash
npm run build
```

Output goes to `dist/`. Vite uses `base: './'`, so the build
works from any GitHub Pages project subpath.

## Deploy

```bash
npm run deploy
```

Builds the site and force-pushes the result to the `gh-pages`
branch, which is what GitHub Pages serves.

One-time setup: repository **Settings**, then **Pages**, then set
Source to **Deploy from a branch**, branch `gh-pages`, folder
`/ (root)`.

### Optional: auto-deploy on every push

`docs/github-actions-deploy.yml` is a ready-made workflow.

GitHub refuses to accept workflow files from a token without the
`workflow` scope, so enabling this needs one command of yours:

```bash
gh auth refresh -s workflow
mkdir -p .github/workflows
cp docs/github-actions-deploy.yml .github/workflows/deploy.yml
```

Then switch Pages Source to **GitHub Actions**. Do not use both
deployments at once; pick one source.

## Security model

No login means no identity. The design protects **management**
rather than proving who anyone is.

Enforced by server-side database rules:

- Only a browser holding the queue's admin key can rename the
  queue, change its status, kick players, or reset it.
- The admin key is never readable by any client.
- Leave tokens are not readable, so nobody can mark you as
  having left without your token.
- Queue ids are 22 random characters and there is no public
  directory of queues.

Not enforced, by design:

- Anyone with the viewer link can add a name to the queue.

The owner can kick junk entries. See `SETUP.md` for the reasoning
and for the free tier limits.
