import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import nl from './nl.json'

const deviceLang =
  typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('nl')
    ? 'nl'
    : 'en'

void i18n.use(initReactI18next).init({
  resources: {
    nl: { translation: nl },
    en: { translation: en },
  },
  lng: deviceLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
export { flattenKeys } from './flatten'
