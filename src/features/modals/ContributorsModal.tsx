import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/store/useSettingsStore';
import { CONTRIBUTORS } from '@/constants/config';
import { SPRING } from '@/constants/animation';

export function ContributorsModal() {
  const { t } = useTranslation();
  const showContributors    = useSettingsStore(s => s.showContributors);
  const setShowContributors = useSettingsStore(s => s.setShowContributors);

  const close = () => setShowContributors(false);

  return (
    <AnimatePresence>
      {showContributors && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
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
              <X size={18} />
            </button>

            <h2 className="text-text-primary text-lg font-bold mb-4">
              {t('contributors.title')}
            </h2>

            <ul className="flex flex-col gap-3">
              {CONTRIBUTORS.map(contributor => (
                <li key={contributor.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-accent-soft flex items-center justify-center text-xs font-bold text-accent overflow-hidden shrink-0">
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
                    <div className="min-w-0">
                      <p className="text-text-primary text-sm font-semibold leading-none truncate">
                        {contributor.name}
                      </p>
                      <p className="text-text-muted text-xs leading-none mt-1">
                        {contributor.role}
                      </p>
                    </div>
                  </div>

                  <a
                    href={contributor.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-1.5 text-text-muted hover:text-accent text-xs transition-colors duration-150"
                    aria-label={`${contributor.name} GitHub`}
                  >
                    <ExternalLink size={13} />
                    {t('contributors.viewGitHub')}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
