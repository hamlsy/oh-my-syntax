import { useEffect } from 'react';

export function useHighlightedResultScroll(highlightedIndex: number) {
  useEffect(() => {
    if (highlightedIndex < 0) return;
    // RAF: AnimatePresence DOM 업데이트 완료 후 실행 (race condition 방지)
    const raf = requestAnimationFrame(() => {
      const el = document.getElementById(`result-item-${highlightedIndex}`);
      el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
    return () => cancelAnimationFrame(raf);
  }, [highlightedIndex]);
}
