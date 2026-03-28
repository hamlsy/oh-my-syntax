import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/useUIStore';
import { useTranslation } from 'react-i18next';
import { SPRING } from '@/constants/animation';
import { cn } from '@/utils/classNames';

export function LanguageToggle() {
  const language = useUIStore(s => s.language);
  const setLanguage = useUIStore(s => s.setLanguage);
  const { t } = useTranslation();

  return (
    <div
      className="flex items-center gap-0.5 bg-bg-overlay rounded-xl p-1 border border-border-subtle"
      role="group"
      aria-label={t('language.toggle')}
    >
      {(['en', 'ko'] as const).map(lang => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          className={cn(
            'relative px-3 py-1 text-xs font-semibold rounded-lg transition-colors duration-150 min-w-[36px]',
            language === lang ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'
          )}
          aria-pressed={language === lang}
        >
          {language === lang && (
            <motion.div
              layoutId="lang-indicator"
              className="absolute inset-0 bg-accent-soft rounded-lg"
              transition={SPRING.snappy}
            />
          )}
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={lang}
              className="relative z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              {t(`language.${lang}`)}
            </motion.span>
          </AnimatePresence>
        </button>
      ))}
    </div>
  );
}
