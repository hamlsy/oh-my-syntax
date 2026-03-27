# CRITICAL: COMMUNICATION RULE
- ALL explanations, reasoning, and direct communication with the user MUST be in **Korean**.
- Codebase (Variables, functions, comments) must be in English.

# Project: Oh My Syntax! - Frontend UI/UX Design & Code Guidelines

## 1. Mission
Build a lightning-fast, delightful code-search experience for developers.
- **Zero-Latency Perceived Search:** Instant filtering on keystroke using local data.
- **High-End, "Human-Crafted" UI/UX:** Avoid generic "AI template" vibes. Use soft, intentional, physics-based animations.
- **Raycast/Spotlight Experience:** Fully keyboard-navigable command palette with instant "Copy to Clipboard" feedback.

## 2. Tech Stack & Architecture
- **Framework:** React 18 (Vite SPA ONLY). No Next.js or SSR.
- **Language:** TypeScript (Strict mode, NO `any` unless explicitly justified).
- **Styling:** Tailwind CSS + `clsx` / `tailwind-merge`. Use design tokens for color/spacing.
- **State Management:** Zustand (Global) + React Hooks (Local). No Redux.
- **Search Engine:** `fuse.js` (Fuzzy search) + React 18 `useDeferredValue`.
- **Performance:** `@tanstack/react-virtual` for rendering large result lists.
- **Animation:** `framer-motion` (Primary) + `lenis` (Smooth scroll).

## 3. Architecture & Code Quality
Enforce Clean Code and Separation of Concerns (SoC):
- **No business logic in JSX:** Extract complex conditions, search filtering, and formatting into helper functions or Custom Hooks.
- **Directory Structure:**
  - `components/`: Dumb/presentational UI components only.
  - `features/`: Feature modules (e.g., `search`, `results`).
  - `hooks/`: Reusable logic (e.g., `useCommandSearch`, `useCopyToClipboard`).
  - `types/`: Shared TypeScript interfaces.
- **Constraints:** Components max ~200 lines. Props must be typed with explicit interfaces.

## 4. UI/UX & Layout
- **Dark Mode Default:** True dark neutral background (`#0f111a` style, no pure black) with subtle accents. Avoid neon gradients.
- **Responsiveness:** Mobile-first (360px+) to Desktop (1440px max-width). Sticky search bar. Touch targets minimum 44x44px.
- **i18n (Internationalization):**
  - Base language: English (`en`).
  - Auto-detect browser/OS locale via `navigator.language` on first load. Fallback to `en`.
  - Use namespaces (e.g., `search.en.json`). Save user override in `localStorage`.

## 5. Motion & Animation Principles (Strict)
Animations must feel soft, responsive, and almost invisible.
- **Physics-Based Springs ONLY:** Use Framer Motion `spring` (e.g., `stiffness: 300, damping: 25`). NEVER use `linear` or basic `ease` for interactive elements.
- **Layout Animations:** Use `<motion.li layout>` for search results. Items must slide smoothly into place when filtered, not snap or blink.
- **Micro-interactions:**
  - **Category Selectors (Magic Tab):** Smooth sliding background using `layoutId`.
  - **Staggered Reveals:** Use `staggerChildren` for lists.
- **Accessibility:** Guard heavy animations behind `prefers-reduced-motion`.

## 6. Zero-Latency Search & Copy UX (Raycast Style)
- **Data Structure:** Hardcoded JSON must include `category` (e.g., `K8s`, `Linux`, `Java`) and `aliases` (for natural language search like "kill port 8080").
- **NO Debouncing for Input:** Input state must update instantly. Wrap the search filtering logic with `useDeferredValue` to prevent main thread blocking.
- **2-Step Pipeline:** 1. Filter by `category` -> 2. `fuse.js` fuzzy search on the reduced array.
- **Keyboard Navigation:** Full support for `ArrowUp`/`ArrowDown` to navigate results, and `Enter` to copy.
- **Copy Feedback:** Instant `navigator.clipboard.writeText` -> fluid icon swap (Clipboard to ✓) via `AnimatePresence` -> revert after 2s.

## 7. Scalability & Telemetry
- **Async Telemetry:** 'Copy' actions must trigger a fire-and-forget background API call to track popularity. MUST NOT block UI.
- **Anti-CLS (Ads):** Always implement Skeleton UI with fixed `min-height` for future AdSense areas to prevent Cumulative Layout Shift.