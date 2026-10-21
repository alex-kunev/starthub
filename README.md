## StartHub

A personal daily start page — clock & week view, saints of the day and "on this day" events, weather with air quality and a 7-day forecast, a connected calendar, a daily picture, and categorized bookmarks. Built as a static site. Background and option analysis: see [RESEARCH.md](./RESEARCH.md).

## Tech Stack

- **Next.js** (App Router, static export — `output: 'export'` in `next.config.js`)
- **React**, TypeScript, plain CSS (no UI framework/dependency beyond Next itself)
- Most data is fetched client-side from free, keyless public APIs; the calendar widget is the one exception — it goes through a small serverless function so a private calendar can stay private (see below)

## Running Locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:3000`.

## Building the Static Export

```bash
npm run build
```

Output goes to `out/` — a plain static site, deployable to any static file server or reverse proxy (Nginx, Caddy, etc).

## Widgets & Data Sources

| Widget | Source | Notes |
|---|---|---|
| Clock & week view | Local browser time | No network call |
| Saints of the day | [OrthodoxWiki](https://orthodoxwiki.org/) (via its MediaWiki API), linking out to [OCA's Lives of the Saints](https://www.oca.org/saints/lives) | Gregorian-dated page per day; falls back to link-only if the summary fetch fails |
| On this day | [Wikipedia "On this day" API](https://en.wikipedia.org/api/rest_v1/) | No key needed |
| Weather + 7-day forecast | [Open-Meteo](https://open-meteo.com/) | No key needed; edit coordinates in `lib/config.ts` |
| Air quality | [Open-Meteo Air Quality API](https://open-meteo.com/en/docs/air-quality-api) | European AQI |
| Calendar | Google Calendar's private "secret address in iCal format", fetched server-side by a small function | Calendar stays private — see **Calendar Setup** below |
| Picture of the day | Wikimedia Commons' "Picture of the Day", via Wikipedia's REST API | No key needed |
| Bookmarks | `data/bookmarks.json` | Config-as-code — each category renders as its own tile |

## Configuration

- **Weather location** — edit `lib/config.ts` (`siteConfig.weather`).
- **Calendar** — see **Calendar Setup** below; it's an environment variable, not something you edit in the repo.
- **Bookmarks** — edit `data/bookmarks.json` directly; each entry is `{ "name": "Category", "emoji": "💻", "color": "#5b9dff", "links": [{ "label": "...", "url": "..." }] }`.

## Calendar Setup (stays private — no public calendar sharing needed)

The calendar widget calls `/api/calendar`, which is served by a small serverless function rather than fetched directly from the browser — that's what lets it read a *private* calendar instead of requiring "Make available to public" sharing. The function itself lives in two forms so it works on either host without changes to the frontend:

- `api/calendar.js` — Vercel's zero-config `/api` serverless functions pick this up automatically.
- `netlify/functions/calendar.js` — Netlify's functions convention; `netlify.toml` also redirects `/api/calendar` to it, so the frontend's fetch path (`/api/calendar`) is identical on both hosts.

Both share the same ICS fetch/parse logic in `lib/calendar/parseIcs.js`.

**Setup:**

1. In Google Calendar, go to the specific calendar's **Settings and sharing** (not the general settings) → **Integrate calendar** → copy the **"Secret address in iCal format"**. This works regardless of the calendar's sharing settings — it does not need to be public.
2. Set it as an environment variable named `CALENDAR_ICS_URL` in your hosting platform's dashboard (Netlify: Site configuration → Environment variables; Vercel: Project Settings → Environment Variables) — **never** commit it to the repo, and never prefix it with `NEXT_PUBLIC_` (that would ship it to every visitor's browser).
3. For local development, put it in `.env.local` (already gitignored) — see `.env.example`.

Treat that URL as a credential: anyone with it can read your calendar. You can reset it anytime from the same "Integrate calendar" page if it ever leaks.

## Deploying to Netlify

`netlify.toml` disables Netlify's post-processing "Asset optimization" for JS (`build.processing.js.bundle`/`minify = false`). Next.js's own production build already minifies the client bundle; Netlify's extra pass can re-mangle modern `async`/`await` output, which shows up in the browser console as `Uncaught ReferenceError: regeneratorRuntime is not defined` and silently breaks every widget that fetches data. If you still see that error after deploying with `netlify.toml` present, double-check Site configuration → Build & deploy → Post processing → Asset optimization is off in the Netlify dashboard too (a manually-set dashboard toggle can coexist with the repo config), then trigger a fresh deploy (clear cache).
