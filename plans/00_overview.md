# Plan 00 — Project Overview

## Project Name
**Oh My Syntax!**

## Concept
A single-page, lightning-fast command & syntax lookup tool for developers.
Think: Raycast / Spotlight — but for CLI commands, language snippets, and "what was that thing again?" moments.

## Core Value Proposition
> "You know what you want to do. You just forgot how to write it."

- Type `8080` → get `lsof -i :8080 | awk 'NR>1 {print $2}' | xargs kill` instantly
- Type `포트죽이기` (Korean alias) → same result
- Type `docker ps` → get all related Docker inspection commands
- Copy with one click (or `Enter` key)

---

## One-Page Layout (Top → Bottom)

```
┌─────────────────────────────────────────────────────┐
│  [Language Toggle: EN / KO]              (top-right) │
│                                                       │
│        [Floating Background Animation Layer]         │
│         (code snippets / icons drifting slowly)      │
│                                                       │
│              ✦  Oh My Syntax!  ✦                    │
│       "Type anything. Copy everything."              │
│                                                       │
│  ┌──── Category Tabs (Magic Tab Slider) ──────────┐  │
│  │ All │ Linux │ macOS │ Windows │ K8s │ Docker │ …│  │
│  └─────────────────────────────────────────────────┘  │
│                                                       │
│  ┌────────────────────────────────────────────────┐   │
│  │  🔍  Search commands, shortcuts, snippets…     │   │
│  └────────────────────────────────────────────────┘   │
│                                                       │
│  ┌── Result Card ──────────────────────────────────┐  │
│  │  `kill -9 $(lsof -ti:8080)`  [Copy] [⚠ danger] │  │
│  │   Kill process on port 8080 — no mercy!         │  │
│  └─────────────────────────────────────────────────┘  │
│  ┌── Result Card ──────────────────────────────────┐  │
│  │  `fuser -k 8080/tcp`                   [Copy]   │  │
│  │   The polite way. Linux only.                   │  │
│  └─────────────────────────────────────────────────┘  │
│                                                       │
│  [Future AdSense Skeleton — fixed min-height]        │
│                                                       │
│  [Footer: GitHub easter egg floating card]           │
└─────────────────────────────────────────────────────┘
```

---

## Tech Stack (Final Decision)

| Layer           | Technology                              |
|-----------------|-----------------------------------------|
| Framework       | React 18 (Vite SPA)                     |
| Language        | TypeScript (strict)                     |
| Styling         | Tailwind CSS v3 + clsx + tailwind-merge |
| Animation       | Framer Motion + Lenis (smooth scroll)   |
| Search          | Fuse.js + `useDeferredValue`            |
| Virtualization  | None — result count capped at 50, DOM cost negligible |
| State           | Zustand                                 |
| i18n            | i18next + react-i18next                 |
| Icons           | lucide-react                            |
| Build           | Vite 5                                  |

---

## Key Constraints (Non-Negotiable)
1. **Zero debounce** on search input — `useDeferredValue` only
2. **Spring physics only** — never `linear` / `ease` for interactive elements
3. **No business logic in JSX** — all logic in hooks
4. **Components ≤ 200 lines**
5. **Fire-and-forget telemetry** — copy events MUST NOT block UI
6. **Skeleton UI** for AdSense zones — prevent CLS

---

## Related Plans
- `01_folder-structure.md` — directory layout
- `02_design-system.md` — colors, typography, tokens
- `03_data-schema.md` — command data format & file organization
- `04_search-engine.md` — search pipeline logic
- `05_components.md` — component tree & specs
- `06_animations.md` — motion & animation specs
- `07_i18n.md` — internationalization
- `08_performance.md` — performance strategies
- `09_roadmap.md` — phased implementation plan
