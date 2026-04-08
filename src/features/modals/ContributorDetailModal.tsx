import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/store/useSettingsStore';
import { CONTRIBUTORS } from '@/constants/config';
import { SPRING } from '@/constants/animation';

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function ContributorDetailModal() {
  const { t } = useTranslation();
  const selectedId               = useSettingsStore(s => s.selectedContributorId);
  const setSelectedContributorId = useSettingsStore(s => s.setSelectedContributorId);

  const contributor = selectedId
    ? CONTRIBUTORS.find(c => c.id === selectedId) ?? null
    : null;

  const close = () => setSelectedContributorId(null);
  const modalRef     = useRef<HTMLDivElement>(null);
  const prevFocusRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!contributor) return;

    prevFocusRef.current = document.activeElement;

    const focusTimer = setTimeout(() => {
      const el = modalRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      el?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [contributor]);

  return (
    <AnimatePresence>
      {contributor && (
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
            aria-label={contributor.name}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={SPRING.entrance}
            className="relative bg-bg-surface border border-border-default rounded-2xl p-8 max-w-sm w-full text-center shadow-card-hover"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={close}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="w-16 h-16 rounded-full bg-accent-soft flex items-center justify-center text-2xl font-bold text-accent mx-auto mb-4 overflow-hidden">
              {contributor.avatarUrl ? (
                <img
                  src={contributor.avatarUrl}
                  alt={contributor.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                contributor.name[0]
              )}
            </div>

            <p className="text-text-muted text-xs mb-1">{t('easter.modalTitle')}</p>
            <h3 className="text-text-primary text-xl font-bold mb-1">{contributor.name}</h3>
            <p className="text-accent text-sm font-medium mb-4">{contributor.role}</p>
            <p className="text-text-secondary text-sm mb-6">{contributor.message}</p>

            <a
              href={contributor.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-bg-elevated hover:bg-bg-overlay border border-border-subtle text-text-primary text-sm font-medium px-5 py-2.5 rounded-xl transition-colors duration-150"
            >
              <ExternalLink size={16} />
              {t('easter.github')}
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
