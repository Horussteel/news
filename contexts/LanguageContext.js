import { createContext, useContext, useState, useEffect } from 'react';

// Translation files
import en from '../locales/en.json';
import ro from '../locales/ro.json';

const translations = {
  en,
  ro
};

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const useTranslation = () => {
  const { language } = useLanguage();
  
  const t = (key, fallback = key) => {
    try {
      const keys = key.split('.');
      let translation = translations[language];
      
      for (const k of keys) {
        if (translation && typeof translation === 'object' && k in translation) {
          translation = translation[k];
        } else {
          // Fallback to English if key not found in current language
          translation = translations.en;
          for (const fallbackKey of keys) {
            if (translation && typeof translation === 'object' && fallbackKey in translation) {
              translation = translation[fallbackKey];
            } else {
              return fallback; // Return fallback key if not found anywhere
            }
          }
        }
      }
      
      return translation || fallback;
    } catch (error) {
      console.warn(`Translation key "${key}" not found`);
      return fallback;
    }
  };

  return { t, language };
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    // Load saved language preference from localStorage
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') || 'en';
      setLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', newLanguage);
    }
  };

  const value = {
    language,
    changeLanguage,
    availableLanguages: {
      en: 'English',
      ro: 'Română'
    }
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
