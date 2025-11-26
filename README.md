# Class Resources Browser

Lightweight single-page site for browsing and opening class resources served from `/contents`, with aggressive caching for static assets and PDFs.

## Setup
- `npm install`
- `npm run build:manifest` (ensure `/contents` exists and is populated first)
- Serve the folder statically, e.g. `npx serve .`

## Notes
- `/assets/mnc-logo.png` is a placeholder; replace it with a real logo if desired.
- Update the footer text in `index.html` to replace any placeholder name.
- Bump `CACHE_VERSION` in `sw.js` when updating static assets.
- Recommended Cache-Control headers for deployment:
  - `/index.html`: `Cache-Control: no-cache`
  - `/app.js`, `/styles.css`, `/sw.js`, `/assets/mnc-logo.png`, `/resources-manifest.json`: `Cache-Control: public, max-age=31536000, immutable`
  - `/contents/**`: `Cache-Control: public, max-age=31536000, immutable`
