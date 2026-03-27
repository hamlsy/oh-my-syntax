# Plan 05 — Component Tree & Specifications

## Component Hierarchy

```
App
├── FloatingCanvas          (background layer, fixed position)
│   ├── FloatingCodeSnippet × N
│   └── FloatingDeveloperCard
│
├── Header
│   └── LanguageToggle
│
├── HeroSection              (title + subtitle)
│
├── SearchContainer          (feature orchestrator)
│   ├── CategoryTabs
│   └── SearchBar
│
├── ResultList               (virtualized)
│   └── ResultCard × N
│       ├── DangerBadge      (conditional)
│       └── CopyButton
│
├── AdSkeleton               (CLS-safe ad placeholder)
│
└── Footer
```

---

## Component Specs

---

### `App.tsx`
**Role:** Root layout shell only. No logic.

```tsx
// Layout: relative container, bg-bg-base, overflow-hidden (for FloatingCanvas)
// FloatingCanvas: fixed, inset-0, z-0, pointer-events-none
// Main content: relative z-10
// Max-width: 768px, centered, px-4 md:px-6
```

---

### `Header`
**Props:** none (reads from store)
**Responsibilities:**
- Render site logo/name top-left (small, subtle)
- Render `LanguageToggle` top-right

```
height: 56px
bg: transparent (floats over background)
position: sticky top-0, z-20
backdrop-blur: backdrop-blur-md bg-bg-base/60
```

---

### `LanguageToggle`
**Props:** none (reads/writes `useUIStore`)
**Behavior:**
- Shows current locale: `EN` / `KO`
- Click → toggle language, persist to `localStorage`
- Smooth swap animation via `AnimatePresence`

---

### `HeroSection`
**Props:** none
**Content:**
- `<h1>` Oh My Syntax! — display font, gradient text (white → accent)
- Subtitle via `t('hero.subtitle')` — e.g. "Type anything. Copy everything."
- Subtle animated entrance: `initial={opacity:0, y:20}` → `animate={opacity:1, y:0}`

---

### `SearchContainer`
**Props:** none (orchestrates store + hooks)
**Responsibilities:** Lay out `CategoryTabs` above `SearchBar`

---

### `CategoryTabs`
**Props:** none (reads/writes `useSearchStore`)

```tsx
// Container: flex, gap-1, bg-bg-overlay, rounded-2xl, p-1
// Overflow: horizontal scroll on mobile (scrollbar hidden)

// For each tab:
// - onClick → setSelectedCategory(id)
// - Active tab renders a <motion.div layoutId="tab-bg" /> behind it
//   (the "magic tab" sliding background)

// Animation:
// layoutId: "tab-bg"
// transition: spring { stiffness: 400, damping: 30 }
```

**Magic Tab Implementation:**
```tsx
{categories.map(cat => (
  <button key={cat.id} onClick={() => setCategory(cat.id)} className="relative ...">
    {selectedCategory === cat.id && (
      <motion.div
        layoutId="tab-background"
        className="absolute inset-0 bg-accent-soft rounded-xl"
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />
    )}
    <span className="relative z-10">{t(cat.labelKey)}</span>
  </button>
))}
```

---

### `SearchBar`
**Props:** none (reads/writes `useSearchStore`)

```tsx
// Input: controlled, value=query, onChange=setQuery (NO debounce)
// Icon: Search (lucide) left-aligned
// Clear button: X icon, appears when query.length > 0
// Keyboard: Escape → clear query

// Focus ring: ring-2 ring-accent
// Transition: border-color, box-shadow via spring (use CSS transition, not Framer)
// font: font-mono (feels like a terminal)
// placeholder: t('search.placeholder')
```

---

### `ResultList`
**Props:** `results: SearchResult[]`
**Uses:** `@tanstack/react-virtual` (windowed rendering)

```tsx
// Virtualized: only renders visible cards (window of ~10)
// estimateSize: () => 88  (matches ResultCard min-height)
// overscan: 3             (pre-render 3 above/below viewport)

// Empty state (results.length === 0 && query):
//   Show "No results for '...' 🤔" with subtle fade-in

// List wrapper: <motion.ul> with staggerChildren
// Each item: <motion.li layout key={cmd.id}> for smooth reorder
```

---

### `ResultCard`
**Props:** `result: SearchResult`, `isHighlighted: boolean`, `index: number`

```tsx
// Layout:
//   Left:  command text (font-mono) + description
//   Right: CopyButton + optional DangerBadge

// Highlighted state (keyboard nav):
//   bg-bg-elevated, border-border-default, shadow-card-hover

// Command text:
//   bg-bg-overlay, rounded-lg, px-3 py-1.5, font-mono text-sm

// Description:
//   text-text-secondary, text-sm, mt-1
//   max 2 lines, overflow ellipsis

// Animation:
//   initial: { opacity: 0, y: 8 }
//   animate: { opacity: 1, y: 0 }
//   transition: spring { stiffness: 300, damping: 25 }
//   exit: { opacity: 0, y: -4 }
```

---

### `CopyButton`
**Props:** `command: string`
**Uses:** `useCopyToClipboard()`, `useTelemetry()`

```tsx
// States: 'idle' | 'success'
// idle:    <Clipboard /> icon, text-text-muted, hover:text-text-primary
// success: <Check /> icon, text-success, bg-success/10
// Revert:  after 2000ms → back to 'idle'
// AnimatePresence wraps icon swap

// On click:
//   1. navigator.clipboard.writeText(command)
//        → fallback if unavailable (non-HTTPS / permission denied):
//          create a hidden <textarea>, execCommand('copy'), then remove it
//   2. setState('success')
//   3. useTelemetry().track(commandId)   ← fire-and-forget
//   4. setTimeout(setState('idle'), 2000)
// Note: useKeyboardNav fires this same handler on Enter key when card is highlighted
```

---

### `DangerBadge`
**Props:** `show: boolean`

```tsx
// Rendered only when command.isDangerous === true
// Content: "⚠ Danger"
// Style: bg-warning/10 text-warning text-2xs font-semibold rounded-full px-2 py-0.5
// Tooltip on hover: command.description (the fun warning text)
```

---

### `FloatingCanvas`
**Props:** none (reads `useSettingsStore`)

```tsx
// position: fixed inset-0, pointer-events-none, z-0
// Renders N FloatingCodeSnippets + FloatingDeveloperCard
// Respects prefers-reduced-motion: renders nothing if reduced motion
// useSettingsStore.showFloating: toggle visibility
```

---

### `FloatingCodeSnippet`
**Props:** `snippet: string`, `initialX: number`, `initialY: number`, `speed: number`

```tsx
// Slow drift animation: randomized direction, very slow (20–60s loops)
// Opacity: 0.04–0.08 (barely visible, ambient texture)
// Font: font-mono, text-syntax-keyword / text-syntax-string (random)
// Size: text-xs to text-sm
// No interaction (pointer-events-none)
```

---

### `FloatingDeveloperCard`
**Props:** none (reads from `DEVELOPER_INFO` in `src/constants/config.ts`)

`DEVELOPER_INFO` schema (defined in `constants/config.ts`):
```ts
export const DEVELOPER_INFO = {
  name: 'Your Name',
  role: 'Developer',
  avatarUrl: '/assets/images/easter-egg-avatar.png',
  githubUrl: 'https://github.com/yourhandle',
  message: 'You found me 👋',
} as const;
```

```tsx
// A small card floating in the background
// pointer-events: auto (clickable!)
// On click: opens modal/drawer with GitHub link → easter egg 🥚
// Shows developer avatar + name, very subtle
// Animation: gentle float path, slight rotation wobble
// Opacity: 0.15 (barely there — users who discover it feel rewarded)
```

---

### `AdSkeleton`
**Props:** `height: number` (e.g. 90 for banner, 250 for rectangle)

```tsx
// Fixed height container (prevents CLS when ad loads)
// bg-bg-surface, rounded-xl, border border-border-subtle
// Subtle shimmer animation (pulse)
// Shows "Advertisement" label in text-text-muted
```

---

## Shared UI Components

### `Badge`
**Props:** `label: string`, `color?: string`, `size?: 'sm' | 'md'`
Used for category chip on ResultCard

### `Kbd`
**Props:** `keys: string[]`
Displays keyboard shortcut hints like `↑ ↓ Enter`

### `Skeleton`
**Props:** `width?: string`, `height?: string`, `rounded?: string`
Generic shimmer skeleton for loading states

### `Tooltip`
**Props:** `content: string`, `children: ReactNode`
Used on DangerBadge, CopyButton (shows "Copied!" feedback)
