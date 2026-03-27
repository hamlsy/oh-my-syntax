# Plan 09 — Implementation Roadmap

## Development Phases

---

## Phase 0 — Project Bootstrap (Prerequisites)
> Install all required packages and configure tooling.

### Package Installation
```bash
npm install \
  framer-motion \
  lenis \
  fuse.js \
  zustand \
  i18next \
  react-i18next \
  lucide-react \
  clsx \
  tailwind-merge

# Tailwind v4: uses Vite plugin directly — no PostCSS, no autoprefixer
npm install -D \
  tailwindcss \
  @tailwindcss/vite \
  @types/node

# Testing
npm install -D \
  vitest \
  @vitest/ui \
  @testing-library/react \
  @testing-library/user-event \
  @testing-library/jest-dom \
  jsdom

# Analytics (optional — Vercel built-in)
npm install @vercel/analytics
```

### Config Files to Create
- [ ] `src/index.css` — `@import "tailwindcss"` + `@theme {}` tokens (Plan 02) + base dark background
- [ ] `vite.config.ts` — add `@tailwindcss/vite` plugin, path alias `@/ → src/`, manual chunks, vitest config
- [ ] `eslint.config.js` — flat config with `@typescript-eslint`, `eslint-plugin-react-hooks`, and `@/` import path resolver
- [ ] `.env.example` — document `VITE_TELEMETRY_URL` (empty value, committed)
- [ ] `.env.development` — set local telemetry URL (gitignored)
- [ ] `.gitignore` — ensure `.env.development` and `.env.production` are excluded

> **No `tailwind.config.ts` and no `postcss.config.js`** — Tailwind v4 handles everything via the Vite plugin.

### Path Alias Setup

**`tsconfig.app.json`** (TypeScript awareness):
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

**`vite.config.ts`** (runtime resolution + Tailwind v4 plugin):
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
});
```

> Both `tsconfig` paths and `vite resolve.alias` are required — TypeScript needs paths for type-checking, Vite needs alias for bundling. Missing either causes import errors at different stages.

---

## Phase 1 — Foundation
> Core skeleton: layout, constants, types, i18n.

### Tasks
- [ ] Create all directories per `01_folder-structure.md`
- [ ] `src/constants/colors.ts` — full COLORS token object
- [ ] `src/constants/animation.ts` — SPRING presets, DURATION
- [ ] `src/constants/config.ts` — TELEMETRY_URL, COPY_REVERT_MS, etc.
- [ ] `src/types/command.ts` — Command, Category, SearchResult interfaces
- [ ] `src/types/store.ts` — Zustand slice type definitions
- [ ] `src/utils/classNames.ts` — `cn()` helper
- [ ] `src/utils/locale.ts` — `detectUserLocale()`, `saveLocalePreference()`
- [ ] `src/locales/en/translation.json` + `src/locales/ko/translation.json`
- [ ] i18next init in `main.tsx`
- [ ] Lenis smooth scroll init in `main.tsx`

**Exit criteria:** App loads, i18n works, Tailwind classes apply correctly.

---

## Phase 2 — Data Layer
> All command data files and the search-ready merged exports.

### Tasks
- [ ] `src/data/en/linux.json` (~50 commands)
- [ ] `src/data/en/macos.json` (~30 commands)
- [ ] `src/data/en/windows.json` (~30 commands)
- [ ] `src/data/en/docker.json` (~40 commands)
- [ ] `src/data/en/kubernetes.json` (~40 commands)
- [ ] `src/data/en/git.json` (~50 commands)
- [ ] `src/data/en/java.json` (~30 snippets)
- [ ] `src/data/en/python.json` (~30 snippets)
- [ ] `src/data/en/javascript.json` (~30 snippets)
- [ ] `src/data/en/index.ts` — merge + sort by popularity
- [ ] `src/data/ko/` — Korean counterpart files (all same IDs)
- [ ] `src/data/ko/index.ts` — merge EN base + KO locale fields
- [ ] `src/data/categories.ts` — CATEGORIES array
- [ ] `scripts/validate-data.ts` — EN/KO ID parity check
- [ ] Add `"validate:data": "tsx scripts/validate-data.ts"` to `package.json`

### Dangerous Command Checklist (must have `isDangerous: true`)
- `rm -rf /`, `rm -rf ~`, `rm -rf .`
- `git push --force` / `--force-with-lease`
- `docker system prune -a --volumes`
- `kubectl delete namespace <ns>`
- `DROP TABLE`, `DROP DATABASE`
- `kill -9 1` (PID 1)
- `chmod -R 777 /`
- `dd if=/dev/urandom of=/dev/sda`

**Exit criteria:** `ALL_COMMANDS_EN.length > 200`, all IDs unique, KO merge works.

---

## Phase 3 — State Management & Hooks
> Zustand stores and all custom hooks.

### Tasks
- [ ] `src/store/useSearchStore.ts` — query, selectedCategory, **highlightedIndex** + setters
  - `setQuery()` must auto-reset `highlightedIndex` to 0
- [ ] `src/store/useUIStore.ts` — language only (pure state, no side effects)
  - Add `subscribeWithSelector` middleware
  - Register subscriber in `main.tsx`: language change → i18n sync + localStorage + invalidateFuseCache
- [ ] `src/store/useSettingsStore.ts` — showFloating, showEasterEgg flags
- [ ] `src/hooks/useCommandSearch.ts` — full 2-step pipeline + NFC normalize + Fuse cache (Plan 04)
- [ ] `src/hooks/useCopyToClipboard.ts` — copy + revert after 2s
- [ ] `src/hooks/useKeyboardNav.ts` — ArrowUp/Down/Enter/Escape
- [ ] `src/hooks/useTelemetry.ts` — fire-and-forget fetch
- [ ] `src/hooks/useFloatingItems.ts` — random float path generator
- [ ] `src/hooks/useReducedMotion.ts` — prefers-reduced-motion wrapper
- [ ] `src/utils/searchUtils.ts` — `getCachedFuse()`, `invalidateFuseCache()`, FUSE_OPTIONS

**Exit criteria:**
- `useCommandSearch('8080', 'all')` returns kill-port command first
- `useCommandSearch('포트 죽이기', 'all')` (KO mode) returns kill-port command
- Switching categories rapidly does NOT rebuild Fuse index (cache hit logged)
- Language switch calls `invalidateFuseCache()` (verify via console in dev)

---

## Phase 3.5 — Testing Infrastructure
> Set up Vitest + React Testing Library before building UI. Write tests alongside features.

### Tasks
- [ ] Configure `vitest` in `vite.config.ts` (`test: { environment: 'jsdom', globals: true, setupFiles: ['./src/test/setup.ts'] }`)
- [ ] `src/test/setup.ts` — import `@testing-library/jest-dom`
- [ ] `src/hooks/__tests__/useCommandSearch.test.ts`
  - `useCommandSearch('8080', 'all')` → kill-port command ranks first
  - `useCommandSearch('포트 죽이기', 'all')` (KO data) → kill-port command found
  - Switching category filters correctly
  - Cache hit: calling same query+category twice does NOT rebuild Fuse index
- [ ] `src/hooks/__tests__/useCopyToClipboard.test.ts`
  - Clipboard writes correctly
  - `copied` state reverts to false after 2s
- [ ] `src/utils/__tests__/searchUtils.test.ts`
  - `getCachedFuse()` returns same instance on second call
  - `invalidateFuseCache()` causes next call to return new instance

**Exit criteria:** `npm test` runs all tests. Core search logic covered. CI will run these in Phase 3.5+.

---

## Phase 4 — Core UI Components
> Shared components and layout shell.

### Tasks
- [ ] `src/components/ui/Skeleton.tsx`
- [ ] `src/components/ui/Badge.tsx`
- [ ] `src/components/ui/Button.tsx`
- [ ] `src/components/ui/Kbd.tsx`
- [ ] `src/components/ui/Tooltip.tsx`
- [ ] `src/components/ui/ErrorBoundary.tsx` — class component, catches runtime errors, shows friendly fallback UI instead of white screen
- [ ] `src/components/layout/Header.tsx` — sticky, blur backdrop
- [ ] `src/components/layout/Footer.tsx` — keyboard hint bar
- [ ] `src/App.tsx` — root layout, z-layer structure, wrap main content in `<ErrorBoundary>`
- [ ] `src/index.css` — base styles: `bg-bg-base`, font imports

**Exit criteria:** Header + Footer visible, dark background applied, fonts loaded.

---

## Phase 5 — Search Feature
> The core user-facing feature.

### Tasks
- [ ] `src/features/search/SearchBar.tsx`
  - Korean IME: `inputValue` (local) vs `query` (store) separation
  - `onCompositionStart/End` handlers with `isComposing` ref
  - `maxLength={80}` on input
- [ ] `src/features/search/CategoryTabs.tsx` — magic tab with `layoutId`
- [ ] `src/features/search/SearchContainer.tsx`
  - Must wrap ResultList as a child (not sibling) — keyboard nav requires this
  - `onKeyDown` handler here catches events from all descendants
  - ARIA: `role="combobox"`, `aria-expanded`, `aria-haspopup="listbox"`, `aria-owns`, `aria-activedescendant`
- [ ] `src/hooks/useQuerySync.ts` — sync `?q=` and `?cat=` URL params with Zustand store
  - On mount: read URL params → populate store (enables deep linking / sharing)
  - On store change: update URL params via `history.replaceState` (no page reload)
  - Example: `ohmysyntax.vercel.app/?q=kill+port&cat=linux` opens with pre-filled search

**Exit criteria:**
- Typing in search bar updates query in store (EN mode)
- Typing Korean ("포트") in KO mode: no duplicate chars, no mid-composition flicker
- Category tabs slide correctly with spring animation
- ArrowDown from SearchBar highlights first result card

---

## Phase 6 — Results Feature
> Animated result list (no virtualization — capped at 50 items) with all interactions.

### Tasks
- [ ] `src/features/results/CopyButton.tsx` — AnimatePresence icon swap (Clipboard → ✓)
- [ ] `src/features/results/DangerBadge.tsx` — warning badge for isDangerous commands
- [ ] `src/features/results/ResultCard.tsx` — full card with all states
- [ ] `src/features/results/ResultList.tsx` — staggerChildren + motion.li layout (framer-motion only)

**Exit criteria:**
- Typing "8080" shows kill-port command instantly
- Typing "포트 죽이기" (KO mode) shows same command
- Copy button swaps icon, reverts after 2s
- Dangerous commands show ⚠ badge
- Keyboard ArrowUp/Down navigates, Enter copies

---

## Phase 7 — Hero & Visual Polish
> Title section, background animations, easter egg.

### Tasks
- [ ] `src/features/background/StarField.tsx` — CSS star field (box-shadow static + twinkling spans)
- [ ] `src/features/background/FloatingCodeSnippet.tsx` — drifting syntax debris (6–8 items)
- [ ] `src/features/background/FloatingContributorCard.tsx` — probabilistic easter egg card
- [ ] `src/features/background/EasterEggModal.tsx` — contributor info modal (AnimatePresence)
- [ ] `src/features/background/FloatingCanvas.tsx` — orchestrates all 3 layers, rolls spawn probabilities
  - In `import.meta.env.DEV` mode: show ALL contributors (skip probability roll) for easier debugging
  - On mobile (`window.innerWidth < 768`): render `null` — FloatingCanvas is disabled entirely to preserve performance
- [ ] `src/features/settings/LanguageToggle.tsx`
- [ ] `src/features/hero/HeroSection.tsx` — title, subtitle, blur entrance animation
- [ ] `src/constants/config.ts` — populate `CONTRIBUTORS` array with creator entry
- [ ] Grid background overlay in `index.css`
- [ ] Gradient title text effect

**Exit criteria:**
- Stars visible in background (static + 20 twinkling)
- Code snippets drift slowly across viewport
- Creator contributor card appears (spawnProbability: 1.0), is clickable, opens EasterEggModal
- Adding a second entry to `CONTRIBUTORS` with spawnProbability: 0.5 works correctly
- Reduced motion: FloatingCanvas renders nothing (StarField included)

---

## Phase 8 — AdSense Zones & Final Polish
> CLS-safe ad placeholders, accessibility, performance audit.

### Tasks
- [ ] `AdSkeleton` placement (above footer)
- [ ] Create `public/og-image.png` — 1200×630px, dark bg, "✦ Oh My Syntax!" title + sample card (see Plan 11)
- [ ] WCAG AA contrast check on all text combinations
- [ ] Focus ring visible on all interactive elements
- [ ] Keyboard-only navigation test (Tab, ArrowUp/Down, Enter, Escape)
- [ ] `lang` attribute on `<html>` element (sync with i18n)
- [ ] `aria-label` on SearchBar, CopyButton, CategoryTabs
- [ ] SEO meta tags in `index.html`:
  - `<title>Oh My Syntax! — Developer Command Lookup</title>`
  - `<meta name="description">` (EN + KO variants via i18n if possible, else EN default)
  - Open Graph: `og:title`, `og:description`, `og:image`, `og:url`
  - `<link rel="canonical" href="https://ohmysyntax.vercel.app" />`
- [ ] `vite build` — check bundle chunk sizes
- [ ] Lighthouse audit — target > 90 on all metrics
- [ ] Test `prefers-reduced-motion` in browser DevTools

---

## Phase 9 — Data Expansion
> Fill out command data to production quality.

### Priority order for command content:
1. **Linux** — port management, file ops, permissions, process management
2. **Git** — undo, stash, rebase, cherry-pick, log tricks
3. **Docker** — container lifecycle, cleanup, exec, logs
4. **Kubernetes** — pod ops, rollout, config, debugging
5. **macOS** — brew, system prefs, network, spotlight tricks
6. **Windows** — cmd + powershell equivalents
7. **JavaScript** — array methods, async patterns, common snippets
8. **Python** — list comprehensions, decorators, common stdlib
9. **Java** — streams, collections, spring annotations

### Korean Alias Quality Bar
Each command must have at least 3 Korean aliases covering:
- Direct translation
- Natural language ("어떻게 하지" style)
- Error message phrasing ("이미 사용 중인 포트")

---

## Quick Reference: File Creation Order

```
Phase 0: package.json → vite.config.ts → tsconfig → eslint.config.js → src/index.css (@theme)
Phase 1: constants/ → types/ → utils/ → locales/ → main.tsx
Phase 2: data/en/**  → data/ko/** → data/categories.ts
Phase 3: store/**  → hooks/** → utils/searchUtils.ts
Phase 4: components/ui/** → components/layout/** → App.tsx
Phase 5: features/search/**
Phase 6: features/results/**
Phase 7: features/background/** → features/settings/**
Phase 8: Audit & polish
Phase 9: Data expansion
```
