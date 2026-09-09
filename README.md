## Starthub

A personal daily start page — bookmarks, weather, calendar, and a daily mountain photo — built as a static site. Background and option analysis: see [RESEARCH.md](./RESEARCH.md).

## Tech Stack

- **Next.js** (App Router, static export — `output: 'export'` in `next.config.js`)
- **React**, TypeScript, plain CSS (no UI framework/dependency beyond Next itself)
- Client-side data: [Open-Meteo](https://open-meteo.com/) for weather, Unsplash API for the daily photo, and an optional companion calendar proxy for events

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

## Configuration

Copy `.env.example` to `.env.local` and fill in what you need:

- **Weather** — no environment variable needed; edit the coordinates directly in `lib/config.ts`.
- **Mountain photo** — set `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY` (a free [Unsplash API](https://unsplash.com/developers) key). Without it, the widget shows a "not configured" placeholder instead of guessing at mountain photos from an unrelated source.
- **Calendar** — set `NEXT_PUBLIC_CALENDAR_API_URL` to point at the calendar-proxy service described below. Without it, the widget shows a "not configured" placeholder.
- **Bookmarks** — edit `data/bookmarks.json` directly; each entry is `{ "name": "Category", "links": [{ "label": "...", "url": "..." }] }`.

## Calendar Proxy (optional)

Next.js static export has no API routes, so connecting a real calendar (e.g. a Google account) needs a small separate service rather than a client-side call. `server/calendar-proxy.js` is a dependency-free Node script that fetches a Google Calendar "secret address in iCal format" URL server-side and serves it as JSON, so the URL itself never ships in the client bundle.

```bash
CALENDAR_ICS_URL="https://calendar.google.com/calendar/ical/.../basic.ics" \
CALENDAR_ALLOWED_ORIGIN="https://your-domain.example" \
npm run calendar-proxy
```

Run it alongside the static site (pm2, systemd, or a container) and point `NEXT_PUBLIC_CALENDAR_API_URL` at it (e.g. `http://localhost:4001/events`).

To get the ICS URL: in Google Calendar, go to the calendar's **Settings and sharing**, and copy the **Secret address in iCal format**.
