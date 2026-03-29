import type { Category, CategoryId } from '@/types/command';

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
  { id: 'npm',        labelKey: 'category.npm',        icon: 'Package',     color: '#cb3837'  },
  { id: 'sql',        labelKey: 'category.sql',        icon: 'Database',    color: '#336791'  },
  { id: 'vim',        labelKey: 'category.vim',        icon: 'Terminal2',   color: '#019733'  },
];

// Single source of truth for category colors used in RecentCommandRow.
// 'all' is excluded — it uses a CSS variable ('accent'), not a hex color.
export const CATEGORY_COLOR_MAP: Record<Exclude<CategoryId, 'all'>, string> =
  Object.fromEntries(
    CATEGORIES
      .filter((c) => c.id !== 'all')
      .map((c) => [c.id, c.color])
  ) as Record<Exclude<CategoryId, 'all'>, string>;
