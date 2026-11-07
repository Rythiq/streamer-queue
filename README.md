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

## Local development

```bash
npm install
npm run dev
```

The app runs in **demo mode** until `src/firebase-config.ts` is
filled in. In demo mode all data lives in this browser's local
storage, and a banner says so. Open two tabs to see the queue
sync between them.

## Build

```bash
npm run build
```

Output goes to `dist/`. Vite is configured with `base: './'`, so
the build works from any GitHub Pages project subpath.

## Deploy

Push to `main`. `.github/workflows/deploy.yml` builds the site
and publishes it with GitHub Pages.

One-time setup: repository Settings, then Pages, then set
Source to **GitHub Actions**.

## Security model

No login means no identity. The design protects **management**
rather than proving who anyone is.

Enforced by server-side database rules:

- Only the holder of the admin key can rename the queue, change
  its status, kick players, or reset it.
- The admin key is stored in a node that no client may read.
- Leave tokens are not readable, so nobody can mark you as
  having left without your token.
- Queue ids are 22 random characters and there is no public
  directory of queues.

Not enforced, by design:

- Anyone with the viewer link can add a name to the queue.

The owner can kick junk entries. See `SETUP.md` for the
reasoning and for the free tier limits.
