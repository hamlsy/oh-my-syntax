import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/store/useSettingsStore';
import { SPRING } from '@/constants/animation';

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
const REPO_ISSUES_URL = 'https://github.com/hamlsy/oh-my-syntax/issues';

function IconClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconGithub() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function IconLightbulb() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 7 7c0 2.5-1.3 4.7-3.3 6H8.3A7 7 0 0 1 12 2z" />
    </svg>
  );
}

function IconGitPullRequest() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><path d="M13 6h3a2 2 0 0 1 2 2v7" /><line x1="6" y1="9" x2="6" y2="21" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

const STEPS = [
  { Icon: IconLightbulb, key: 'step1' },
  { Icon: IconGitPullRequest, key: 'step2' },
  { Icon: IconStar, key: 'step3' },
] as const;

export function ContributeModal() {
  const { t } = useTranslation();
  const showContribute    = useSettingsStore(s => s.showContribute);
  const setShowContribute = useSettingsStore(s => s.setShowContribute);

  const close = () => setShowContribute(false);
  const modalRef     = useRef<HTMLDivElement>(null);
  const prevFocusRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!showContribute) return;

    prevFocusRef.current = document.activeElement;

    const focusTimer = setTimeout(() => {
      const el = modalRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      el?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab') return;
      const modal = modalRef.current;
      if (!modal) return;
      const items = Array.from(modal.querySelectorAll<HTMLElement>(FOCUSABLE));
      const first = items[0];
      const last  = items[items.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first?.focus(); }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      (prevFocusRef.current as HTMLElement | null)?.focus?.();
    };
  }, [showContribute]);

  return (
    <AnimatePresence>
      {showContribute && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-label={t('contribute.title')}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={SPRING.entrance}
            className="relative bg-bg-surface border border-border-default rounded-2xl p-6 max-w-sm w-full shadow-card-hover"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={close}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"
              aria-label="Close"
            >
              <IconClose />
            </button>

            <h2 className="text-text-primary text-lg font-bold mb-1">
              {t('contribute.title')}
            </h2>
            <p className="text-text-muted text-xs mb-5 leading-relaxed">
              {t('contribute.description')}
            </p>

            <ul className="flex flex-col gap-3 mb-6">
              {STEPS.map(({ Icon, key }) => (
                <li key={key} className="flex items-start gap-3">
                  <span className="mt-0.5 w-7 h-7 rounded-lg bg-accent-soft flex items-center justify-center shrink-0 text-accent">
                    <Icon />
                  </span>
                  <p className="text-text-secondary text-xs leading-relaxed pt-1">
                    {t(`contribute.${key}`)}
                  </p>
                </li>
              ))}
            </ul>

            <a
              href={REPO_ISSUES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-accent text-white text-sm font-semibold hover:opacity-90 transition-opacity duration-150"
            >
              <IconGithub />
              {t('contribute.githubButton')}
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
