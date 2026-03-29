import { useTranslation } from 'react-i18next';
import { Kbd } from '@/components/ui/Kbd';
import { useSettingsStore } from '@/store/useSettingsStore';

export function Footer() {
  const { t } = useTranslation();
  const setShowContributors = useSettingsStore(s => s.setShowContributors);

  return (
    <footer className="relative z-10 mt-16 pb-8">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <div className="border-t border-border-subtle/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <p className="text-text-muted text-xs text-center sm:text-left">
              {t('footer.tagline')}
            </p>
            <button
              onClick={() => setShowContributors(true)}
              className="text-text-muted hover:text-accent text-xs transition-colors duration-150 shrink-0"
            >
              {t('contributors.title')}
            </button>
          </div>
          <div className="flex items-center gap-2 text-text-muted text-xs">
            <Kbd keys={['↑', '↓']} />
            <span>navigate</span>
            <Kbd keys={['Enter']} />
            <span>copy</span>
            <Kbd keys={['Esc']} />
            <span>clear</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
