# Plan 02 — Design System

## Source of Truth
All tokens live in `src/constants/colors.ts` and are exposed via Tailwind v4's CSS-first `@theme` directive in `src/index.css`.
**Never use raw hex values in components.** Always reference tokens.

> **Tailwind v4 note:** There is no `tailwind.config.ts` in v4. Theme customization is done entirely in CSS via `@theme {}` blocks. Install via `@tailwindcss/vite` Vite plugin (no PostCSS required).

---

## Color Palette (`src/constants/colors.ts`)

```ts
export const COLORS = {
  // Base backgrounds
  bg: {
    base:    '#0f111a',   // True app background (near-black, slight blue tint)
    surface: '#161826',   // Cards, modals
    elevated:'#1e2132',   // Hovered cards, dropdowns
    overlay: '#252840',   // Tooltip, popover
  },

  // Borders
  border: {
    subtle:  '#2a2d42',   // Default border
    default: '#363a55',   // Focused / hover border
    strong:  '#4a4f6e',   // Active / selected
  },

  // Text
  text: {
    primary:   '#e8eaf6', // Main readable text
    secondary: '#9097b8', // Subtitles, descriptions
    muted:     '#555c7a', // Placeholders, disabled
    inverse:   '#0f111a', // Text on light backgrounds
  },

  // Brand accent (soft violet-blue)
  accent: {
    DEFAULT: '#7c83ff',   // Primary CTA, active tab
    soft:    '#3d4280',   // Accent backgrounds
    glow:    'rgba(124,131,255,0.15)', // Box-shadow glow
  },

  // Semantic
  success: '#4ade80',     // Copy success checkmark
  warning: '#fb923c',     // Danger command badge
  error:   '#f87171',

  // Code syntax highlight tones (for floating background snippets)
  syntax: {
    keyword:  '#c792ea',
    string:   '#c3e88d',
    comment:  '#546e7a',
    number:   '#f78c6c',
    function: '#82aaff',
  },
} as const;
```

---

## Tailwind v4 Theme (`src/index.css`)

In Tailwind v4, theme tokens are declared with `@theme` directly in CSS — no `tailwind.config.ts` needed.

```css
@import "tailwindcss";

@theme {
  /* Colors */
  --color-bg-base:     #0f111a;
  --color-bg-surface:  #161826;
  --color-bg-elevated: #1e2132;
  --color-bg-overlay:  #252840;

  --color-border-subtle:  #2a2d42;
  --color-border-default: #363a55;
  --color-border-strong:  #4a4f6e;

  --color-text-primary:   #e8eaf6;
  --color-text-secondary: #9097b8;
  --color-text-muted:     #555c7a;
  --color-text-inverse:   #0f111a;

  --color-accent:         #7c83ff;
  --color-accent-soft:    #3d4280;
  --color-accent-glow:    rgba(124,131,255,0.15);

  --color-success: #4ade80;
  --color-warning: #fb923c;
  --color-error:   #f87171;

  --color-syntax-keyword:  #c792ea;
  --color-syntax-string:   #c3e88d;
  --color-syntax-comment:  #546e7a;
  --color-syntax-number:   #f78c6c;
  --color-syntax-function: #82aaff;

  /* Typography */
  --font-family-sans: 'Inter', system-ui, sans-serif;
  --font-family-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --font-size-2xs: 0.625rem;

  /* Shadows */
  --shadow-accent-glow: 0 0 20px rgba(124,131,255,0.2);
  --shadow-card:        0 2px 16px rgba(0,0,0,0.4);
  --shadow-card-hover:  0 4px 32px rgba(0,0,0,0.6);
}
```

> In components, use the generated utility classes directly: `bg-bg-base`, `text-text-primary`, `border-border-subtle`, `text-accent`, etc.

---

## Typography Scale

| Token         | Size     | Weight | Usage                          |
|---------------|----------|--------|--------------------------------|
| `display`     | 3.5rem   | 800    | "Oh My Syntax!" hero title     |
| `headline`    | 1.5rem   | 700    | Section headers                |
| `body`        | 0.9375rem| 400    | Description text               |
| `body-sm`     | 0.8125rem| 400    | Secondary descriptions         |
| `code`        | 0.875rem | 500    | Command text (mono font)       |
| `label`       | 0.75rem  | 600    | Category tabs, badges          |
| `caption`     | 0.6875rem| 400    | Keyboard hints, metadata       |

---

## Spacing System
Follow Tailwind's default 4px base. Key custom spacings:
- `search-bar-height`: `56px` (min touch target + visual weight)
- `result-card-height`: `auto` with `min-height: 72px`
- `category-tab-height`: `36px`
- `page-max-width`: `768px` (centered, readable)
- `page-padding-x`: `16px` (mobile) → `24px` (md+)

---

## Component Visual Specs

### Search Bar
```
bg: bg-surface
border: border-subtle → border-accent (focused)
border-radius: rounded-2xl
shadow: shadow-accent-glow (focused only)
icon: text-text-muted (idle) → text-accent (typing)
font: font-mono, text-body
placeholder: text-text-muted
transition: spring (border-color, box-shadow)
```

### Result Card
```
bg: bg-surface → bg-elevated (hover/keyboard-focus)
border: border-subtle → border-default (hover)
border-radius: rounded-xl
shadow: shadow-card → shadow-card-hover
command text: font-mono text-text-primary
description: text-text-secondary text-body-sm
danger badge: bg-warning/10 text-warning
copy button: see CopyButton spec
```

### Category Tab (Magic Tab)
```
container: bg-bg-overlay, rounded-2xl, p-1
tab text: text-text-muted → text-text-primary (active)
sliding bg: bg-accent-soft, rounded-xl
  → uses Framer Motion layoutId="tab-background"
```

### Copy Button
```
idle:    icon=Clipboard, text-text-muted
success: icon=Check, text-success, bg-success/10
revert:  after 2000ms → back to idle via AnimatePresence
size: 32x32px (meets 44px touch target with padding)
```

---

## Dark Mode
- Default is always dark. No light mode toggle needed.
- Background: `bg-base` (#0f111a) — NOT pure black
- Subtle grid overlay at low opacity for depth

---

## Accessibility
- All text must meet WCAG AA contrast ratio (4.5:1 for normal text)
- Focus rings: `ring-2 ring-accent ring-offset-2 ring-offset-bg-base`
- `prefers-reduced-motion`: disable all `FloatingCanvas` animations, use instant transitions
