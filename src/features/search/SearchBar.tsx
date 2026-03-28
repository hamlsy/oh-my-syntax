import { useState, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSearchStore } from '@/store/useSearchStore';
import { cn } from '@/utils/classNames';
import { MAX_QUERY_LENGTH } from '@/constants/config';

export function SearchBar() {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');
  const isComposing = useRef(false);
  const setQuery = useSearchStore(s => s.setQuery);
  const resetSearch = useSearchStore(s => s.resetSearch);
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (!isComposing.current) {
      setQuery(val);
    }
  }, [setQuery]);

  const handleCompositionStart = useCallback(() => {
    isComposing.current = true;
  }, []);

  const handleCompositionEnd = useCallback((e: React.CompositionEvent<HTMLInputElement>) => {
    isComposing.current = false;
    const val = (e.target as HTMLInputElement).value;
    setInputValue(val);
    setQuery(val);
  }, [setQuery]);

  const handleClear = useCallback(() => {
    setInputValue('');
    resetSearch();
  }, [resetSearch]);

  return (
    <div className="relative">
      <div
        className={cn(
          'flex items-center gap-3 bg-bg-surface border rounded-2xl px-4 h-14 transition-all duration-200',
          isFocused
            ? 'border-accent shadow-accent-glow'
            : 'border-border-subtle hover:border-border-default'
        )}
      >
        <Search
          size={18}
          className={cn(
            'shrink-0 transition-colors duration-150',
            inputValue ? 'text-accent' : 'text-text-muted'
          )}
        />
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={t('search.placeholder')}
          maxLength={MAX_QUERY_LENGTH}
          className="flex-1 bg-transparent text-text-primary font-mono text-sm placeholder:text-text-muted outline-none"
          aria-label={t('search.placeholder')}
          autoComplete="off"
          spellCheck={false}
        />
        {inputValue && (
          <button
            onClick={handleClear}
            className="shrink-0 text-text-muted hover:text-text-primary transition-colors duration-150 p-1 rounded-md hover:bg-bg-elevated"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
