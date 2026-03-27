# Plan 04 — Search Engine

## Core Principle
**Zero perceived latency.** Input state updates synchronously.
Heavy filtering runs in the background via `useDeferredValue`.

---

## 2-Step Search Pipeline

```
User types → setQuery (instant, synchronous)
                ↓
         useDeferredValue(query)   ← runs when browser is idle
                ↓
    ┌─── Step 1: Category Filter ───────────────────┐
    │  if selectedCategory === 'all' → use ALL data  │
    │  else → pool.filter(cmd => cmd.category === X) │
    └───────────────────────────────────────────────┘
                ↓
    ┌─── Step 2: Fuse.js Fuzzy Search ──────────────┐
    │  if query is empty → return pool sorted by     │
    │    popularity (top 20)                         │
    │  else → fuse.search(deferredQuery, {limit:50}) │
    │    → returns [{item, score, ...}]              │
    └───────────────────────────────────────────────┘
                ↓
         SearchResult[] → ResultList
```

---

## Fuse.js Configuration

```ts
// src/utils/searchUtils.ts
import Fuse, { IFuseOptions } from 'fuse.js';
import { Command } from '@/types/command';

export const FUSE_OPTIONS: IFuseOptions<Command> = {
  // Fields to search, with relative weights
  keys: [
    { name: 'aliases', weight: 0.45 },   // Highest: "포트 죽이기", "kill port"
    { name: 'title',   weight: 0.30 },   // "Kill process on port"
    { name: 'command', weight: 0.15 },   // "kill -9 $(lsof...)"
    { name: 'tags',    weight: 0.10 },   // "port", "pid", "process"
  ],
  threshold: 0.4,          // 0=exact, 1=match anything. 0.4 = balanced fuzzy
  // distance is intentionally NOT set (or left as default 100)
  // because ignoreLocation: true makes distance irrelevant —
  // Fuse.js scans the full string regardless when ignoreLocation is enabled
  minMatchCharLength: 1,   // Allow single-char queries
  // Why 1 (not 2): Korean syllables are single Unicode chars (e.g. "포" = 1 char)
  // With minMatchCharLength:2, typing "포" gives no results — bad for Korean UX
  // Empty query is handled explicitly in useCommandSearch (show top 20 by popularity)
  includeScore: true,      // We need score for sorting
  ignoreLocation: true,    // Match anywhere in the string, not just start
  useExtendedSearch: false,
};

// ─── Fuse Index Cache ─────────────────────────────────────────────────────────
// Key: "${language}-${categoryId}" → avoids rebuilding on repeated tab switches
const fuseCache = new Map<string, Fuse<Command>>();

export function getCachedFuse(key: string, commands: Command[]): Fuse<Command> {
  if (!fuseCache.has(key)) {
    fuseCache.set(key, new Fuse(commands, FUSE_OPTIONS));
  }
  return fuseCache.get(key)!;
}

export function invalidateFuseCache(): void {
  fuseCache.clear(); // Call when language changes (new dataset)
}
```

---

## `useCommandSearch` Hook (`src/hooks/useCommandSearch.ts`)

```ts
import { useDeferredValue, useMemo } from 'react';
import { useSearchStore } from '@/store/useSearchStore';
import { useUIStore } from '@/store/useUIStore';
import { getCachedFuse, invalidateFuseCache } from '@/utils/searchUtils';
import { ALL_COMMANDS_EN } from '@/data/en';
import { ALL_COMMANDS_KO } from '@/data/ko';
import type { SearchResult } from '@/types/command';

const DEFAULT_RESULT_COUNT = 20;
const MAX_RESULT_COUNT = 50;

export function useCommandSearch(): SearchResult[] {
  const query = useSearchStore(s => s.query);
  const selectedCategory = useSearchStore(s => s.selectedCategory);
  const language = useUIStore(s => s.language);

  // Select locale-specific command pool
  const allCommands = language === 'ko' ? ALL_COMMANDS_KO : ALL_COMMANDS_EN;

  // Defer expensive computation — UI stays responsive while input updates instantly
  const deferredQuery = useDeferredValue(query);

  // Step 1: Category filter (cheap, synchronous)
  const categoryPool = useMemo(() => {
    if (selectedCategory === 'all') return allCommands;
    return allCommands.filter(cmd => cmd.category === selectedCategory);
  }, [allCommands, selectedCategory]);

  // Get (or build) cached Fuse index for this language+category combination
  // Key format: "en-linux", "ko-all", etc.
  // Cache is invalidated on language switch via invalidateFuseCache()
  const fuseKey = `${language}-${selectedCategory}`;
  const fuse = useMemo(
    () => getCachedFuse(fuseKey, categoryPool),
    [fuseKey, categoryPool]
  );

  // Step 2: Fuzzy search (runs on deferred query)
  const results = useMemo((): SearchResult[] => {
    const trimmed = deferredQuery.trim();

    if (!trimmed) {
      // No query → show top N by popularity (pre-sorted in data/en/index.ts)
      return categoryPool
        .slice(0, DEFAULT_RESULT_COUNT)
        .map(command => ({ command, score: 0 }));
    }

    // NFC normalize — prevents NFD Korean (macOS clipboard/IME) from failing to match
    // NFC aliases in JSON data. "포" NFD (2 codepoints) → NFC (1 codepoint)
    const normalizedQuery = trimmed.normalize('NFC');

    return fuse
      .search(normalizedQuery, { limit: MAX_RESULT_COUNT })
      .map(result => ({
        command: result.item,
        score: result.score ?? 1,
      }));
  }, [fuse, categoryPool, deferredQuery]);

  return results;
}
```

---

## Why No Debounce?

| Approach         | UX Feel                                    | Risk                          |
|------------------|--------------------------------------------|-------------------------------|
| `setTimeout` debounce | Input lags 150–300ms, feels sluggish  | Misses fast typists' intent   |
| `useDeferredValue` | Input updates instantly, search follows | None — React handles it       |

`useDeferredValue` tells React: "this value can be stale during urgent renders."
React prioritizes the input update (urgent), then processes search in the next idle frame.
Result: **the search box always feels instant**, results catch up smoothly.

---

## Alias Design Guidelines

Good aliases cover:
1. **Natural language descriptions** — "kill port", "포트 죽이기"
2. **Error messages** — "address already in use", "permission denied"
3. **Numeric patterns** — "8080", "443", "3000"
4. **Synonyms** — "terminate", "stop", "end process"
5. **Korean + English mixing** — "docker 컨테이너 목록", "git 되돌리기"

Bad aliases:
- Duplicating the exact command string (already searched via `command` key)
- Generic terms like "command", "run", "execute" (too much noise)

---

## Edge Cases

| Scenario                              | Behavior                                                    |
|---------------------------------------|-------------------------------------------------------------|
| Empty query, "All" category           | Top 20 by popularity (no Fuse call)                        |
| Empty query, specific category        | Top 20 from that category by popularity                    |
| Query with no results                 | Empty array → ResultList shows "No results" state           |
| Single char query ("k", "포")        | `minMatchCharLength: 1` → Fuse runs, may return broad results |
| Korean query (NFC/NFD mismatch)       | `.normalize('NFC')` applied before search — safe on macOS  |
| Korean IME mid-composition            | Handled in SearchBar — see Korean IME section below        |
| Very long query (>32 chars)           | Fuse bitap chunking kicks in (~slight perf degradation), acceptable since search commands are short |

---

## Korean IME Composition Handling

### The Problem (macOS Korean Input)
When typing Korean on macOS, the browser fires `onChange` **during** IME composition
(e.g. typing "ㅍ→포→포트"). Each intermediate state triggers a React state update.

Two failure modes:
1. **Duplicate characters**: composition end event fires → final character appended to already-updated value
2. **Noisy search**: half-composed syllables ("ㅍ", "폿") sent to Fuse → irrelevant results flash

### The Fix (SearchBar + useSearchStore)

**Separate `inputValue` (display) from `query` (search):**

```tsx
// SearchBar.tsx
const [inputValue, setInputValue] = useState('');
const isComposing = useRef(false);
const setQuery = useSearchStore(s => s.setQuery);

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const val = e.target.value;
  setInputValue(val);                     // Always update display (controlled input)
  if (!isComposing.current) {
    setQuery(val);                        // Only update search when NOT composing
  }
};

const handleCompositionStart = () => {
  isComposing.current = true;
};

const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
  isComposing.current = false;
  const val = (e.target as HTMLInputElement).value;
  setInputValue(val);
  setQuery(val);                          // Commit final composed value to search
};

// In JSX:
<input
  value={inputValue}
  onChange={handleChange}
  onCompositionStart={handleCompositionStart}
  onCompositionEnd={handleCompositionEnd}
  ...
/>
```

**Why `useRef` instead of `useState` for `isComposing`:**
`isComposing` must be read synchronously inside event handlers without triggering re-renders.
`useRef` mutations are synchronous and do not schedule a render, making it ideal here.

**Why NOT rely on `e.nativeEvent.isComposing`:**
React 18 synthetic events normalize `isComposing` inconsistently across browsers.
The `onCompositionStart/End` ref pattern is reliable across Chrome, Firefox, and Safari on macOS.
