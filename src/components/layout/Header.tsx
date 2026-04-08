import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '@/features/settings/LanguageToggle';
import { useSettingsStore } from '@/store/useSettingsStore';

export function Header() {
  const { t } = useTranslation();
  const setShowContributors = useSettingsStore(s => s.setShowContributors);
  const setShowContribute   = useSettingsStore(s => s.setShowContribute);

  return (
    <header className="sticky top-0 z-20 backdrop-blur-md bg-bg-base/60 border-b border-border-subtle/50">
      <div className="max-w-3xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
        <span className="text-text-muted text-sm font-mono font-medium tracking-wide select-none">
          <span className="text-accent">✦</span> oh-my-syntax
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowContributors(true)}
            className="text-xs text-text-muted hover:text-text-base transition-colors duration-200 font-mono"
          >
            {t('contributors.title')}
          </button>
          <button
            onClick={() => setShowContribute(true)}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border border-border-subtle text-text-muted hover:text-accent hover:border-accent transition-colors duration-200 font-mono"
          >
            {t('contribute.button')}
          </button>
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
