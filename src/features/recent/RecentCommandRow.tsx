import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { SPRING, DURATION } from '@/constants/animation';
import { CATEGORY_COLOR_MAP } from '@/data/categories';
import { cn } from '@/utils/classNames';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import type { RecentCommand } from '@/types/store';

interface RecentCommandRowProps {
  entry:    RecentCommand;
  index:    number;
  onRemove: (commandId: string) => void;
}

export const RecentCommandRow = memo(function RecentCommandRow({
  entry,
  index,
  onRemove,
}: RecentCommandRowProps) {
  const { t } = useTranslation();
  const { copied, error, copy } = useCopyToClipboard();
  const isReduced = useReducedMotion();

  // C-3: stagger via index-based delay instead of variants/staggerChildren
  const staggerDelay = isReduced ? 0 : index * DURATION.staggerDelay * 0.67;

  const handleClick = async () => {
    await copy(entry.command);
  };

  return (
    <motion.div
      layout
      layoutId={`recent-${entry.commandId}`}
      initial={isReduced ? { opacity: 0 } : { opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      exit={isReduced ? { opacity: 0 } : { opacity: 0, x: 6 }}
      transition={
        isReduced
          ? { duration: 0.1 }
          : { ...SPRING.smooth, delay: staggerDelay }
      }
      role="listitem"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          void handleClick();
        }
      }}
      aria-label={`Copy ${entry.title} to clipboard`}
      className={cn(
        // M-2: h-11 (44px) — CLAUDE.md touch target minimum
        'group relative flex items-center gap-2.5 h-11 px-3 rounded-xl cursor-pointer',
        'border-l-2 transition-colors duration-150 select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset',
        copied
          ? 'bg-accent-soft'
          : error
          ? 'bg-error/5'
          : 'bg-transparent hover:bg-bg-surface'
      )}
      style={{
        borderLeftColor: copied
          ? 'var(--color-accent)'
          : error
          ? 'var(--color-error)'
          : CATEGORY_COLOR_MAP[entry.category],
      }}
    >
      {/* Command text / copied / error feedback */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait" initial={false}>
          {copied ? (
            <motion.span
              key="copied"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.08 }}
              className="text-accent text-xs font-mono font-medium"
            >
              {t('recent.copied')}
            </motion.span>
          ) : error ? (
            <motion.span
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.08 }}
              className="text-error text-xs font-mono font-medium"
            >
              {t('copy.error', { defaultValue: 'Failed to copy' })}
            </motion.span>
          ) : (
            <motion.div
              key="command"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.08 }}
              className="min-w-0"
            >
              <Tooltip content={entry.command} wrap>
                <code className="text-text-primary text-xs font-mono truncate block">
                  {entry.command}
                </code>
              </Tooltip>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mi-2: opacity raised to 60/90 for readability */}
      <Badge
        label={t(`category.${entry.category}`)}
        size="sm"
        className="shrink-0 opacity-60 group-hover:opacity-90 transition-opacity duration-150"
      />

      {/* C-2: onKeyDown stopPropagation prevents Enter from bubbling to parent copy handler */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(entry.commandId); }}
        onKeyDown={(e) => e.stopPropagation()}
        aria-label={`Remove ${entry.title} from recently copied`}
        tabIndex={0}
        className={cn(
          'shrink-0 w-5 h-5 flex items-center justify-center rounded-md',
          'text-text-muted hover:text-error hover:bg-error/10',
          'opacity-0 group-hover:opacity-40 hover:!opacity-100',
          'transition-all duration-150',
          'focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-error'
        )}
      >
        <X size={12} />
      </button>
    </motion.div>
  );
});
