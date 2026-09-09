## Introduction

This document researches options for building a **personal daily hub** — a single page that surfaces a curated set of bookmarks alongside dashboard widgets (weather, calendar, RSS/news, quick notes, etc.). The core goal is a **lightweight web/JS app that can be deployed freely to static hosting providers such as Netlify**, and that serves as an internet-accessible start page for daily activities — not a locally-run desktop tool or a self-hosted server application.

A reference project ([danielrosehill/Day-Planner-Dashboard](https://github.com/danielrosehill/Day-Planner-Dashboard)) offers a useful feature checklist but is built for a different niche (a 7" kiosk screen, a local Flask app, tightly coupled to Gmail/Google Calendar OAuth) and is not suited to static hosting as-is.

Three broad approaches emerged from research, covered in turn below:

1. **Static/DIY web dashboard** — the primary fit for this project's goal: a lightweight static site, deployed to Netlify or a similar static host, with no server to run or maintain.
2. **Turnkey self-hosted dashboard apps** — existing open-source projects, mostly designed to run continuously via Docker rather than as a static deploy; useful as prior art and feature inspiration.
3. **Browser extension "new tab" replacements** — client-side only, per-browser, no hosting needed at all.

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
| Framework | Plain HTML/JS (like [Homer](https://github.com/bastienwirtz/homer)), Vue 3 + Vite, React/Next.js (static export), Svelte/SvelteKit (static adapter) | A framework-free build keeps the app dependency-light; Vite-based frameworks give fast builds and good static-export support, which suits a Netlify-style deploy well. |
| Bookmarks | JSON/YAML file committed to the repo, rendered as tiles/grid | Config-as-code — bookmarks and layout live in version control, editable via a normal commit. |
| Weather | [Open-Meteo](https://open-meteo.com/) (free, no API key, used by the reference project) or OpenWeatherMap | Open-Meteo is the simplest no-auth option for a purely client-side call, which matters since a static site has no server to hide keys behind. |
| Calendar | A Google Calendar "Embed" iframe, or client-side parsing of a public/secret **ICS feed** (e.g. with `ical.js`), or CalDAV for other providers | An embedded iframe needs no code; an ICS parse allows a custom-styled agenda list. |
| News/RSS | Client-side RSS parsing via a public CORS proxy, or a small serverless function (Netlify Functions, Vercel Edge Functions, Cloudflare Workers) to fetch/normalize feeds | Most static hosts ship a companion serverless-function product for exactly this kind of light backend need, without giving up the "no server to manage" property. |
| Hosting | **Netlify** (primary target — free tier, git-based deploys, built-in Functions), Vercel, Cloudflare Pages, GitHub Pages | All are free-tier, git-push-to-deploy static hosts; Netlify Functions or an equivalent covers any case where an API key needs to stay server-side. |
| Auth (optional) | Netlify Identity or a similar hosted auth add-on, or none if the page doesn't need to be gated | Only relevant if the page should not be publicly viewable as-is. |

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

Given the stated goal — a lightweight web/JS app deployable freely to sites like Netlify, serving as an internet start page for daily activities — **Option 1 (DIY static dashboard)** is the direct fit:

1. Build a small static site (framework-free or a lightweight Vite-based framework) with bookmarks and widget layout defined as JSON/YAML in the repo.
2. Use Open-Meteo for weather and either an embedded calendar or client-side ICS parsing for calendar data — both work without a backend.
3. Deploy to Netlify with git-based continuous deployment; reach for Netlify Functions (or an equivalent) only for the rare case of needing to keep an API key off the client.
4. Optionally, once the page has a public URL, pair it with a "New Tab Override"-style browser extension (Option 3) to make it the default new-tab page.

Option 2 (turnkey self-hosted apps) remains useful as a source of feature ideas and UX patterns — particularly Homepage and Glance for widget breadth, and Homer as the one example that is itself a static deploy — but as a category it targets a persistent-server hosting model rather than the static/Netlify deployment this project is aiming for.

## Links Reference

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
- [Netlify documentation](https://docs.netlify.com/)

## Next Steps

Once a direction is chosen, possible follow-ups include:
- Scaffolding the repo structure for the DIY static approach (framework choice, bookmarks config schema, weather/calendar widget stubs, Netlify deploy configuration), or
- Deeper research on a specific integration (e.g. ICS/calendar parsing approaches, or a full widget inventory for Homepage/Glance as design references).
