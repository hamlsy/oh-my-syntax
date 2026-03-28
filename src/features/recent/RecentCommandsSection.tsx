import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { RecentCommandRow } from './RecentCommandRow';
import { useRecentCommandsStore } from '@/store/useRecentCommandsStore';
import { useSearchStore } from '@/store/useSearchStore';
import { SPRING } from '@/constants/animation';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function RecentCommandsSection() {
  const { t } = useTranslation();
  const recentCommands      = useRecentCommandsStore(s => s.recentCommands);
  const removeRecentCommand = useRecentCommandsStore(s => s.removeRecentCommand);
  const clearRecentCommands = useRecentCommandsStore(s => s.clearRecentCommands);
  const query               = useSearchStore(s => s.query);
  const isReduced           = useReducedMotion();

  // Self-contained visibility logic — App.tsx needs no store subscriptions (Should-9)
  const isVisible = recentCommands.length > 0 && query === '';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.section
          key="recent-section"
          initial={isReduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={isReduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
          transition={isReduced ? { duration: 0.1 } : SPRING.smooth}
          aria-label={t('recent.title')}
          className="mb-4"
        >
          {/* Section header */}
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-2xs font-medium uppercase tracking-widest text-text-muted select-none">
              {t('recent.title')}
            </span>
            <button
              onClick={clearRecentCommands}
              aria-label="Clear all recently copied commands"
              className="text-2xs text-text-muted hover:text-error transition-colors duration-150"
            >
              {t('recent.clear')}
            </button>
          </div>

          {/* C-3: plain div instead of motion.div with variants — stagger is handled
              per-row via index-based delay in RecentCommandRow */}
          <div role="list" className="flex flex-col gap-0.5">
            <AnimatePresence mode="popLayout">
              {recentCommands.map((entry, index) => (
                <RecentCommandRow
                  key={entry.commandId}
                  entry={entry}
                  index={index}
                  onRemove={removeRecentCommand}
                />
              ))}
            </AnimatePresence>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
