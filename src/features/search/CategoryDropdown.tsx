import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { LayoutGrid, ChevronDown } from 'lucide-react';
import { useSearchStore } from '@/store/useSearchStore';
import { CATEGORIES, ICON_MAP } from '@/data/categories';
import { SPRING } from '@/constants/animation';
import { cn } from '@/utils/classNames';
import type { CategoryId } from '@/types/command';

const dropdownVariants = {
  hidden:  { opacity: 0, y: -6, scale: 0.97 },
  visible: { opacity: 1, y: 0,  scale: 1, transition: { ...SPRING.snappy, duration: undefined } },
  exit:    { opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.12 } },
};

export function CategoryDropdown() {
  const { t } = useTranslation();
  const selectedCategory = useSearchStore(s => s.selectedCategory);
  const setSelectedCategory = useSearchStore(s => s.setSelectedCategory);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); setIsOpen(false); }
    };
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const activeCategory = CATEGORIES.find(c => c.id === selectedCategory) ?? CATEGORIES[0];
  const ActiveIcon = ICON_MAP[activeCategory.icon] ?? LayoutGrid;
  const activeCategoryColor = activeCategory.color === 'accent' ? undefined : activeCategory.color;

  return (
    <div ref={containerRef} className="relative shrink-0">
      {/* Trigger button — matches SearchBar height (h-14) */}
      <button
        onClick={() => setIsOpen(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`${t('category.select')} — ${t(activeCategory.labelKey)}`}
        className={cn(
          'flex items-center gap-2 h-14 px-3 rounded-2xl border bg-bg-surface',
          'text-xs font-semibold whitespace-nowrap transition-all duration-150',
          isOpen
            ? 'border-accent shadow-accent-glow text-text-primary'
            : 'border-border-subtle hover:border-border-default text-text-secondary hover:text-text-primary'
        )}
      >
        <ActiveIcon
          size={14}
          style={{ color: activeCategoryColor }}
          className={activeCategoryColor ? undefined : 'text-accent'}
        />
        <span className="max-w-[6rem] truncate">{t(activeCategory.labelKey)}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={SPRING.snappy}
          className="text-text-muted"
        >
          <ChevronDown size={12} />
        </motion.span>
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="category-dropdown"
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="listbox"
            aria-label={t('category.select')}
            className="absolute left-0 top-full mt-1 z-50 min-w-[15rem] rounded-2xl border border-border-subtle bg-bg-elevated shadow-card p-2"
          >
            <div className="grid grid-cols-4 gap-1">
              {CATEGORIES.map(cat => {
                const Icon = ICON_MAP[cat.icon] ?? LayoutGrid;
                const isActive = selectedCategory === cat.id;
                const catColor = cat.color === 'accent' ? undefined : cat.color;

                return (
                  <button
                    key={cat.id}
                    role="option"
                    aria-selected={isActive}
                    onClick={() => {
                      setSelectedCategory(cat.id as CategoryId);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'flex flex-col items-center gap-1 px-2 py-2 rounded-xl text-[10px] font-medium transition-colors duration-100',
                      isActive
                        ? 'bg-accent-soft text-text-primary'
                        : 'text-text-muted hover:bg-bg-overlay hover:text-text-secondary'
                    )}
                  >
                    <Icon
                      size={13}
                      style={{ color: isActive ? undefined : catColor }}
                      className={isActive ? 'text-accent' : undefined}
                    />
                    <span className="truncate w-full text-center leading-tight">
                      {t(cat.labelKey)}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
