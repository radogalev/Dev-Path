import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translations from './data/translations.bg.sections.json';

const extractLocaleTree = (node, locale) => {
  if (Array.isArray(node)) {
    return node.map((item) => extractLocaleTree(item, locale));
  }

  if (node && typeof node === 'object') {
    if (typeof node.en === 'string' || typeof node.bg === 'string') {
      return node[locale] || node.en || node.bg || '';
    }

    return Object.fromEntries(
      Object.entries(node).map(([key, value]) => [key, extractLocaleTree(value, locale)])
    );
  }

  return node;
};

const savedLanguage = localStorage.getItem('app-language');
const fallbackLanguage = 'en';
const initialLanguage = savedLanguage === 'bg' || savedLanguage === 'en' ? savedLanguage : fallbackLanguage;

const resources = {
  en: { translation: extractLocaleTree(translations, 'en') },
  bg: { translation: extractLocaleTree(translations, 'bg') },
};

i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: fallbackLanguage,
  interpolation: {
    escapeValue: false,
  },
});

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('app-language', lng);
  document.documentElement.lang = lng;
});

document.documentElement.lang = initialLanguage;

export default i18n;
