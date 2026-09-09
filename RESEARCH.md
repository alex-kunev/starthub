## Introduction

This document researches options for building a **personal daily hub** — a single page that surfaces a curated set of bookmarks alongside dashboard widgets (weather, calendar, RSS/news, quick notes, etc.). The core goal is a **lightweight web/JS app**, built as a static export and served from self-managed hosting, that acts as an internet-accessible start page for daily activities — not a locally-run desktop tool.

A reference project ([danielrosehill/Day-Planner-Dashboard](https://github.com/danielrosehill/Day-Planner-Dashboard)) offers a useful feature checklist but is built for a different niche (a 7" kiosk screen, a local Flask app, tightly coupled to Gmail/Google Calendar OAuth) and is not suited to static hosting as-is.

Three broad approaches emerged from research, covered in turn below:

1. **Static/DIY web dashboard** — the primary fit for this project's goal: a lightweight static site, deployable to Netlify-style hosts or served from self-managed hosting, with no application server logic required.
2. **Turnkey self-hosted dashboard apps** — existing open-source projects, mostly designed to run continuously via Docker rather than as a static deploy; useful as prior art and feature inspiration.
3. **Browser extension "new tab" replacements** — client-side only, per-browser, no hosting needed at all.

## Selected Configuration

Based on the options below, the following direction has been chosen for this project:

- **Tech stack:** React + Next.js, using **static export** (`next.config` `output: 'export'`) — no Next.js server, API routes, or middleware; the build output is plain static HTML/CSS/JS.
- **Hosting:** Self-hosted (the static export served from infrastructure managed independently, e.g. Nginx/Caddy behind a reverse proxy, rather than a managed platform like Netlify). Because it's self-hosted rather than a locked-down static host, a small companion backend/proxy can still be added later if a feature needs one (e.g. keeping an OAuth client secret server-side) without changing the frontend build.
- **Widgets:** weather ([Open-Meteo](https://open-meteo.com/), no API key required), a calendar widget that connects to a Google/Gmail account to display events, and a daily mountain photo.
- **Bookmarks:** a categorized personal link list (Tech, News, Hobby, Faith, Facebook, and a "2026" category for time-bound items), listed in full under [Bookmarks (Dashboard Content)](#bookmarks-dashboard-content) below.

A note on the calendar widget specifically: a Next.js static export cannot run server-side API routes, so a Google account connection (OAuth) needs either (a) a client-side OAuth flow (e.g. Google Identity Services / PKCE, which needs no server), or (b) a small separate backend/proxy service — feasible here since hosting is self-managed — to hold the OAuth client secret and refresh tokens. Both are compatible with keeping the frontend itself a static export.

## Reference Project: Day-Planner-Dashboard

- **Repo:** [danielrosehill/Day-Planner-Dashboard](https://github.com/danielrosehill/Day-Planner-Dashboard)
- **What it is:** A compact dashboard designed for a 7" kiosk screen (800×480 / 1024×600), showing local/UTC time, latest emails, today/tomorrow's calendar events, a countdown to the next meeting, weather, and news headlines.
- **Tech stack:** Python 3.10+ / Flask backend, plain HTML/CSS (CSS Grid) frontend, no JS framework.
- **Data sources:** Google APIs (Gmail + Calendar via OAuth), [Open-Meteo](https://open-meteo.com/) for weather (no API key needed), Google News RSS for headlines.
- **Deployment:** Local only — `python app.py`, served at `127.0.0.1:5000`. Not designed for static/cloud hosting.
- **Takeaway:** A good feature checklist to draw from (time, mail, calendar, countdown, weather, news), but the architecture (server-rendered Flask app with OAuth) is not compatible with a static-hosting deployment model. Useful for ideas, not as a base to fork.

## Option 1: Static / DIY Web Dashboard (primary fit)

A lightweight static site built with plain JS or a small frontend framework, deployed to a static host such as Netlify, Vercel, Cloudflare Pages, or GitHub Pages. This matches the project's stated goal directly: no backend server to run, free-tier hosting, and a deploy that's just "push to git."

### Reference implementation: darekkay/dashboard
- **Repo:** [darekkay/dashboard](https://github.com/darekkay/dashboard) · **Live demo:** [dashboard.darekkay.com](https://dashboard.darekkay.com)
- **Tech stack:** React + TypeScript, Tailwind CSS, React Testing Library, Font Awesome/Unicons.
- **Features:** 16 widgets (clock, weather, todo, bookmarks, calendar, etc.), dark mode, multi-language, fully static build.
- **License:** MIT — forkable as a starting point.
- **Deployment model:** Static build output, hostable anywhere — this is close to the target model for a Netlify-style deployment.

### Build-your-own stack options
| Layer | Options | Notes |
|---|---|---|
| Framework | **React/Next.js (static export)** — selected; alternatives: plain HTML/JS (like [Homer](https://github.com/bastienwirtz/homer)), Vue 3 + Vite, Svelte/SvelteKit (static adapter) | Next.js static export (`output: 'export'`) gives a component-based structure and a large ecosystem while still producing a plain static bundle. |
| Bookmarks | JSON/YAML file committed to the repo, rendered as tiles/grid | Config-as-code — bookmarks and layout live in version control, editable via a normal commit. |
| Weather | **[Open-Meteo](https://open-meteo.com/)** (free, no API key, used by the reference project) | Selected — simplest no-auth option for a purely client-side call, which matters since the static export has no server of its own to hide keys behind. |
| Calendar | **Google account connection** (client-side OAuth, or a small self-hosted proxy for server-side token handling), vs. a simpler Google Calendar "Embed" iframe or client-side **ICS feed** parsing (e.g. with `ical.js`) | An account connection gives read access to real calendar data rather than a single public calendar; feasible here because hosting is self-managed, so a companion token-handling service can run alongside the static site if needed. |
| Daily photo | A rotating "mountain photo of the day" widget — e.g. a photo API call (Unsplash-style) filtered to a mountain query, made client-side, or a small self-hosted job that picks/serves one | Purely decorative widget; simplest as a client-side API call, same pattern as weather. |
| News/RSS | Client-side RSS parsing via a CORS proxy, or a small self-hosted service to fetch/normalize feeds | With self-managed hosting, this can be a small companion service rather than a public CORS proxy. |
| Hosting | **Self-hosted** — the static export served via a reverse proxy (Nginx/Caddy) or a lightweight container, on infrastructure managed independently (as opposed to a managed platform like Netlify/Vercel) | Selected. Netlify/Vercel/Cloudflare Pages/GitHub Pages remain valid alternatives if managed hosting is preferred later — the static build output is portable to any of them without changes. |
| Auth (optional) | Self-managed (e.g. a reverse-proxy auth layer, or none if the page doesn't need to be gated) | Only relevant if the page should not be publicly viewable as-is. |

### Why this option fits the goal
- Deploys with a straightforward `git push` to Netlify (or an equivalent host) — no server to provision, patch, or pay for beyond a free tier.
- Config-as-code (bookmarks/widgets as JSON/YAML in the repo) keeps the dashboard's content version-controlled and easy to change via a normal commit.
- Lightweight by construction: a static bundle plus a handful of client-side API calls, rather than a persistent backend process.

## Option 2: Turnkey Self-Hosted Dashboard Apps (reference / alternative)

These are mature open-source projects built for a closely related use case (originally "homelab start pages"), included here as prior art and a feature/UX reference. Most assume a persistently running server (typically via Docker) rather than a static deploy, so they diverge from the "deploy freely to Netlify" goal, but they're a useful source of ideas and comparison points.

### Comparison Table

| Project | Tech Stack | Config Style | Widgets (weather/calendar/RSS) | Hosting Model |
|---|---|---|---|---|
| **[Homepage](https://github.com/gethomepage/homepage)** (gethomepage) | Next.js | YAML files (git-friendly) | 40+ widgets incl. weather, RSS, calendar, service/infra stats | Runs as a persistent Docker service |
| **[Homarr](https://homarr.dev/)** ([GitHub](https://github.com/homarr-labs/homarr)) | Next.js, TypeScript, tRPC, Redis | Drag-and-drop web UI, no config file | Weather, calendar, RSS, web search, container health | Persistent Docker service + Redis |
| **[Dashy](https://github.com/Lissy93/dashy)** | Vue.js | YAML + built-in visual editor with live preview | Status checks, themes, icon packs, widgets | Docker service, though a static build is also possible |
| **[Glance](https://github.com/glanceapp/glance)** | Go (single static binary/Docker) | Single YAML file (`glance.yml`), hot-reload, `!include` for modular config | Weather, RSS/feeds, markets, videos, custom widgets | Persistent process/Docker service |
| **[Homer](https://github.com/bastienwirtz/homer)** | Vue.js, **fully static** (no backend/DB) | One `config.yml`, edit + refresh | Minimal — mostly links/service tiles, some community widgets | Fully static — the closest of this group to a Netlify-style deploy |
| **[Flame](https://github.com/pawelmalak/flame)** | React + Express | Built-in editors (no file editing needed) | Weather widget (cloud cover, animated status), built-in search | Persistent Node/Express service |
| **Heimdall Application Dashboard** ([GitHub](https://github.com/linuxserver/Heimdall)) | PHP/Laravel | Web UI | Service "integrations" showing live info on tiles | Persistent PHP service |

### Notes
- **Homer** stands out as the one project in this group that is fully static and could realistically be deployed to Netlify as-is, though its widget set is the weakest of the group (mostly link tiles rather than live data).
- **Homepage** and **Glance** offer the richest git-tracked YAML config plus real weather/RSS/calendar widgets, at the cost of needing a persistent runtime rather than a static deploy.
- **Homarr** offers the friendliest UI-driven setup, but requires a backend plus Redis running somewhere continuously.

## Option 3: Browser "New Tab" Extensions

Client-side only, no hosting required — replaces a browser's new-tab page directly.

- **[Tabliss](https://tabliss.io/)** ([GitHub](https://github.com/joelshepherd/tabliss)) — open-source, plugin-based new tab page with weather (OpenWeatherMap), bookmark groups, quotes, backgrounds, and a large community plugin list. Available for Chrome/Firefox.
- Similar tools: Momentum (closed-source/freemium), or generic "New Tab Override" (Firefox) / "Custom New Tab URL" (Chrome) extensions that point the new-tab page at *any* URL — including a self-built page from Option 1, combining the two approaches (host the page on Netlify, then use a small extension to make it the browser's new tab).
- **Trade-off:** Extensions are per-browser/per-device (no shared state unless the extension syncs) and generally less extensible than a self-built page. Best used as a *complement* to Option 1 rather than a replacement.

## Recommendation

Given the [Selected Configuration](#selected-configuration) above, **Option 1 (DIY static dashboard)** is the direct fit, built as follows:

1. Scaffold a Next.js app with `output: 'export'` set, so `next build` produces a plain static bundle deployable anywhere.
2. Define bookmarks and widget layout as JSON/YAML in the repo (config-as-code), rendered as tiles/grid — see [Bookmarks (Dashboard Content)](#bookmarks-dashboard-content) for the initial link set.
3. Add the weather widget via Open-Meteo (client-side call, no key needed).
4. Add the calendar widget via a client-side Google OAuth flow, or a small self-hosted proxy service if server-side token handling is preferred.
5. Add a daily mountain photo widget (e.g. a rotating image source or a photo API call made client-side).
6. Serve the static export from self-managed hosting (reverse proxy in front of a static file server, or a container serving the build output).
7. Optionally, once the page has a stable URL, pair it with a "New Tab Override"-style browser extension (Option 3) to make it the default new-tab page.

Option 2 (turnkey self-hosted apps) remains useful as a source of feature ideas and UX patterns — particularly Homepage and Glance for widget breadth, and Homer as the one example that is itself a static deploy — but as a category it targets a persistent always-on service model rather than a static React/Next.js export.

## Bookmarks (Dashboard Content)

The initial bookmark set for the dashboard, grouped by category as they will appear on the page.

### Tech
- [The New Stack](https://thenewstack.io/)
- [Hacker News](https://news.ycombinator.com/)
- [The Engineering Mindset](https://theengineeringmindset.com/)
- [Medium](https://medium.com/)
- [Martin Alderson](https://martinalderson.com/)

### News
- [Reuters](https://www.reuters.com/)
- [БНТ новини](https://bntnews.bg/)
- [bNews.bg](https://bnews.bg/)
- [money.bg](https://money.bg/)
- [pariteni.bg](https://pariteni.bg/)

### Hobby
- [sportal.bg](https://sportal.bg/)
- [FIA Formula 2 Calendar](https://www.fiaformula2.com/Calendar)
- [Celsi Blog](https://celsi.bg/blog/)
- [БНР – Музика (Sofia)](https://bnrnews.bg/sofia/list/muzica)
- [iFactsBG](https://ifactsbg.com/)
- [Vicove — Новини](https://www.vicove.biz/novi)

### Faith
- [Българска патриаршия — Новини](https://bg-patriarshia.bg/news)
- [UOJ.news](https://uoj.news/)

### Facebook
- [Дневното четиво](https://www.facebook.com/DnevnotoChetivo)
- [Facebook Group](https://www.facebook.com/groups/2021908914616022)
- [Емилия Дворянова](https://www.facebook.com/emiliya.dvoryanova)
- [Отец Владимир Дойчев](https://www.facebook.com/otecvladimir.doychev)
- [gkadiev](https://www.facebook.com/gkadiev/)

### 2026
- [MaistorExpo 2026](https://lozanov.bg/maistorexpo-2026/)
- [5km Run](https://5kmrun.bg/)
- [Поклонение за празника на Св. Злата](https://poklonnik.bg/st_tour/%D0%BF%D0%BE%D0%BA%D0%BB%D0%BE%D0%BD%D0%B5%D0%BD%D0%B8%D0%B5-%D0%B7%D0%B0-%D0%BF%D1%80%D0%B0%D0%B7%D0%BD%D0%B8%D0%BA%D0%B0-%D0%BD%D0%B0-%D1%81%D0%B2-%D0%B7%D0%BB%D0%B0%D1%82%D0%B0-%D0%BC%D1%8A%D0%B3/)
- [Sofia Stage](https://sofiastage.com/)

*(The MaistorExpo 2026 link is stored above without its tracking query string — the original included Facebook click-tracking parameters (`fbclid`, `utm_*`) which are safe to drop since they only affect ad-attribution, not the destination page.)*

## Links Reference (Research Sources)

- [danielrosehill/Day-Planner-Dashboard](https://github.com/danielrosehill/Day-Planner-Dashboard) — reference project
- [darekkay/dashboard](https://github.com/darekkay/dashboard) (live: [dashboard.darekkay.com](https://dashboard.darekkay.com))
- [gethomepage/homepage](https://github.com/gethomepage/homepage)
- [Homarr](https://homarr.dev/) / [homarr-labs/homarr](https://github.com/homarr-labs/homarr)
- [Lissy93/dashy](https://github.com/Lissy93/dashy)
- [glanceapp/glance](https://github.com/glanceapp/glance)
- [bastienwirtz/homer](https://github.com/bastienwirtz/homer)
- [pawelmalak/flame](https://github.com/pawelmalak/flame)
- [linuxserver/Heimdall](https://github.com/linuxserver/Heimdall)
- [Tabliss](https://tabliss.io/) / [joelshepherd/tabliss](https://github.com/joelshepherd/tabliss)
- [Open-Meteo](https://open-meteo.com/) — free weather API, no key required
- [Netlify documentation](https://docs.netlify.com/) — kept as a managed-hosting alternative, even though self-hosting is the current choice

## Next Steps

Possible follow-ups include:
- Scaffolding the Next.js (static export) repo structure: bookmarks config schema (matching the categories above), widget components (weather, calendar, daily photo), and the self-hosting deploy setup (reverse proxy / container).
- Deciding the calendar widget's OAuth approach (client-side vs. a small self-hosted proxy service) before implementation.
- Picking a concrete source for the daily mountain photo widget (a specific photo API vs. a self-hosted rotating image set).
