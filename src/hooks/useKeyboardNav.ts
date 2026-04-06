import { useCallback } from 'react';
import { useSearchStore } from '@/store/useSearchStore';
import { CATEGORIES } from '@/data/categories';
import type { SearchResult } from '@/types/command';
import type { CategoryId } from '@/types/command';

interface UseKeyboardNavOptions {
  results:      SearchResult[];
  onCopy:       (result: SearchResult) => void;
  onClearQuery: () => void;
}

export function useKeyboardNav({ results, onCopy, onClearQuery }: UseKeyboardNavOptions) {
  const highlightedIndex    = useSearchStore(s => s.highlightedIndex);
  const setHighlightedIndex = useSearchStore(s => s.setHighlightedIndex);
  const selectedCategory    = useSearchStore(s => s.selectedCategory);
  const setSelectedCategory = useSearchStore(s => s.setSelectedCategory);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const next = highlightedIndex < results.length - 1
          ? highlightedIndex + 1
          : 0;
        setHighlightedIndex(next);
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const prev = highlightedIndex > 0
          ? highlightedIndex - 1
          : results.length - 1;
        setHighlightedIndex(prev);
        break;
      }
      case 'Enter': {
        e.preventDefault();
        const target = highlightedIndex >= 0
          ? results[highlightedIndex]
          : results[0];
        if (target) onCopy(target);
        break;
      }
      case 'Escape': {
        e.preventDefault();
        onClearQuery();
        setHighlightedIndex(-1);
        break;
      }
      case 'Tab': {
        e.preventDefault();
        const currentIdx = CATEGORIES.findIndex(c => c.id === selectedCategory);
        const nextIdx = e.shiftKey
          ? (currentIdx - 1 + CATEGORIES.length) % CATEGORIES.length
          : (currentIdx + 1) % CATEGORIES.length;
        setSelectedCategory(CATEGORIES[nextIdx].id as CategoryId);
        break;
      }
    }
  }, [highlightedIndex, results, setHighlightedIndex, onCopy, onClearQuery, selectedCategory, setSelectedCategory]);

  return { handleKeyDown };
}
