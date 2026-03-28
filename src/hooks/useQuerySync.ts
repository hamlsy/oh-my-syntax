import { useEffect } from 'react';
import { useSearchStore } from '@/store/useSearchStore';
import type { CategoryId } from '@/types/command';

const VALID_CATEGORIES: CategoryId[] = [
  'all', 'linux', 'macos', 'windows', 'docker',
  'kubernetes', 'git', 'java', 'python', 'javascript',
];

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
    if (cat && VALID_CATEGORIES.includes(cat)) setSelectedCategory(cat);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On store change: update URL params (no page reload)
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (selectedCategory !== 'all') params.set('cat', selectedCategory);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState(null, '', newUrl);
  }, [query, selectedCategory]);
}
