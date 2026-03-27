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
         SearchResult[] → ResultList (virtualized)
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
  distance: 100,           // How far to search for a match from the start
  minMatchCharLength: 2,   // Ignore single-char queries
  includeScore: true,      // We need score for sorting
  ignoreLocation: true,    // Match anywhere in the string, not just start
  useExtendedSearch: false,
};

export function buildFuseIndex(commands: Command[]) {
  return new Fuse(commands, FUSE_OPTIONS);
}
```

---

## `useCommandSearch` Hook (`src/hooks/useCommandSearch.ts`)

```ts
import { useDeferredValue, useMemo } from 'react';
import { useSearchStore } from '@/store/useSearchStore';
import { useUIStore } from '@/store/useUIStore';
import { buildFuseIndex } from '@/utils/searchUtils';
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

  // Defer expensive computation — UI stays responsive
  const deferredQuery = useDeferredValue(query);

  // Step 1: Category filter (cheap, synchronous)
  const categoryPool = useMemo(() => {
    if (selectedCategory === 'all') return allCommands;
    return allCommands.filter(cmd => cmd.category === selectedCategory);
  }, [allCommands, selectedCategory]);

  // Build Fuse index only when pool changes (category switch)
  const fuse = useMemo(() => buildFuseIndex(categoryPool), [categoryPool]);

  // Step 2: Fuzzy search (runs on deferred query)
  const results = useMemo((): SearchResult[] => {
    if (!deferredQuery.trim()) {
      // No query → show top N by popularity
      return categoryPool
        .slice(0, DEFAULT_RESULT_COUNT)
        .map(command => ({ command, score: 0 }));
    }

    return fuse
      .search(deferredQuery, { limit: MAX_RESULT_COUNT })
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

| Scenario                          | Behavior                                         |
|-----------------------------------|--------------------------------------------------|
| Empty query, "All" category        | Top 20 by popularity                            |
| Empty query, specific category     | Top 20 from that category by popularity         |
| Query with no results              | Empty array → ResultList shows "No results" state|
| Query < 2 chars                    | Fuse `minMatchCharLength: 2` → treat as empty   |
| Korean query on EN data            | Aliases in KO data cover this → matches via `ko/`|
| Very long query (>100 chars)       | Fuse handles gracefully, `distance: 100` caps it |
