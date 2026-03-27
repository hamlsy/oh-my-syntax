# Plan 01 — Folder Structure

## Philosophy
- **Separation of Concerns (SoC):** UI ↔ Logic ↔ Data are strictly separated
- **Feature-first inside `features/`:** each feature is self-contained
- **Shared things live in shared places:** `components/`, `hooks/`, `constants/`, `types/`
- **Data is language-aware and category-aware**

---

## Full Directory Tree

```
oh-my-syntax/
├── public/
│   ├── favicon.ico
│   └── og-image.png
│
├── src/
│   │
│   ├── assets/                        # Static assets
│   │   ├── fonts/
│   │   └── images/
│   │       └── easter-egg-avatar.png  # Dev floating card image
│   │
│   ├── components/                    # Dumb/Presentational UI only
│   │   ├── ui/
│   │   │   ├── Badge.tsx              # Category badge chip
│   │   │   ├── Button.tsx
│   │   │   ├── Kbd.tsx                # Keyboard shortcut display
│   │   │   ├── Skeleton.tsx           # CLS-safe skeleton for AdSense
│   │   │   └── Tooltip.tsx
│   │   └── layout/
│   │       ├── Header.tsx             # Title + language toggle
│   │       └── Footer.tsx
│   │
│   ├── features/
│   │   ├── hero/
│   │   │   └── HeroSection.tsx        # Title, subtitle, entrance animation
│   │   │                              # Reads i18n only (no store access needed)
│   │   │
│   │   ├── search/
│   │   │   ├── SearchBar.tsx          # Controlled input + Korean IME composition handling
│   │   │   ├── CategoryTabs.tsx       # Magic-tab sliding selector
│   │   │   └── SearchContainer.tsx    # Orchestrates tabs + bar + ResultList
│   │   │                              # IMPORTANT: ResultList lives INSIDE SearchContainer
│   │   │                              # so onKeyDown bubble chain works end-to-end
│   │   │
│   │   ├── results/
│   │   │   ├── ResultList.tsx         # Animated list (no virtualization — capped at 50)
│   │   │   │                          # Rendered as child of SearchContainer (not App)
│   │   │   ├── ResultCard.tsx         # Single command card
│   │   │   ├── CopyButton.tsx         # Clipboard → ✓ animation
│   │   │   └── DangerBadge.tsx        # ⚠ badge for dangerous commands
│   │   │
│   │   ├── background/
│   │   │   ├── FloatingCanvas.tsx          # Orchestrates all 3 layers
│   │   │   ├── StarField.tsx               # CSS star field (static + twinkling)
│   │   │   ├── FloatingCodeSnippet.tsx     # Drifting syntax debris
│   │   │   ├── FloatingContributorCard.tsx # Easter egg card (probabilistic)
│   │   │   └── EasterEggModal.tsx          # Modal shown on contributor card click
│   │   │
│   │   └── settings/
│   │       └── LanguageToggle.tsx     # EN / KO switcher
│   │
│   ├── hooks/                         # Reusable custom hooks
│   │   ├── useCommandSearch.ts        # Main search pipeline (category + fuse + NFC normalize)
│   │   ├── useCopyToClipboard.ts      # Copy + revert after 2s
│   │   ├── useKeyboardNav.ts          # ArrowUp/Down/Enter/Escape
│   │   │                              # Attached via onKeyDown on SearchContainer (which wraps ResultList)
│   │   │                              # → correct bubble chain: ResultCard → ResultList → SearchContainer
│   │   ├── useTelemetry.ts            # Fire-and-forget copy event (reads VITE_TELEMETRY_URL)
│   │   ├── useFloatingItems.ts        # Random motion for background items
│   │   └── useReducedMotion.ts        # prefers-reduced-motion guard
│   │
│   ├── store/                         # Zustand global state
│   │   ├── useSearchStore.ts          # query, selectedCategory, highlightedIndex
│   │   │                              # setQuery() auto-resets highlightedIndex to 0
│   │   ├── useUIStore.ts              # language (single source of truth)
│   │   │                              # setLanguage() is pure state only — side effects via subscribe
│   │   └── useSettingsStore.ts        # showFloating, showEasterEgg flags
│   │
│   ├── data/                          # All command data (hardcoded JSON)
│   │   ├── en/                        # English descriptions
│   │   │   ├── linux.json
│   │   │   ├── macos.json
│   │   │   ├── windows.json
│   │   │   ├── docker.json
│   │   │   ├── kubernetes.json
│   │   │   ├── git.json
│   │   │   ├── java.json
│   │   │   ├── python.json
│   │   │   ├── javascript.json
│   │   │   └── index.ts               # Aggregates + exports all en data
│   │   ├── ko/                        # Korean descriptions (same IDs)
│   │   │   ├── linux.json
│   │   │   ├── macos.json
│   │   │   ├── windows.json
│   │   │   ├── docker.json
│   │   │   ├── kubernetes.json
│   │   │   ├── git.json
│   │   │   ├── java.json
│   │   │   ├── python.json
│   │   │   ├── javascript.json
│   │   │   └── index.ts
│   │   └── categories.ts              # Category metadata (label, icon, id)
│   │
│   ├── locales/                       # UI string translations (i18next)
│   │   ├── en/
│   │   │   └── translation.json       # "search.placeholder", "copy.success"…
│   │   └── ko/
│   │       └── translation.json
│   │
│   ├── constants/                     # App-wide constants
│   │   ├── colors.ts                  # Design token color palette
│   │   ├── animation.ts               # Spring configs, durations
│   │   └── config.ts                  # TELEMETRY_URL, COPY_REVERT_MS, DEVELOPER_INFO, etc.
│   │                                  # NOTE: CategoryId lives in types/command.ts
│   │                                  #       Category metadata lives in data/categories.ts
│   │                                  #       No constants/categories.ts — avoid 3-way split
│   │
│   ├── types/                         # Shared TypeScript interfaces
│   │   ├── command.ts                 # Command, Category, SearchResult
│   │   ├── store.ts                   # Zustand slice types
│   │   └── i18n.ts                    # i18n namespace types
│   │
│   ├── utils/                         # Pure utility functions
│   │   ├── searchUtils.ts             # buildFuseIndex, rankResults
│   │   ├── classNames.ts              # cn() helper (clsx + twMerge)
│   │   └── locale.ts                  # detectUserLocale()
│   │
│   ├── App.tsx                        # Root: layout skeleton only
│   ├── main.tsx                       # ReactDOM.createRoot + i18n init
│   └── index.css                      # Tailwind directives + base styles
│
├── scripts/
│   └── validate-data.ts               # Build-time EN/KO ID parity check (run via tsx)
│
├── plans/                             # ← You are here
├── CLAUDE.md
├── .env.development                   # VITE_TELEMETRY_URL=http://localhost:3001/api/telemetry
├── .env.production                    # VITE_TELEMETRY_URL=https://api.ohmysyntax.com/telemetry
├── .env.example                       # Committed — documents required env vars (no secrets)
├── package.json
├── tsconfig.json
└── vite.config.ts
   # NOTE: No tailwind.config.ts — Tailwind v4 uses CSS-first @theme in src/index.css
```

---

## Key Rules

### `components/` vs `features/`
| `components/`                  | `features/`                             |
|--------------------------------|-----------------------------------------|
| No domain logic                | Contains domain-specific UI + wiring    |
| Receives all data via props    | May read from store / call hooks        |
| Generic & reusable anywhere    | Specific to one feature                 |
| `Button`, `Badge`, `Skeleton`  | `SearchBar`, `ResultCard`, `CategoryTabs` |

### `data/` vs `locales/`
| `data/`                            | `locales/`                          |
|------------------------------------|-------------------------------------|
| Command payloads (code, aliases)   | UI string translations              |
| Separated by language + category  | Separated by language only          |
| Used by search engine              | Used by i18next `t()` function      |

### `constants/` rules
- All magic strings and numbers → `constants/`
- Never hardcode `#0f111a` in components — import from `colors.ts`
- Never hardcode `2000` (revert delay) in hooks — import from `config.ts`
