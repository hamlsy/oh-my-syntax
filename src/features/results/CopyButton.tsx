import { motion, AnimatePresence } from 'framer-motion';
import { Clipboard, Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SPRING } from '@/constants/animation';
import { cn } from '@/utils/classNames';
import { Tooltip } from '@/components/ui/Tooltip';

interface CopyButtonProps {
  copied:  boolean;
  error:   boolean;
  onCopy:  () => void;
}

export function CopyButton({ copied, error, onCopy }: CopyButtonProps) {
  const { t } = useTranslation();

  const handleClick = (e: React.MouseEvent) => {
    // 버블링 차단 — 부모 카드의 onClick(= 동일한 복사 핸들러)과 중복 실행 방지
    e.stopPropagation();
    onCopy();
  };

  const tooltipContent = copied
    ? t('copy.success')
    : error
    ? t('copy.error', { defaultValue: 'Failed to copy' })
    : t('copy.tooltip');

  return (
    <Tooltip content={tooltipContent}>
      <button
        onClick={handleClick}
        className={cn(
          'relative flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-bg-surface',
          copied
            ? 'text-success bg-success/10'
            : error
            ? 'text-error bg-error/10'
            : 'text-text-muted hover:text-text-primary hover:bg-bg-overlay'
        )}
        aria-label={copied ? t('copy.success') : t('copy.idle')}
      >
        <AnimatePresence mode="wait" initial={false}>
          {copied ? (
            <motion.span
              key="check"
              initial={{ scale: 0, opacity: 0, rotate: -30 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0, rotate: 30 }}
              transition={SPRING.snappy}
              className="flex items-center justify-center"
            >
              <Check size={14} />
            </motion.span>
          ) : error ? (
            <motion.span
              key="error"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={SPRING.snappy}
              className="flex items-center justify-center"
            >
              <X size={14} />
            </motion.span>
          ) : (
            <motion.span
              key="clipboard"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={SPRING.snappy}
              className="flex items-center justify-center"
            >
              <Clipboard size={14} />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </Tooltip>
  );
}
