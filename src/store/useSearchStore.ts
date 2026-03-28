import { create } from 'zustand';
import type { SearchState } from '@/types/store';
import type { CategoryId } from '@/types/command';

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  selectedCategory: 'all' as CategoryId,
  highlightedIndex: -1,

  setQuery: (query: string) =>
    set({ query, highlightedIndex: -1 }),

  setSelectedCategory: (category: CategoryId) =>
    set({ selectedCategory: category, highlightedIndex: -1 }),

  setHighlightedIndex: (index: number) =>
    set({ highlightedIndex: index }),

  resetSearch: () =>
    set({ query: '', selectedCategory: 'all', highlightedIndex: -1 }),
}));
