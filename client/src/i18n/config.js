import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationFR from '../../public/locales/fr/translation.json';
import translationAR from '../../public/locales/ar/translation.json';

const resources = {
  fr: {
    translation: translationFR,
  },
  ar: {
    translation: translationAR,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'ar'],
    interpolation: {
      escapeValue: false, // React gère nativement l'échappement XSS
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'bca_lang',
    },
  });

// Gestion dynamique de l'attribut HTML dir="rtl" ou dir="ltr" et de la police
export const updateDocumentDirection = (lang) => {
  const isRtl = (lang || '').toLowerCase().startsWith('ar');
  document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', isRtl ? 'ar' : 'fr');
  if (isRtl) {
    document.body.classList.add('font-arabic');
  } else {
    document.body.classList.remove('font-arabic');
  }
};

// Initialisation de la direction au démarrage
updateDocumentDirection(i18n.language || 'fr');

i18n.on('languageChanged', (lang) => {
  updateDocumentDirection(lang);
});

export default i18n;
