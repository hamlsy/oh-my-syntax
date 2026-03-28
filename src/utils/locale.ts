const LOCALE_STORAGE_KEY = 'oms-locale';

export function detectUserLocale(): 'en' | 'ko' {
  const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (saved === 'en' || saved === 'ko') return saved;

  const browserLocale = navigator.language ?? navigator.languages?.[0] ?? 'en';
  const isKorean = browserLocale.toLowerCase().startsWith('ko');
  return isKorean ? 'ko' : 'en';
}

export function saveLocalePreference(locale: 'en' | 'ko'): void {
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
}
