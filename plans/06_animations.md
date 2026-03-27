# Plan 06 — Animations & Motion

## Golden Rules
1. **Spring physics ONLY** for interactive elements — never `linear` or `ease`
2. **`layout` prop** on all list items — smooth reorder, no snapping
3. **`AnimatePresence`** for mount/unmount transitions
4. **`prefers-reduced-motion`** guard on all non-essential animations
5. Animations must be **felt, not seen** — subtle, fast, purposeful

---

## Spring Presets (`src/constants/animation.ts`)

```ts
export const SPRING = {
  // Snappy UI feedback (buttons, tabs, copy icon swap)
  snappy: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 30,
  },
  // Smooth layout transitions (result list reorder, card entrance)
  smooth: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 25,
  },
  // Gentle floats (background items)
  gentle: {
    type: 'spring' as const,
    stiffness: 60,
    damping: 20,
  },
  // Hero entrance (one-shot, slightly bouncy)
  entrance: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 20,
    mass: 1.2,
  },
} as const;

export const DURATION = {
  copyRevert: 2000,       // ms — clipboard icon reverts after this
  floatCycle: 30000,      // ms — one full background float loop
  staggerDelay: 0.06,     // s  — between staggered list items
  exitFast: 0.15,         // s  — quick exit for transient elements
} as const;
```

---

## Per-Component Animation Specs

### Hero Title (`HeroSection`)
```ts
// One-shot entrance on mount
initial: { opacity: 0, y: 30, filter: 'blur(8px)' }
animate: { opacity: 1, y: 0,  filter: 'blur(0px)' }
transition: SPRING.entrance
```

### Category Tabs — Magic Sliding Background
```tsx
// The sliding pill behind the active tab
<motion.div
  layoutId="tab-background"
  className="absolute inset-0 bg-accent-soft rounded-xl"
  transition={SPRING.snappy}
/>
// Tab text color transitions via CSS (no Framer needed):
// class: "transition-colors duration-150"
```

### Search Bar — Focus Ring
```tsx
// Use CSS transition for border/shadow — Framer overkill here
// class: "transition-all duration-200"
// focus: ring-2 ring-accent shadow-accent-glow
// Note: border-color and box-shadow are GPU-composited, safe for CSS transition
```

### Result List — Staggered Entrance
```tsx
// Parent motion.ul
const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: DURATION.staggerDelay,
    },
  },
};

// Each motion.li
const itemVariants = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: SPRING.smooth },
  exit:    { opacity: 0, y: -6, transition: { duration: DURATION.exitFast } },
  // ↑ Exception to "spring only" rule: exit animations are non-interactive (user doesn't
  //   directly drive them), so a short duration tween is acceptable and actually preferred
  //   (springs on exit can feel bouncy-then-disappear in a jarring way)
};

// Usage:
<motion.ul variants={listVariants} initial="hidden" animate="visible">
  <AnimatePresence mode="popLayout">
    {results.map(r => (
      <motion.li key={r.command.id} layout variants={itemVariants} exit="exit">
        <ResultCard ... />
      </motion.li>
    ))}
  </AnimatePresence>
</motion.ul>
```

**Why `mode="popLayout"` on AnimatePresence?**
Items that exit are immediately removed from layout flow, so remaining items
slide into position without waiting for exit animation to finish. Feels snappier.

### Result Card — Hover & Keyboard Highlight
```tsx
// whileHover and keyboard highlight use the same visual state
// Framer whileHover for mouse, className override for keyboard nav
whileHover={{ scale: 1.005 }}  // barely perceptible — depth cue only
transition={SPRING.snappy}

// bg and border change via CSS transition:
// class: "transition-colors duration-150"
```

### Copy Button — Icon Swap
```tsx
// AnimatePresence wraps the two icon states
<AnimatePresence mode="wait" initial={false}>
  {copied ? (
    <motion.span key="check"
      initial={{ scale: 0, opacity: 0, rotate: -30 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      exit={{    scale: 0, opacity: 0, rotate: 30 }}
      transition={SPRING.snappy}
    >
      <Check size={16} className="text-success" />
    </motion.span>
  ) : (
    <motion.span key="clipboard"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{    scale: 0, opacity: 0 }}
      transition={SPRING.snappy}
    >
      <Clipboard size={16} />
    </motion.span>
  )}
</AnimatePresence>
```

### Language Toggle
```tsx
// Two text labels (EN / KO), sliding underline indicator using layoutId
<motion.div layoutId="lang-indicator" ... transition={SPRING.snappy} />
```

---

## Background Floating Animation — Space Universe Theme

The background has **3 independent layers**, each with its own animation strategy:

```
Layer 3 (top)    FloatingContributorCard × 0–N   pointer-events: auto
Layer 2          FloatingCodeSnippet × 10–14     pointer-events: none
Layer 1 (bottom) StarField                        pointer-events: none, CSS only
```

---

### Layer 1: StarField (CSS only — no Framer Motion)

```css
/* Star twinkling — pure CSS @keyframes, zero JS overhead */
@keyframes twinkle {
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50%       { opacity: 0.9; transform: scale(1.3); }
}

/* Static stars: generated as a single box-shadow on a pseudo-element
   → ~200 stars, no individual DOM nodes
   → random positions seeded at build time or via CSS custom property trick */
.star-field::before {
  content: '';
  position: fixed;
  inset: 0;
  box-shadow:
    142px 73px 1px #fff,
    89px 210px 1px #a5b4fc,
    /* ... ~200 entries generated programmatically */;
}

/* Twinkling stars: ~20 <span> elements, staggered animation-delay */
.star-twinkle {
  animation: twinkle var(--duration, 3s) ease-in-out infinite;
  animation-delay: var(--delay, 0s);
}
```

**Why CSS, not Framer Motion:**
- 200 stars as Framer Motion nodes = 200 RAF listeners → unacceptable overhead
- CSS `box-shadow` stars = 1 DOM node, 1 paint layer, GPU composited
- Twinkling `<span>` elements use CSS `animation` → browser-optimized, off main thread

---

### Layer 2: Floating Code Snippets (Framer Motion)

```tsx
// Syntax debris drifting in space — feels like floating in zero gravity
// Content pool (sampled randomly per instance):
// CLI:  'kill -9', 'grep -r', 'chmod 755', '#!/bin/bash', 'sudo !!'
// Git:  'git stash', '--force', 'HEAD~1', 'rebase -i'
// K8s:  'kubectl get pods', 'CrashLoopBackOff', '-n default'
// Code: '=>', '{}', '[]', 'null', 'undefined', '0x00', '404'

const floatVariants = (duration: number, xRange: number[], yRange: number[]) => ({
  animate: {
    x: xRange,       // e.g. [0, 30, -15, 20, 0]
    y: yRange,       // e.g. [0, -40, 15, -20, 0]
    rotate: [-3, 2, -1, 4, -2],
    transition: {
      duration,
      ease: 'easeInOut',   // ← OK: non-interactive ambient motion
      repeat: Infinity,
      repeatType: 'mirror' as const,
    },
  },
});

// Each instance: randomized duration (25–55s), start position, path amplitude
// Opacity: 0.05–0.12
// Font: font-mono, color from syntax token palette (keyword/string/comment)
// Size: text-xs or text-sm, slight rotation baked into path
// Count: 10–14 items (cap for performance)
```

**Why `ease` is acceptable here:**
Background items are not interactive — the user never directly manipulates them.
`easeInOut` over 30–55s creates smooth organic drift. Springs would oscillate
awkwardly at this timescale.

---

### Layer 3: Floating Contributor Cards (Framer Motion)

```tsx
// Cards spawn based on spawnProbability (rolled once per page load)
// Multiple cards can coexist — each follows an independent drift path

// Idle float (same pattern as code snippets but slower + rotation wobble)
const contributorFloatVariants = (seed: string) => ({
  animate: {
    x: seededRange(seed, 'x'),  // deterministic path per contributor id
    y: seededRange(seed, 'y'),
    rotate: [-4, 3, -2, 5, -3],
    transition: {
      duration: 55 + seededOffset(seed) * 20,  // 55–75s cycle
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'mirror' as const,
    },
  },
});

// Opacity pulse: 0.12 → 0.22 → 0.12 (subtle breathing effect)
// Entry: initial={{ opacity: 0, scale: 0.8 }}
//        animate={{ opacity: 0.12, scale: 1 }}
//        transition: spring SPRING.gentle, delay: 3 + index * 1.5s

// Hover (Framer Motion whileHover — spring, interactive):
whileHover={{
  opacity: 0.92,
  scale: 1.08,
  transition: SPRING.snappy,  // ← spring, user-driven → follows spring rule
}}

// On click: open EasterEggModal (AnimatePresence fade-in overlay)
// Card content: avatar (20px circle) + name + role chip
// pointer-events: auto (only layer with interaction)
```

---

### `EasterEggModal` (triggered by card click)

```tsx
// Overlay: bg-black/60 backdrop-blur-sm
// Card: bg-bg-surface border border-border-default rounded-2xl p-6
// Content: large avatar, name, role, message, GitHub button
// Entry animation:
//   initial: { opacity: 0, scale: 0.9, y: 20 }
//   animate: { opacity: 1, scale: 1,   y: 0  }
//   transition: SPRING.entrance
// Dismiss: click outside, Escape key, or ✕ button
// AnimatePresence wraps the modal for smooth exit
```

---

## Reduced Motion Strategy (`src/hooks/useReducedMotion.ts`)

```ts
import { useReducedMotion as useFramerReducedMotion } from 'framer-motion';

export function useReducedMotion() {
  const prefersReduced = useFramerReducedMotion();
  return prefersReduced ?? false;
}
```

**Usage rules when `isReduced === true`:**
| Animation         | Reduced behavior              |
|-------------------|-------------------------------|
| Hero entrance     | Instant appear (no blur/slide)|
| Result list       | No stagger, instant fade-in   |
| Result card hover | No scale transform            |
| Copy button swap  | Instant icon change           |
| FloatingCanvas    | Render nothing (hidden)       |
| Category tab      | Instant background move       |

---

## Lenis Smooth Scroll

```ts
// src/main.tsx — init Lenis on app mount
import Lenis from 'lenis';

const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

function raf(time: number) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
```

Note: Lenis is only applied to the main scroll container, not inside the
virtualized result list (react-virtual handles its own scroll).
