import { useState, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { SPRING, DURATION } from '@/constants/animation';
import { RECENT_COPY_REVERT_MS } from '@/constants/config';
import { CATEGORY_COLOR_MAP } from '@/data/categories';
import { cn } from '@/utils/classNames';
import { useReducedMotion } from '@/hooks/useReducedMotion';
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
  const [copiedLocal, setCopiedLocal] = useState(false);
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isReduced = useReducedMotion();

  // C-3: stagger via index-based delay instead of variants/staggerChildren
  const staggerDelay = isReduced ? 0 : index * DURATION.staggerDelay * 0.67;

  // B-2 (from plan): try/catch prevents unhandled rejection on clipboard denial
  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(entry.command);
      setCopiedLocal(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopiedLocal(false), RECENT_COPY_REVERT_MS);
    } catch {
      // clipboard permission denied or unavailable — silent fail
    }
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
        copiedLocal
          ? 'bg-accent-soft'
          : 'bg-transparent hover:bg-bg-surface'
      )}
      style={{
        // Tailwind cannot use runtime hex values in arbitrary classes;
        // inline style is the only way to apply dynamic category color to border-l
        borderLeftColor: copiedLocal
          ? 'var(--color-accent)'
          : CATEGORY_COLOR_MAP[entry.category],
      }}
    >
      {/* Command text / copied feedback */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait" initial={false}>
          {copiedLocal ? (
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
          ) : (
            <motion.div
              key="command"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.08 }}
              className="min-w-0"
            >
              {/* TODO: Tooltip uses whitespace-nowrap + max-w-[240px]; commands >~35 chars
                  are still truncated inside the tooltip. Future improvement: add a `wrap`
                  prop to the Tooltip component. */}
              <Tooltip content={entry.command}>
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
