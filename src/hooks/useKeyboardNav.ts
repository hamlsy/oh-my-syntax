import { useCallback } from 'react';
import { useSearchStore } from '@/store/useSearchStore';
import type { SearchResult } from '@/types/command';

interface UseKeyboardNavOptions {
  results: SearchResult[];
  onCopy: (command: string) => void;
  onClearQuery: () => void;
}

export function useKeyboardNav({ results, onCopy, onClearQuery }: UseKeyboardNavOptions) {
  const highlightedIndex = useSearchStore(s => s.highlightedIndex);
  const setHighlightedIndex = useSearchStore(s => s.setHighlightedIndex);

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
        if (highlightedIndex >= 0 && results[highlightedIndex]) {
          onCopy(results[highlightedIndex].command.command);
        } else if (results[0]) {
          onCopy(results[0].command.command);
        }
        break;
      }
      case 'Escape': {
        e.preventDefault();
        onClearQuery();
        setHighlightedIndex(-1);
        break;
      }
    }
  }, [highlightedIndex, results, setHighlightedIndex, onCopy, onClearQuery]);

  return { handleKeyDown };
}
