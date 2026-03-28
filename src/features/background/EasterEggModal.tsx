import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/store/useSettingsStore';
import { CONTRIBUTORS } from '@/constants/config';
import { SPRING } from '@/constants/animation';

export function EasterEggModal() {
  const { t } = useTranslation();
  const showEasterEgg = useSettingsStore(s => s.showEasterEgg);
  const setShowEasterEgg = useSettingsStore(s => s.setShowEasterEgg);

  const creator = CONTRIBUTORS.find(c => c.id === 'creator') ?? CONTRIBUTORS[0];

  return (
    <AnimatePresence>
      {showEasterEgg && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowEasterEgg(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={SPRING.entrance}
            className="relative bg-bg-surface border border-border-default rounded-2xl p-8 max-w-sm w-full text-center shadow-card-hover"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowEasterEgg(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="w-16 h-16 rounded-full bg-accent-soft flex items-center justify-center text-2xl font-bold text-accent mx-auto mb-4 overflow-hidden">
              {creator.avatarUrl ? (
                <img
                  src={creator.avatarUrl}
                  alt={creator.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                creator.name[0]
              )}
            </div>

            <p className="text-text-muted text-xs mb-1">{t('easter.modalTitle')}</p>
            <h3 className="text-text-primary text-xl font-bold mb-1">{creator.name}</h3>
            <p className="text-accent text-sm font-medium mb-4">{creator.role}</p>
            <p className="text-text-secondary text-sm mb-6">{creator.message}</p>

            <a
              href={creator.githubUrl}
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
