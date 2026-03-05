# LinkSanitizer

Paste a URL, get back a clean one — tracking parameters stripped, privacy preserved.

**Live site:** [unlink.forgesync.co.nz](https://unlink.forgesync.co.nz)

---

## What it does

- Removes UTM tags, click-tracking IDs (`fbclid`, `gclid`, `msclkid`, etc.) and dozens of other common tracking parameters from any URL
- Preserves everything that matters — including YouTube timestamps
- Shows a live link preview (title, description, image) via [microlink.io](https://microlink.io) so you can confirm the cleaned URL still points to the right place
- Lets you manage your own block list — add or remove parameters at runtime, persisted to `localStorage`
- Flags any remaining unknown query parameters and offers a one-click add to your block list

---

## Tech stack

| Layer | What |
|---|---|
| Framework | Next.js 15 (static export — no server) |
| Styling | Tailwind CSS + shadcn/ui |
| Link preview | [microlink.io](https://api.microlink.io) free CORS API |
| Hosting | GitHub Pages via GitHub Actions |
| Fonts | Geist (bundled at build time) |

All sanitization logic runs entirely in the browser — no backend, no data collection.

---

## Running locally

```bash
npm install
npm run dev
```

Open Link[http://localhost:3000](http://localhost:3000).

---

## Building

```bash
npm run build
```

Outputs a fully static site to `./out/`. Open `out/index.html` directly in a browser or serve it with any static file server.

---

## Deployment (GitHub Pages)

Pushing to `master` triggers the GitHub Actions workflow at `.github/workflows/deploy.yml`, which:

1. Runs `npm run build` (static export → `./out/`)
2. Uploads the `out/` directory as a Pages artifact
3. Deploys to GitHub Pages

**Custom domain:** The `CNAME` file contains `unlink.forgesync.co.nz`. Because the site is served at the root of a custom domain, `NEXT_PUBLIC_BASE_PATH` is set to `""` in the workflow. If you remove the custom domain and go back to `username.github.io/LinkSanitizer`, change it back to `/LinkSanitizer`.

**First-time setup:** In your GitHub repo → Settings → Pages → Source, select **GitHub Actions**.

---

## Customising the default tracking parameter list

The built-in block list lives in `src/components/link-sanitizer-card.tsx`:

```ts
const DEFAULT_TRACKING_PARAMS = [
  'utm_source', 'utm_medium', 'utm_campaign', ...
];
```

Edit this array to change what every new user starts with. Existing users who have customised their list won't be affected (their list is stored in `localStorage`).

---

## Project structure

```
src/
  app/
    page.tsx          — page layout and header
    layout.tsx        — root HTML shell, fonts, toaster
    globals.css       — CSS tokens, gradient background, keyframe animations
  components/
    link-sanitizer-card.tsx       — main UI + all sanitization logic
    ui/link-preview-display.tsx   — preview card component
  lib/
    getLinkPreview.ts — client-side metadata fetch via microlink.io
    utils.ts          — cn() helper
.github/workflows/deploy.yml      — GitHub Actions → GitHub Pages
```
