import { motion, AnimatePresence } from 'framer-motion';
import { Clipboard, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { useTelemetry } from '@/hooks/useTelemetry';
import { SPRING } from '@/constants/animation';
import { cn } from '@/utils/classNames';
import { Tooltip } from '@/components/ui/Tooltip';

interface CopyButtonProps {
  command: string;
  commandId: string;
}

export function CopyButton({ command, commandId }: CopyButtonProps) {
  const { t } = useTranslation();
  const { copied, copy } = useCopyToClipboard();
  const { track } = useTelemetry();

  const handleCopy = async () => {
    await copy(command);
    track(commandId);
  };

  return (
    <Tooltip content={copied ? t('copy.success') : t('copy.tooltip')}>
      <button
        onClick={handleCopy}
        className={cn(
          'relative flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-bg-surface',
          copied
            ? 'text-success bg-success/10'
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
