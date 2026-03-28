import { LanguageToggle } from '@/features/settings/LanguageToggle';

export function Header() {
  return (
    <header className="sticky top-0 z-20 backdrop-blur-md bg-bg-base/60 border-b border-border-subtle/50">
      <div className="max-w-3xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
        <span className="text-text-muted text-sm font-mono font-medium tracking-wide select-none">
          <span className="text-accent">✦</span> oh-my-syntax
        </span>
        <LanguageToggle />
      </div>
    </header>
  );
}
