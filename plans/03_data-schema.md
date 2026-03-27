# Plan 03 — Data Schema & Organization

## Design Goals
- Fast lookup: pre-sorted, pre-indexed JSON
- Language-aware: same `id` across `en/` and `ko/` files
- Search-optimized: rich `aliases` field for fuzzy matching
- Personality: `description` is unique and fun per entry, `isDangerous` flag

---

## Core TypeScript Types (`src/types/command.ts`)

```ts
export type CategoryId =
  | 'all'
  | 'linux'
  | 'macos'
  | 'windows'
  | 'docker'
  | 'kubernetes'
  | 'git'
  | 'java'
  | 'python'
  | 'javascript';

export interface Command {
  id: string;           // Unique stable ID, e.g. "linux-kill-port"
  category: CategoryId;
  command: string;      // The actual code/command string to copy
  title: string;        // Short human-readable label
  description: string;  // Fun, unique explanation (locale-aware)
  aliases: string[];    // Natural language search triggers (locale-aware)
  tags: string[];       // Extra search keywords (locale-agnostic, English only)
  isDangerous?: boolean;// Shows ⚠ badge and fun warning in description
  platform?: 'linux' | 'macos' | 'windows' | 'all'; // OS restriction
  popularity?: number;  // 0–100, used for initial sort before search
}

export interface Category {
  id: CategoryId;
  labelKey: string;     // i18n key for display label
  icon: string;         // lucide-react icon name
  color: string;        // accent color token for this category
}

export interface SearchResult {
  command: Command;
  score: number;        // Fuse.js relevance score (0 = perfect)
}
```

---

## File Organization

```
src/data/
├── en/
│   ├── linux.json          # ~50 commands
│   ├── macos.json          # ~30 commands
│   ├── windows.json        # ~30 commands
│   ├── docker.json         # ~40 commands
│   ├── kubernetes.json     # ~40 commands
│   ├── git.json            # ~50 commands
│   ├── java.json           # ~30 snippets
│   ├── python.json         # ~30 snippets
│   ├── javascript.json     # ~30 snippets
│   └── index.ts            # Merges + exports ALL_COMMANDS_EN: Command[]
├── ko/
│   ├── linux.json          # Same IDs, Korean title/description/aliases
│   ├── ...                 # (all same files)
│   └── index.ts            # Merges + exports ALL_COMMANDS_KO: Command[]
└── categories.ts           # CATEGORIES: Category[]
```

### Rule: `en/` is the source of truth
- `command`, `id`, `category`, `tags`, `isDangerous`, `platform`, `popularity`
  → live only in `en/` files (language-agnostic fields)
- `title`, `description`, `aliases`
  → exist in BOTH `en/` and `ko/` files
- The merger function in `index.ts` merges base fields from `en/` with locale fields from `ko/`

---

## Example Entry

### `src/data/en/linux.json` (excerpt)
```json
[
  {
    "id": "linux-kill-port",
    "category": "linux",
    "command": "kill -9 $(lsof -ti:{PORT})",
    "title": "Kill process on port",
    "description": "No mercy. Kills whatever dared to squat on your port.",
    "aliases": ["kill port", "port kill", "port 8080", "port occupied", "address already in use"],
    "tags": ["port", "kill", "process", "lsof", "pid"],
    "isDangerous": true,
    "platform": "linux",
    "popularity": 95
  },
  {
    "id": "linux-find-large-files",
    "category": "linux",
    "command": "find / -type f -size +100M 2>/dev/null | sort -rh | head -20",
    "title": "Find large files",
    "description": "Hunting down disk hogs. Perfect for that '95% disk full' panic.",
    "aliases": ["disk full", "large files", "find big files", "disk space"],
    "tags": ["disk", "find", "size", "storage"],
    "isDangerous": false,
    "platform": "linux",
    "popularity": 78
  }
]
```

### `src/data/ko/linux.json` (excerpt — same IDs, Korean fields only)
```json
[
  {
    "id": "linux-kill-port",
    "title": "포트 프로세스 강제 종료",
    "description": "자비 없음. 포트 점령한 놈을 즉시 처단합니다.",
    "aliases": ["포트 죽이기", "포트 킬", "포트 종료", "8080 죽이기", "address already in use"]
  },
  {
    "id": "linux-find-large-files",
    "title": "대용량 파일 찾기",
    "description": "디스크 잡아먹는 범인 수색 중. '디스크 꽉 참' 공황 전용.",
    "aliases": ["디스크 꽉 참", "큰 파일 찾기", "용량 차지", "파일 사이즈"]
  }
]
```

---

## Dangerous Command Examples
Commands with `isDangerous: true` should have descriptions that warn with personality:

| Command                  | Description (EN)                                        |
|--------------------------|---------------------------------------------------------|
| `rm -rf /`               | "DON'T. Just... don't. Not even for fun."               |
| `kill -9 $(lsof -ti:*)` | "Nuclear option. Everything dies."                      |
| `git push --force`       | "Your team will remember this. Not fondly."             |
| `docker system prune -a` | "Goodbye volumes. Goodbye images. Goodbye everything."  |
| `DROP TABLE`             | "This is why we have backups. You have backups, right?" |

---

## Categories Metadata (`src/data/categories.ts`)

```ts
import { Category } from '@/types/command';

export const CATEGORIES: Category[] = [
  { id: 'all',        labelKey: 'category.all',        icon: 'LayoutGrid',  color: 'accent'   },
  { id: 'linux',      labelKey: 'category.linux',      icon: 'Terminal',    color: '#f97316'  },
  { id: 'macos',      labelKey: 'category.macos',      icon: 'Laptop',      color: '#a78bfa'  },
  { id: 'windows',    labelKey: 'category.windows',    icon: 'Monitor',     color: '#38bdf8'  },
  { id: 'docker',     labelKey: 'category.docker',     icon: 'Box',         color: '#2496ed'  },
  { id: 'kubernetes', labelKey: 'category.kubernetes', icon: 'Network',     color: '#326ce5'  },
  { id: 'git',        labelKey: 'category.git',        icon: 'GitBranch',   color: '#f05033'  },
  { id: 'java',       labelKey: 'category.java',       icon: 'Coffee',      color: '#f89820'  },
  { id: 'python',     labelKey: 'category.python',     icon: 'Code2',       color: '#3572A5'  },
  { id: 'javascript', labelKey: 'category.javascript', icon: 'FileCode',    color: '#f7df1e'  },
];
```

---

## Data Merge Strategy (`src/data/en/index.ts`)

```ts
import linuxEn from './linux.json';
// ...all others

export const ALL_COMMANDS_EN: Command[] = [
  ...linuxEn,
  ...macosEn,
  ...windowsEn,
  ...dockerEn,
  ...kubernetesEn,
  ...gitEn,
  ...javaEn,
  ...pythonEn,
  ...javascriptEn,
].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)); // pre-sort by popularity
```

```ts
// src/data/ko/index.ts
import { ALL_COMMANDS_EN } from '../en';
import linuxKo from './linux.json';
// ...all others

const KO_MAP = new Map(
  [...linuxKo, ...macosKo /* etc */].map(k => [k.id, k])
);

// Merge: take base from EN, override locale fields from KO
export const ALL_COMMANDS_KO: Command[] = ALL_COMMANDS_EN.map(cmd => {
  const ko = KO_MAP.get(cmd.id);
  if (!ko) return cmd; // fallback to EN if KO missing
  return { ...cmd, title: ko.title, description: ko.description, aliases: ko.aliases };
});
```

---

## Performance Consideration
- All JSON files are **statically imported** at build time → zero runtime fetch latency
- Fuse.js index is built **once** at app init, stored in Zustand, never rebuilt
- Total estimated data size: ~200 commands × ~500 bytes = ~100KB (acceptable)
