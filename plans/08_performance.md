# Plan 08 — Performance Strategy

## Performance Budget
| Metric                  | Target          |
|-------------------------|-----------------|
| First Contentful Paint  | < 1.2s          |
| Time to Interactive     | < 2.0s          |
| Search response (felt)  | 0ms (instant)   |
| Search actual compute   | < 16ms (1 frame)|
| Bundle size (gzipped)   | < 200KB         |
| Lighthouse score        | > 90            |

---

## 1. Zero-Latency Search

### Strategy: `useDeferredValue` + Pre-built Index

```
Input keystroke
  → setQuery() (synchronous, React state)       ← 0ms felt latency
  → React re-renders SearchBar instantly
  → useDeferredValue(query) stales old value
  → React schedules deferred work in idle time
  → Fuse.search() runs (~2–8ms for 200 items)
  → Results update
```

### Fuse.js Index: Build Once Per Pool Change
```ts
// Built at app init
// Rebuilt when: (1) category changes OR (2) language changes
//   → both change the `categoryPool` which is the useMemo dependency
// Never rebuilt on: every search query keystroke

const fuse = useMemo(() => buildFuseIndex(categoryPool), [categoryPool]);
//                                                          ↑
//                    Only changes when category tab switches
```

### Pre-sorted Data
```ts
// All command data is sorted by `popularity` BEFORE being stored
// This means "no query" state shows top results instantly
// No runtime sort needed on every render

ALL_COMMANDS_EN.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
// ↑ Done once at module load time (static import evaluation)
```

---

## 2. Result List — No Virtualization (Intentional)

**Decision:** `@tanstack/react-virtual` is NOT used.

**Reason:** Virtual scroll and `framer-motion layout` animations are fundamentally incompatible.
- `react-virtual` destroys DOM nodes for off-screen items
- `framer-motion layout` tracks positional transitions between DOM nodes
- When virtual scroll removes a node mid-animation, framer-motion loses its reference → items jump

**Why it's fine:**
- Search results are hard-capped at `limit: 50` (Plan 04)
- 50 `<motion.li>` nodes = negligible DOM cost (~3ms paint)
- The UX win of fluid layout animations outweighs the marginal memory saving
- If data ever scales beyond 500 commands, the cap stays at 50 — virtualization never becomes necessary

**If future requirements demand >200 visible results simultaneously:**
Drop `framer-motion layout` on list items and replace with a simple `opacity` fade-in only.

---

## 3. Bundle Optimization

### Vite Code Splitting
```ts
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react':  ['react', 'react-dom'],
        'vendor-motion': ['framer-motion'],
        'vendor-search': ['fuse.js'],
        'vendor-misc':   ['zustand', 'i18next', 'react-i18next', 'lenis'],
      },
    },
  },
}
```

### Import Analysis (estimated gzip sizes)
| Package               | Gzipped  |
|-----------------------|----------|
| react + react-dom          | ~45KB    |
| framer-motion              | ~35KB    |
| fuse.js                    | ~8KB     |
| zustand                    | ~3KB     |
| i18next + react-i18next    | ~15KB    |
| lucide-react (tree-shaken) | ~8KB     |
| lenis                      | ~5KB     |
| **App code + data**        | ~50KB    |
| **Total (est.)**           | **~169KB** |

> Note: `framer-motion` v11+ (as `motion` package) can reduce to ~18KB.
> If bundle budget is tight, migrate to motion v11 for ~17KB savings.

### Tree Shaking Rules
- Import only used lucide icons: `import { Search, Clipboard, Check } from 'lucide-react'`
- Never: `import * as Icons from 'lucide-react'`

---

## 4. Static Data Import Strategy

All command JSON is **statically imported** at build time:
```ts
import linuxData from './linux.json';
```

Benefits:
- Zero fetch latency (bundled, no network request)
- Vite inlines JSON into the JS bundle
- Type-safe via TypeScript

Tradeoff:
- Bundle grows with more commands (~100KB for ~200 commands)
- Acceptable for this use case (developer tools, not mobile-first consumer app)
- Future: if data exceeds 500KB, switch to lazy-loaded chunks per category

---

## 5. React Rendering Optimization

### Memoization Rules
```ts
// Memoize expensive derived values
const categoryPool = useMemo(() => ..., [allCommands, selectedCategory]);
const fuse = useMemo(() => buildFuseIndex(categoryPool), [categoryPool]);
const results = useMemo(() => ..., [fuse, categoryPool, deferredQuery]);

// Memoize stable callbacks passed to child components
const handleCopy = useCallback(() => ..., [command]);
const handleCategorySelect = useCallback((id) => ..., []);
```

### Component Memoization
```ts
// ResultCard: memoize to prevent re-renders when unrelated state changes
export const ResultCard = React.memo(function ResultCard({ result, isHighlighted }) {
  ...
}, (prev, next) =>
  prev.result.command.id === next.result.command.id &&
  prev.isHighlighted === next.isHighlighted
);
```

### Zustand Slice Subscriptions
```ts
// Only subscribe to the slice you need, not the whole store
const query = useSearchStore(s => s.query);          // ✅
const store = useSearchStore();                       // ❌ re-renders on any change
```

---

## 6. Animation Performance

### GPU-composited Properties Only
Framer Motion animations must only animate:
- `transform` (translate, scale, rotate) — GPU composited ✅
- `opacity` — GPU composited ✅
- `filter: blur()` — GPU composited ✅ (hero entrance only, one-shot)

**Never animate:**
- `width`, `height` — triggers layout recalculation ❌
- `top`, `left`, `margin` — triggers layout ❌
- `background-color` alone — use CSS `transition-colors` instead ✅

### FloatingCanvas Performance
```tsx
// Each floating item is `will-change: transform`
// Framer Motion sets this automatically for animated elements
// Cap FloatingCanvas to max 8 items — each is a RAF loop
// Use CSS keyframes for pure drift (lighter than Framer for ambient loops)
```

---

## 7. Anti-CLS (Cumulative Layout Shift)

### AdSkeleton Fixed Heights
```tsx
// Always reserve space for future ad zones
<div style={{ minHeight: '90px' }}>  {/* leaderboard banner */}
  <AdSkeleton height={90} />
</div>
```

### ResultList Stable Height
```tsx
// Virtualized container has a fixed height
// Never let the list container resize based on content
<div ref={scrollRef} style={{ height: '480px', overflowY: 'auto' }}>
  ...
</div>
```

---

## 8. Telemetry: Non-Blocking Fire-and-Forget

```ts
// src/hooks/useTelemetry.ts
export function useTelemetry() {
  const track = useCallback((commandId: string) => {
    // Fire and forget — never await, never block UI
    fetch(TELEMETRY_URL, {
      method: 'POST',
      body: JSON.stringify({ commandId, ts: Date.now() }),
      headers: { 'Content-Type': 'application/json' },
      // Use keepalive to ensure the request completes even if page unloads
      keepalive: true,
    }).catch(() => {/* silently ignore errors */});
  }, []);

  return { track };
}
```
