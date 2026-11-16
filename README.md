# LinkSanitizer

**Share links, not your data.** Paste any URL and get back a clean one, with the hidden tracking tags removed. No sign-up, no server; it all runs in your browser.

**Live site:** [unlink.forgesync.co.nz](https://unlink.forgesync.co.nz)

---

## Why clean your links?

Links copied from apps, newsletters and ads often carry extra query parameters. They don't change the page you land on. They exist to report back about you:

```
https://shop.example.com/shoes/trail-runner?size=10&utm_source=newsletter&utm_campaign=spring_sale&fbclid=IwAR2kX9fQ7vB3
                                            └ kept ┘└───────────────── removed ──────────────────────────────────────┘
```

| Type | Examples | What it does |
|---|---|---|
| **Click IDs** | `fbclid`, `gclid`, `msclkid`, `yclid` | A unique ID for a single click. Lets an ad network connect the visit to your account and ad profile. |
| **Share IDs** | `si` (YouTube, Spotify), `igshid` (Instagram) | Ties the link back to the account that shared it, so the platform can map who shares with whom. |
| **Campaign tags** | `utm_*`, `mc_cid`, `_hsenc`, `mkt_tok` | Record which email, post or ad brought you in. Across many sites, this builds a profile of your habits. |
| **Affiliate / referral** | `aff`, `ref`, `cjevent` | Attribute your visit (and purchases) to a third party. |

Removing them gives you a link that opens the same page, is shorter and easier to read, and doesn't carry your identity (or your friend's) along with it.

---

## Features

- Removes UTM tags, click IDs (`fbclid`, `gclid`, `msclkid`, …), share IDs and dozens of other common trackers, from both the query string and `#hash` parameters
- Keeps what the page needs, including YouTube timestamps (`t=`)
- Live link preview (title, description, image) so you can confirm the cleaned link still points to the right place
- Your own block list: add or remove parameters; saved in your browser's `localStorage`
- Lists any remaining unknown parameters with a one-click "block this" button

## Privacy

- Sanitization runs **entirely client-side**. No backend, no analytics, no accounts.
- The only outbound request is the optional preview: the **cleaned** URL (never the original) is sent to [microlink.io](https://microlink.io) to fetch page metadata.
- Your custom block list never leaves your browser.

---

## Host your own copy

You can run your own instance on **GitHub Pages for free** in about five minutes, with no server and no build tools on your machine. The included workflow detects your Pages URL automatically, so you don't need to edit any code.

### 1. Fork the repository

Click **Fork** at the top of this page and create the fork under your account. You can rename it (e.g. `clean-links`); the site URL will follow the repo name.

### 2. Enable GitHub Actions on your fork

GitHub disables workflows on new forks. Open your fork's **Actions** tab and click **"I understand my workflows, go ahead and enable them"**.

### 3. Turn on GitHub Pages

In your fork, go to **Settings → Pages**, and under **Build and deployment → Source**, choose **GitHub Actions**.

### 4. Deploy

Go to **Actions → Deploy to GitHub Pages → Run workflow** (on the `master` branch). From then on, every push to `master` redeploys automatically.

When the run finishes (≈1–2 minutes), your site is live at:

```
https://<your-username>.github.io/<repo-name>/
```

The URL is also shown in **Settings → Pages** and on the workflow run's summary.

### 5. (Optional) Use a custom domain

1. Add a DNS record with your domain provider:
   - **Subdomain** (e.g. `links.example.com`): a `CNAME` record pointing to `<your-username>.github.io`
   - **Apex domain** (e.g. `example.com`): `A` records to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
2. In **Settings → Pages → Custom domain**, enter the domain and save. Tick **Enforce HTTPS** once the certificate is issued (can take up to an hour).
3. Re-run the deploy workflow so the site is rebuilt for the root path.

> Recommended: [verify your domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages) in your account settings to prevent takeovers.

The `CNAME` file in this repo belongs to the upstream site and isn't used by the Actions deployment. Delete it from your fork to avoid confusion.

### Keeping your copy up to date

On your fork's main page, click **Sync fork → Update branch**. The push to `master` triggers a fresh deploy.

### Troubleshooting

| Symptom | Fix |
|---|---|
| Workflow fails at **Configure Pages** | Pages isn't enabled yet. Do step 3, then re-run. |
| Page loads but is unstyled / assets 404 | The site was built for the wrong path. Re-run the workflow after any change to your custom domain or repo name. |
| **Run workflow** button missing | Actions aren't enabled on the fork (step 2). |
| Custom domain shows a certificate error | Wait for GitHub to issue the certificate, then tick **Enforce HTTPS**. |

---

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Building

```bash
npm run build
```

Outputs a fully static site to `./out/`. Serve it with any static file server (e.g. `npx serve out`).

### Build-time environment variables

All are optional and set automatically by the deploy workflow.

| Variable | Purpose | Default |
|---|---|---|
| `NEXT_PUBLIC_BASE_PATH` | Sub-path the site is served from (e.g. `/LinkSanitizer`) | `""` |
| `NEXT_PUBLIC_REPO_URL` | Repo linked from the page header and footer | upstream repo |
| `NEXT_PUBLIC_COMMIT_SHA` | Shown (and linked) in the footer | hidden |

---

## Customising the default tracking parameter list

The built-in block list lives in `src/components/link-sanitizer-card.tsx`:

```ts
const DEFAULT_TRACKING_PARAMS = [
  'utm_source', 'utm_medium', 'utm_campaign', ...
];
```

Edit this array to change what every new visitor starts with. Visitors who have already customised their list keep theirs (it's stored in `localStorage`); they can click **Reset to Defaults** to pick up the new list.

---

## Tech stack

| Layer | What |
|---|---|
| Framework | Next.js 15 (static export, no server) |
| Styling | Tailwind CSS + shadcn/ui |
| Link preview | [microlink.io](https://microlink.io) free CORS API |
| Hosting | GitHub Pages via GitHub Actions |
| Fonts | Geist (bundled at build time) |

## Project structure

```
src/
  app/
    page.tsx          — page layout: top bar, hero, footer
    layout.tsx        — root HTML shell, metadata, fonts, toaster
    globals.css       — CSS tokens, gradient background, animations
  components/
    link-sanitizer-card.tsx       — main UI + all sanitization logic
    why-clean-links.tsx           — "why it matters", privacy and self-host sections
    ui/link-preview-display.tsx   — preview card component
  lib/
    getLinkPreview.ts — client-side metadata fetch via microlink.io
    site.ts           — repo URL / self-host guide links
    utils.ts          — cn() helper
.github/workflows/deploy.yml      — GitHub Actions → GitHub Pages
```
