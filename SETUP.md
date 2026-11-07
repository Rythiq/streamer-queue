# Setup

Two things to do: connect a database, then publish the site.
Total time: about 10 minutes. Cost: 0, permanently.

---

## Why a database is needed

GitHub Pages only serves static files. It cannot store a queue.

The app uses Firebase Realtime Database, which has a free
"Spark" plan that does not require a billing account.

No billing account means no payment method on file. Nothing can
be charged. Overuse is blocked, never billed.

Do **not** upgrade to Blaze.
If a screen asks for a credit card, you are in the wrong place.

---

## Part 1 - Firebase

### 1. Create the project

1. Go to <https://console.firebase.google.com>
2. Click **Add project**
3. Project name: `streamer-queue`
4. Turn **off** Google Analytics
5. Click **Create project**

### 2. Create the Realtime Database

1. Left sidebar: **Build**
2. Click **Realtime Database**
3. Click **Create Database**
4. Pick the region closest to you
5. Choose **Start in locked mode**
6. Click **Enable**

Do not enable Firestore, Hosting, or Functions.

### 3. Paste the security rules

These rules are what make the queue secure. They run on Google's
servers, not in the browser.

1. Still in **Realtime Database**
2. Open the **Rules** tab
3. Select everything and delete it
4. Open `database.rules.json` from this repo
5. Paste its full contents into the editor
6. Click **Publish**

What the rules enforce:

- Anyone with the link can read the queue.
- Anyone with the link can add their own name.
- Only the browser holding the queue's admin key can rename the
  queue, change its status, kick people, or reset it.
- The admin key itself is never readable by any client.
- Leave tokens are never readable by any client.

### 4. Register the web app

1. Click the gear icon (top left)
2. Click **Project settings**
3. Scroll to **Your apps**
4. Click the `</>` icon (web)
5. App nickname: `web`
6. Click **Register app**

### 5. Copy the config

Firebase shows a block like this:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "streamer-queue.firebaseapp.com",
  databaseURL: "https://streamer-queue-default-rtdb.firebaseio.com",
  projectId: "streamer-queue",
  storageBucket: "streamer-queue.firebasestorage.app",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef",
};
```

Paste those values into `src/firebase-config.ts`.
Replace every `PASTE_...` placeholder.

Notes:

- `apiKey` is **not** a secret. It is a public project id.
  Safety comes from the rules in step 3.
- `databaseURL` must be copied exactly. It may contain a region,
  for example `europe-west1.firebasedatabase.app`.

### 6. Confirm it worked

Run `npm run dev` and open the site. The demo banner should
disappear. If it still says demo mode, the config file was not
saved or `databaseURL` is still a placeholder.

---

## Part 2 - GitHub Pages

The site is published from a `gh-pages` branch. To publish the
current state at any time:

```bash
npm run deploy
```

That builds the site and pushes the result to `gh-pages`.

One-time setup:

1. Open the repo on GitHub
2. **Settings**
3. **Pages** in the left sidebar
4. Under **Build and deployment**, set **Source** to
   **Deploy from a branch**
5. Branch: `gh-pages`, folder: `/ (root)`
6. Save

`docs/github-actions-deploy.yml` is an optional workflow for
auto-deploy on push. GitHub only accepts workflow files from a
token with the `workflow` scope, so it is not enabled by default.
Use one deployment method, not both.

Your site will be at:

```
https://<your-username>.github.io/<repo-name>/
```

---

## How the app works

### Creating a queue

Anyone who opens the site can create a queue. There is no
account, no approval, no owner role on the site itself.

When you create a queue, the app generates:

- a random queue id, which becomes the viewer link;
- a random admin key, which is stored only in the browser that
  created the queue.

You land on the management screen for that queue immediately.

### Management is tied to the browser

This is the important part.

The admin key is kept in that browser's local storage. It is not
part of any URL, so there is no owner link to copy around.

That means:

- Only the browser that created the queue can manage it.
- Opening the same queue in another browser gives you the viewer
  view, nothing more.
- Clearing site data, using private browsing, or switching
  devices permanently loses management of that queue.

The queue itself keeps working for viewers. You just can no
longer rename it, pause it, kick people, or reset it.

That is the deliberate trade-off. A recovery mechanism would
also be a takeover mechanism.

### The viewer link

```
https://you.github.io/streamer-queue/#/q/QUEUE_ID
```

Share this one. Viewers type a name, join, and see their
position update live. They can leave at any time. They cannot
manage anything.

### No public list

There is no directory of queues. A queue only exists for people
who have its link. Queue ids are 22 random characters, so they
cannot be guessed.

---

## Free tier limits

Realtime Database, Spark plan, per project:

| Limit | Value |
| --- | --- |
| Simultaneous connections | 100 |
| Stored data | 1 GB |
| Downloads | 10 GB / month |

Each viewer with the page open uses one connection.

Practical guidance:

- Up to about 80 viewers at once: comfortable.
- Above 100 viewers at once: the extra viewers cannot connect.
- Nothing breaks silently and nothing is billed. The database
  refuses the extra connections until some close.

If you ever need more, that requires the paid Blaze plan, which
is the one thing this setup deliberately avoids.

---

## Security model

Honest summary of what is and is not protected.

Protected, enforced by server-side rules:

- Only the holder of the admin key can change queue settings.
- The admin key cannot be read out of the database.
- Queue ids are unguessable.
- Leave tokens cannot be read, so nobody can mark you as having
  left without your token.

Not protected, because there is no login:

- Anyone with the viewer link can add names to the queue.
- Anyone with the viewer link could add junk entries. The owner
  can kick them from the management screen.

This is the trade-off for "no login, just type a name".
