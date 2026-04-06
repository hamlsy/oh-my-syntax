import { useDeferredValue, useMemo } from 'react';
import { useSearchStore } from '@/store/useSearchStore';
import { useUIStore } from '@/store/useUIStore';
import { buildFuseIndex } from '@/utils/searchUtils';
import { ALL_COMMANDS_EN } from '@/data/en/index';
import { ALL_COMMANDS_KO } from '@/data/ko/index';
import type { SearchResult } from '@/types/command';

const DEFAULT_RESULT_COUNT = 20;
const MAX_RESULT_COUNT = 50;

export function useCommandSearch(): SearchResult[] {
  const query = useSearchStore(s => s.query);
  const selectedCategory = useSearchStore(s => s.selectedCategory);
  const language = useUIStore(s => s.language);

  const allCommands = language === 'ko' ? ALL_COMMANDS_KO : ALL_COMMANDS_EN;

  const deferredQuery = useDeferredValue(query);

  const categoryPool = useMemo(() => {
    if (selectedCategory === 'all') return allCommands;
    return allCommands.filter(cmd => cmd.category === selectedCategory);
  }, [allCommands, selectedCategory]);

  const fuse = useMemo(
    () => buildFuseIndex(categoryPool),
    [categoryPool]
  );

  const results = useMemo((): SearchResult[] => {
    const trimmed = deferredQuery.trim();

    if (!trimmed) {
      return categoryPool
        .slice(0, DEFAULT_RESULT_COUNT)
        .map(command => ({ command, score: 0 }));
    }

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
