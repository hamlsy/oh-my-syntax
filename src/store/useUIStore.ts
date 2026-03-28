import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { UIState } from '@/types/store';
import { detectUserLocale, saveLocalePreference } from '@/utils/locale';

export const useUIStore = create<UIState>()(
  subscribeWithSelector((set) => ({
    language: detectUserLocale(),
    setLanguage: (lang: 'en' | 'ko') => set({ language: lang }),
  }))
);

// Side effects declared once outside the store — keeps store unit-testable
useUIStore.subscribe(
  (state) => state.language,
  (lang) => {
    saveLocalePreference(lang);
    // i18n sync happens in main.tsx via the subscriber registration
  },
  { equalityFn: Object.is }
);
