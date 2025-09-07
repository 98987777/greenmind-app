import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import es from './locales/es.json';

i18n
  .use(initReactI18next)
  .init({
    // This is the key fix for the compatibility error
    compatibilityJSON: 'v4', 
    resources: {
      en: en,
      es: es,
    },
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, 
    },
  });

// This ensures the module has a default export
export default i18n;