import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Lenis from 'lenis';
import './index.css';
import App from './App.tsx';
import enTranslation from './locales/en/translation.json';
import koTranslation from './locales/ko/translation.json';
import { detectUserLocale } from './utils/locale';
import { useUIStore } from './store/useUIStore';

const detectedLocale = detectUserLocale();

await i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslation },
    ko: { translation: koTranslation },
  },
  lng: detectedLocale,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

// Keep i18n and <html lang> in sync with UIStore language changes
useUIStore.subscribe(
  (state) => state.language,
  (lang) => {
    void i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
  },
  { equalityFn: Object.is }
);

// Trigger initial sync (idempotent — store already holds correct locale)
useUIStore.getState().setLanguage(detectedLocale);
document.documentElement.lang = detectedLocale;

// Lenis smooth scroll
const lenis = new Lenis({
  duration: 1.2,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

let rafId: number;
function raf(time: number) {
  lenis.raf(time);
  rafId = requestAnimationFrame(raf);
}
rafId = requestAnimationFrame(raf);

// Cleanup on HMR teardown
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    cancelAnimationFrame(rafId);
    lenis.destroy();
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
