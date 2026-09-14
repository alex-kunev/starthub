## StartHub

A personal daily start page — clock & week view, saints of the day and "on this day" events, weather with air quality and a 7-day forecast, a connected calendar, a daily picture, and categorized bookmarks. Built as a static site. Background and option analysis: see [RESEARCH.md](./RESEARCH.md).

## Tech Stack

- **Next.js** (App Router, static export — `output: 'export'` in `next.config.js`)
- **React**, TypeScript, plain CSS (no UI framework/dependency beyond Next itself)
- All data is fetched client-side from free, keyless public APIs — no backend, no environment variables required

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
| Calendar | Google Calendar's public embed | Only works for a calendar shared as "Make available to public"; configured in `lib/config.ts` |
| Picture of the day | Wikimedia Commons' "Picture of the Day", via Wikipedia's REST API | No key needed |
| Bookmarks | `data/bookmarks.json` | Config-as-code — each category renders as its own tile |

## Configuration

Everything is configured directly in the repo — no environment variables needed:

- **Weather location** — edit `lib/config.ts` (`siteConfig.weather`).
- **Calendar** — edit `lib/config.ts` (`siteConfig.calendar.calendarId`). The id is the calendar owner's address (or a group calendar id); the calendar must be shared publicly in Google Calendar's sharing settings for the embed to show anything.
- **Bookmarks** — edit `data/bookmarks.json` directly; each entry is `{ "name": "Category", "emoji": "💻", "color": "#5b9dff", "links": [{ "label": "...", "url": "..." }] }`.
