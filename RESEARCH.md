## Introduction

This document researches options for building a **personal daily hub** — a single page you land on that surfaces your main bookmarks alongside dashboard widgets (weather, calendar, RSS/news, quick notes, etc.). The reference project ([danielrosehill/Day-Planner-Dashboard](https://github.com/danielrosehill/Day-Planner-Dashboard)) is a good inspiration point but is built for a specific niche (a 7" kiosk screen, local Flask app, tightly coupled to Gmail/Google Calendar OAuth). The goal here is to map out the broader landscape so you can pick an approach that fits how and where you actually want to run this (laptop new-tab page vs. always-on server vs. static site you deploy like any other project).

Three broad approaches emerged from research, covered in turn below:

1. **Turnkey self-hosted dashboard apps** — install/run an existing open-source project, configure via YAML or a web UI.
2. **Static/DIY web dashboard** — build (or fork) a lightweight static site and deploy it to GitHub Pages, Azure Static Web Apps, or similar — fits your existing Azure/GitHub workflow well.
3. **Browser extension "new tab" replacements** — client-side only, per-browser, no hosting needed at all.

Given your background, all recommendations lean toward things that are Git-friendly, config-as-code, and deployable the way you'd deploy any other side project (containers, static hosting, CI/CD) rather than click-ops SaaS tools.

## Reference Project: Day-Planner-Dashboard

- **Repo:** [danielrosehill/Day-Planner-Dashboard](https://github.com/danielrosehill/Day-Planner-Dashboard)
- **What it is:** A compact dashboard designed for a 7" kiosk screen (800×480 / 1024×600), showing local/UTC time, latest emails, today/tomorrow's calendar events, a countdown to the next meeting, weather, and news headlines.
- **Tech stack:** Python 3.10+ / Flask backend, plain HTML/CSS (CSS Grid) frontend, no JS framework.
- **Data sources:** Google APIs (Gmail + Calendar via OAuth), [Open-Meteo](https://open-meteo.com/) for weather (no API key needed), Google News RSS for headlines.
- **Deployment:** Local only — `python app.py`, served at `127.0.0.1:5000`. Not designed for cloud/public hosting.
- **Takeaway:** Good feature checklist to steal from (time, mail, calendar, countdown, weather, news), but the architecture is single-user/local-only. Worth cloning ideas, not the codebase.

## Option 1: Turnkey Self-Hosted Dashboard Apps

These are mature open-source projects built for exactly this use case (originally for homelab "start pages," but equally good as a personal daily hub). All are deployable via Docker, which fits an Azure Container Apps / VM / local Docker workflow.

### Comparison Table

| Project | Tech Stack | Config Style | Widgets (weather/calendar/RSS) | Best For |
|---|---|---|---|---|
| **[Homepage](https://github.com/gethomepage/homepage)** (gethomepage) | Next.js | YAML files (git-friendly) | 40+ widgets incl. weather, RSS, calendar, Docker/K8s/Proxmox stats | Power users who want deep integrations and config-as-code |
| **[Homarr](https://homarr.dev/)** ([GitHub](https://github.com/homarr-labs/homarr)) | Next.js, TypeScript, tRPC, Redis | Drag-and-drop web UI, no config file | Weather, calendar, RSS, web search, container health | Easiest UI-driven setup; multi-user/family use |
| **[Dashy](https://github.com/Lissy93/dashy)** | Vue.js | YAML + built-in visual editor with live preview | Status checks, themes, icon packs, widgets | Heavy customization/theming, status-page style |
| **[Glance](https://github.com/glanceapp/glance)** | Go (single static binary/Docker) | Single YAML file (`glance.yml`), hot-reload, `!include` for modular config | Weather, RSS/feeds, markets, videos, custom widgets | Lightweight "feed + stats" page rather than a launcher; great on low-power hardware (Raspberry Pi) |
| **[Homer](https://github.com/bastienwirtz/homer)** | Vue.js, **fully static** (no backend/DB) | One `config.yml`, edit + refresh | Minimal — mostly links/service tiles, some community widgets | Simplest possible setup; deployable as a static site (S3, GitHub Pages, Nginx) |
| **[Flame](https://github.com/pawelmalak/flame)** | React + Express | Built-in editors (no file editing needed) | Weather widget (cloud cover, animated status), built-in search | Easy in-browser customization without touching config files |
| **Heimdall Application Dashboard** ([GitHub](https://github.com/linuxserver/Heimdall)) | PHP/Laravel | Web UI | Service "integrations" showing live info on tiles | Users who want rich per-app integrations over general widgets |

### Notes
- **Homepage** and **Glance** are the strongest fits if you want git-tracked YAML config (fits DevOps instincts — PR your dashboard changes) plus real weather/RSS/calendar widgets.
- **Homer** is the closest to a true "static site" — no backend at all, so it can be hosted the same way as any static frontend (Azure Static Web Apps, GitHub Pages, blob storage + CDN) — but its widget ecosystem is the weakest of the group (mostly link tiles).
- **Homarr** is best if you'd rather never touch a config file, at the cost of needing a small backend + Redis running somewhere persistent.
- All of the above are typically run via `docker-compose`, which maps cleanly onto Azure Container Apps, an Azure VM, or a home server.

## Option 2: Static / DIY Web Dashboard

Instead of adopting someone else's app, build a lightweight static site and deploy it exactly like a normal project (CI/CD, GitHub Pages, Azure Static Web Apps). This is the best fit if you want the dashboard itself to live in **this repo** (`starthub`) as a real, git-tracked personal project.

### Reference implementation: darekkay/dashboard
- **Repo:** [darekkay/dashboard](https://github.com/darekkay/dashboard) · **Live demo:** [dashboard.darekkay.com](https://dashboard.darekkay.com)
- **Tech stack:** React + TypeScript, Tailwind CSS, React Testing Library, Font Awesome/Unicons.
- **Features:** 16 widgets (clock, weather, todo, bookmarks, calendar, etc.), dark mode, multi-language, fully static build.
- **License:** MIT — forkable as a starting point.
- **Deployment model:** Static build output, hostable anywhere (this is effectively the model to copy for a GitHub Pages / Azure Static Web Apps deployment).

### Build-your-own stack options
| Layer | Options | Notes |
|---|---|---|
| Framework | Next.js (static export), Vue 3 + Vite, plain HTML/JS (like Homer) | Next.js gives you the most starter templates and easiest Azure Static Web Apps integration; plain HTML/JS keeps it dependency-free like Homer. |
| Bookmarks | JSON/YAML file committed to the repo, rendered as tiles/grid | Same pattern as Homer/Homepage — config as code, PR-able. |
| Weather | [Open-Meteo](https://open-meteo.com/) (free, no API key, used by the reference project) or OpenWeatherMap | Open-Meteo is the simplest no-auth option for a static/client-side call. |
| Calendar | Google Calendar "Embed" iframe, or parse a public/secret **ICS feed** client-side (e.g. with `ical.js`), or CalDAV for Outlook/Exchange | An embedded iframe is zero-code; an ICS parse gives you a custom-styled agenda list. |
| News/RSS | Client-side RSS parsing via a CORS proxy, or a small serverless function (Azure Function) to fetch/normalize feeds | Matches your Azure background — a tiny Azure Function as a feed-fetching backend is a natural fit. |
| Hosting | **GitHub Pages** (free, matches repo name "starthub"), **Azure Static Web Apps** (free tier, integrates with Azure Functions for any backend bits, custom domain + auth built in) | Azure Static Web Apps is the more "on-brand" choice given your stack, and gives you a free managed Function backend if you need to hide API keys. |
| Auth (optional) | Azure Static Web Apps built-in auth (Entra ID/GitHub/Google), or none if it's just a personal bookmark page | Only needed if you want the page itself gated. |

### Why this option fits you specifically
- You already work with Azure and GitHub daily — Azure Static Web Apps + GitHub Actions CI/CD is a five-minute setup and gives you a real (if small) portfolio piece.
- Config-as-code (bookmarks/widgets as JSON/YAML in the repo) matches how you already think about infrastructure.
- No server to patch/maintain, unlike Option 1's Docker-based apps.

## Option 3: Browser "New Tab" Extensions

Client-side only, no hosting required — replaces your browser's new-tab page directly.

- **[Tabliss](https://tabliss.io/)** ([GitHub](https://github.com/joelshepherd/tabliss)) — open-source, plugin-based new tab page with weather (OpenWeatherMap), bookmark groups, quotes, backgrounds, and a large community plugin list. Chrome/Firefox available.
- Similar tools: Momentum (closed-source/freemium), custom "New Tab Override" (Firefox) / "Custom New Tab URL" (Chrome) extensions that let you point the new-tab page at *any* URL — including your own Option 1 or Option 2 dashboard, which is a nice way to combine approaches (host it yourself, then use a tiny extension to force it as your new tab).
- **Trade-off:** These are per-browser/per-device (no shared state unless the extension syncs), and generally less extensible than a self-hosted or DIY page. Best as a *complement* to Option 1/2, not a replacement — point "New Tab Override" at your self-hosted URL to get the best of both.

## Recommendation

Given the repo is literally named **starthub** and you're a DevOps/Cloud engineer comfortable with Python/.NET and Azure:

1. **Best long-term fit:** Option 2 (DIY static dashboard) — build it in this repo, config-as-code (JSON/YAML bookmarks + widget config), deploy to **Azure Static Web Apps** (or GitHub Pages if you want zero Azure cost), weather via Open-Meteo, calendar via ICS/Google embed. It doubles as a small portfolio project and needs no server maintenance.
2. **Fastest to a usable result today:** Option 1, specifically **Homepage** or **Glance** — clone, write one YAML file, `docker run`, done in under an hour. Good stopgap while you decide if you want to invest in the DIY build.
3. **Nice-to-have layer on top of either:** Option 3 — once you have a URL (self-hosted or static), use a "New Tab Override"-style extension so it's the first thing you see in your browser, not just a bookmarked tab.

## Links Reference

- [danielrosehill/Day-Planner-Dashboard](https://github.com/danielrosehill/Day-Planner-Dashboard) — reference project
- [gethomepage/homepage](https://github.com/gethomepage/homepage)
- [Homarr](https://homarr.dev/) / [homarr-labs/homarr](https://github.com/homarr-labs/homarr)
- [Lissy93/dashy](https://github.com/Lissy93/dashy)
- [glanceapp/glance](https://github.com/glanceapp/glance)
- [bastienwirtz/homer](https://github.com/bastienwirtz/homer)
- [pawelmalak/flame](https://github.com/pawelmalak/flame)
- [linuxserver/Heimdall](https://github.com/linuxserver/Heimdall)
- [darekkay/dashboard](https://github.com/darekkay/dashboard) (live: [dashboard.darekkay.com](https://dashboard.darekkay.com))
- [Tabliss](https://tabliss.io/) / [joelshepherd/tabliss](https://github.com/joelshepherd/tabliss)
- [Open-Meteo](https://open-meteo.com/) — free weather API, no key required
- [Azure Static Web Apps documentation](https://learn.microsoft.com/en-us/azure/static-web-apps/)

## Next Steps

Once you've picked a direction, I can:
- Scaffold the repo structure for the DIY static approach (framework, bookmarks config schema, weather/calendar widget stubs, CI/CD to Azure Static Web Apps or GitHub Pages), or
- Set up a `docker-compose.yml` + YAML config for one of the turnkey apps (Homepage or Glance), or
- Do deeper research on any single option above (e.g. detailed calendar/ICS integration approaches, or a full widget list for Homepage/Glance).
