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

## Background Floating Animation (`FloatingCanvas`)

### Floating Code Snippets
```tsx
// Each snippet has a unique randomized path
// Uses keyframes to drift slowly across viewport

const floatVariants = (duration: number, xRange: number[], yRange: number[]) => ({
  animate: {
    x: xRange,    // e.g. [0, 40, -20, 10, 0]
    y: yRange,    // e.g. [0, -30, 20, -10, 0]
    rotate: [-2, 2, -1, 3, -2],
    transition: {
      duration,
      ease: 'easeInOut',   // ← OK here: background, non-interactive
      repeat: Infinity,
      repeatType: 'mirror' as const,
    },
  },
});

// Opacity: 0.04–0.08 (very faint — ambient texture, not distraction)
// Each instance has randomized: duration (25–55s), position, path
```

**Why `ease` is acceptable here:**
The floating background is non-interactive ambient motion. Spring physics
are for elements the user directly manipulates. Long-duration drift uses
`easeInOut` for smooth looping — springs would oscillate awkwardly over 30s cycles.

### Developer Card Float
```tsx
// Slower, more deliberate float (50–70s cycle)
// Slight opacity pulse: 0.12 → 0.20 → 0.12
// On hover: opacity jumps to 0.9, scale: 1.05, cursor: pointer
// Entry: fade in after 3s delay (doesn't compete with main UI load)

whileHover={{
  opacity: 0.9,
  scale: 1.05,
  transition: SPRING.snappy,
}}
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
