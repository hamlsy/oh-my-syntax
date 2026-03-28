import { useCallback } from 'react';
import { CategoryTabs } from './CategoryTabs';
import { SearchBar } from './SearchBar';
import { ResultList } from '@/features/results/ResultList';
import { useCommandSearch } from '@/hooks/useCommandSearch';
import { useKeyboardNav } from '@/hooks/useKeyboardNav';
import { useQuerySync } from '@/hooks/useQuerySync';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { useSearchStore } from '@/store/useSearchStore';
import { useHighlightedResultScroll } from '@/hooks/useHighlightedResultScroll';

export function SearchContainer() {
  const results = useCommandSearch();
  const highlightedIndex = useSearchStore(s => s.highlightedIndex);
  const resetSearch = useSearchStore(s => s.resetSearch);
  const { copy } = useCopyToClipboard();

  useQuerySync();
  useHighlightedResultScroll(highlightedIndex);

  const handleCopy = useCallback((command: string) => {
    void copy(command);
  }, [copy]);

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
