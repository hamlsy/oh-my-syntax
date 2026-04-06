import { useEffect } from 'react';
import { useSearchStore } from '@/store/useSearchStore';
import { CATEGORIES } from '@/data/categories';
import type { CategoryId } from '@/types/command';

// Single source of truth: derived from categories.ts (no manual sync needed)
const VALID_CATEGORY_IDS = new Set(CATEGORIES.map(c => c.id));

export function useQuerySync() {
  const query = useSearchStore(s => s.query);
  const selectedCategory = useSearchStore(s => s.selectedCategory);
  const setQuery = useSearchStore(s => s.setQuery);
  const setSelectedCategory = useSearchStore(s => s.setSelectedCategory);

  // On mount: read URL params → populate store
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const cat = params.get('cat') as CategoryId | null;

    if (q) setQuery(q);
    if (cat && VALID_CATEGORY_IDS.has(cat)) setSelectedCategory(cat);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On store change: update URL params (debounced — suppress mid-typing updates)
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (selectedCategory !== 'all') params.set('cat', selectedCategory);

      const newUrl = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;

      window.history.replaceState(null, '', newUrl);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, selectedCategory]);
}
