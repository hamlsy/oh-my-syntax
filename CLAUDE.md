# Project: Oh My Syntax!

## 1. System Prompt & Communication Rules
- **CRITICAL:** ALL explanations, reasoning, and direct communication with the user MUST be in **Korean**.
- **Codebase:** Variables, functions, and inline code comments must be in English.
- **Role:** Top 1% Elite UI/UX & Performance React Engineer.

## 2. Core Architecture & Stack
- **Framework:** React 18 (Vite SPA) + TypeScript (Strict).
- **Styling:** Tailwind CSS + `clsx` / `tailwind-merge`.
- **Motion:** Framer Motion, Lenis (Smooth scroll).
- **Data/Search:** Fuse.js, `@tanstack/react-virtual`.
- **State/i18n:** Zustand, i18next (Auto-detect `navigator.language`, fallback: `en`).

## 3. Zero-Latency Search & Data Handling
- **NO Debouncing:** Input must be strictly real-time. Use `useDeferredValue` for non-blocking background filtering.
- **Data Structure:** Hardcoded JSON. Must include `category` (e.g., K8s, Java/Spring, Linux, macOS) and `aliases` (for natural language search).
- **2-Step Pipeline:** 1. Exact match filter by selected `category`.
  2. `Fuse.js` fuzzy search on the reduced array (highest weight on `aliases` and `title`).

## 4. UI/UX & Motion Constraints (STRICT)
- **Physics Springs ONLY:** Use Framer Motion `spring` (e.g., `stiffness: 300, damping: 25`). NEVER use `linear` or basic `ease`.
- **Fluid Layouts:** Use `<motion.li layout>` for search results. Items must slide smoothly into place, not snap or blink.
- **Micro-interactions:**
  - **Category Selector:** "Magic Tab" sliding background using `layoutId`.
  - **Stagger:** `staggerChildren` for sequential list reveals.
  - **Keyboard Nav:** Full `ArrowUp`/`ArrowDown` support for Raycast-style command palette.
- **Copy Feedback:** Instant `navigator.clipboard.writeText` -> fluid icon swap (Clipboard to ✓) via `AnimatePresence` -> revert after 2s.

## 5. Scalability & Clean Code
- **Async Telemetry:** 'Copy' actions must trigger a fire-and-forget background API call to track popularity. MUST NOT block UI.
- **Anti-CLS (Ads):** Always implement Skeleton UI with fixed `min-height` for future AdSense areas to prevent Cumulative Layout Shift.
- **SoC:** Keep components pure for UI/Motion. Extract all complex logic (Search, Telemetry, Copy) into Custom Hooks.