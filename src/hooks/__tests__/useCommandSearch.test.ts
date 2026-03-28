import { renderHook, act } from '@testing-library/react';
import { useCommandSearch } from '../useCommandSearch';
import { useSearchStore } from '@/store/useSearchStore';
import { useUIStore } from '@/store/useUIStore';

function resetStores() {
  useSearchStore.setState({ query: '', selectedCategory: 'all', highlightedIndex: 0 });
  useUIStore.setState({ language: 'en' });
}

describe('useCommandSearch', () => {
  beforeEach(() => {
    resetStores();
  });

  it('returns default results when query is empty', () => {
    const { result } = renderHook(() => useCommandSearch());
    expect(result.current.length).toBeGreaterThan(0);
    expect(result.current.length).toBeLessThanOrEqual(20);
  });

  it('finds kill-port command when querying "8080"', () => {
    const { result } = renderHook(() => useCommandSearch());

    act(() => {
      useSearchStore.getState().setQuery('8080');
    });

    const ids = result.current.map(r => r.command.id);
    expect(ids.some(id => id.includes('kill-port') || id.includes('lsof') || id.includes('port'))).toBe(true);
  });

  it('filters by category correctly', () => {
    const { result } = renderHook(() => useCommandSearch());

    act(() => {
      useSearchStore.getState().setSelectedCategory('linux');
    });

    const categories = result.current.map(r => r.command.category);
    expect(categories.every(cat => cat === 'linux')).toBe(true);
  });

  it('caps results at 50 items', () => {
    const { result } = renderHook(() => useCommandSearch());

    act(() => {
      useSearchStore.getState().setQuery('a');
    });

    expect(result.current.length).toBeLessThanOrEqual(50);
  });

  it('returns Korean results when language is ko', () => {
    const { result } = renderHook(() => useCommandSearch());

    act(() => {
      useUIStore.getState().setLanguage('ko');
      useSearchStore.getState().setQuery('포트');
    });

    expect(result.current.length).toBeGreaterThan(0);
  });

  it('resets highlightedIndex to 0 when query changes', () => {
    act(() => {
      useSearchStore.getState().setHighlightedIndex(3);
    });
    expect(useSearchStore.getState().highlightedIndex).toBe(3);

    act(() => {
      useSearchStore.getState().setQuery('git');
    });
    expect(useSearchStore.getState().highlightedIndex).toBe(0);
  });
});
