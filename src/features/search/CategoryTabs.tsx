import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSearchStore } from '@/store/useSearchStore';
import { CATEGORIES } from '@/data/categories';
import { SPRING } from '@/constants/animation';
import { cn } from '@/utils/classNames';
import type { CategoryId } from '@/types/command';

export function CategoryTabs() {
  const { t } = useTranslation();
  const selectedCategory = useSearchStore(s => s.selectedCategory);
  const setSelectedCategory = useSearchStore(s => s.setSelectedCategory);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="relative">
      {/* Left fade */}
      <AnimatePresence>
        {canScrollLeft && (
          <motion.div
            key="fade-left"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 rounded-l-2xl bg-gradient-to-r from-bg-overlay to-transparent"
          />
        )}
      </AnimatePresence>

      {/* Right fade */}
      <AnimatePresence>
        {canScrollRight && (
          <motion.div
            key="fade-right"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 rounded-r-2xl bg-gradient-to-l from-bg-overlay to-transparent"
          />
        )}
      </AnimatePresence>

      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        className="flex items-center gap-1 bg-bg-overlay rounded-2xl p-1 overflow-x-auto scrollbar-hide"
        role="tablist"
        aria-label="Command categories"
      >
        {CATEGORIES.map(cat => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setSelectedCategory(cat.id as CategoryId)}
              className={cn(
                'relative shrink-0 px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors duration-150 whitespace-nowrap min-h-[36px]',
                isActive ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="tab-background"
                  className="absolute inset-0 bg-accent-soft rounded-xl"
                  transition={SPRING.snappy}
                />
              )}
              <span className="relative z-10">{t(cat.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
