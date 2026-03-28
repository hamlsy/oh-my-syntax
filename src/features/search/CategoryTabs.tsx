import { motion } from 'framer-motion';
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

  return (
    <div
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
  );
}
