import { useCallback } from 'react';
import { CategoryTabs } from './CategoryTabs';
import { SearchBar } from './SearchBar';
import { ResultList } from '@/features/results/ResultList';
import { useCommandSearch } from '@/hooks/useCommandSearch';
import { useKeyboardNav } from '@/hooks/useKeyboardNav';
import { useQuerySync } from '@/hooks/useQuerySync';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { useSearchStore } from '@/store/useSearchStore';
import { useRecentCommandsStore } from '@/store/useRecentCommandsStore';
import { useHighlightedResultScroll } from '@/hooks/useHighlightedResultScroll';
import type { SearchResult } from '@/types/command';

export function SearchContainer() {
  const results = useCommandSearch();
  const highlightedIndex = useSearchStore(s => s.highlightedIndex);
  const resetSearch = useSearchStore(s => s.resetSearch);
  const { copy } = useCopyToClipboard();
  const addRecentCommand = useRecentCommandsStore(s => s.addRecentCommand);

  useQuerySync();
  useHighlightedResultScroll(highlightedIndex);

  const handleCopy = useCallback((result: SearchResult) => {
    void copy(result.command.command);
    addRecentCommand({
      commandId: result.command.id,
      command:   result.command.command,
      title:     result.command.title,
      category:  result.command.category,
    });
  }, [copy, addRecentCommand]);

  const { handleKeyDown } = useKeyboardNav({
    results,
    onCopy: handleCopy,
    onClearQuery: resetSearch,
  });

  return (
    <div
      role="combobox"
      aria-expanded={results.length > 0}
      aria-haspopup="listbox"
      aria-owns="result-listbox"
      aria-activedescendant={
        highlightedIndex >= 0 ? `result-item-${highlightedIndex}` : undefined
      }
      onKeyDown={handleKeyDown}
      className="flex flex-col gap-3"
    >
      <CategoryTabs />
      <SearchBar />
      <ResultList results={results} />
    </div>
  );
}
