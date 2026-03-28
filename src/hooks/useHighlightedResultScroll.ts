import { useEffect } from 'react';

export function useHighlightedResultScroll(highlightedIndex: number) {
  useEffect(() => {
    if (highlightedIndex < 0) return;
    const el = document.getElementById(`result-item-${highlightedIndex}`);
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [highlightedIndex]);
}
