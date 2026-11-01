import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import fr from "./locales/fr.json";
import en from "./locales/en.json";
import it from "./locales/it.json";
import es from "./locales/es.json";

// Langue de départ = celle de l'adresse (/en/...) : la page prérendue en anglais est reprise telle quelle, sans basculer par le français
const LANGS = ["fr", "en", "it", "es"];
const langAdresse = typeof window !== "undefined" ? window.location.pathname.split("/")[1] : null;

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    en: { translation: en },
    it: { translation: it },
    es: { translation: es },
  },
  lng: LANGS.includes(langAdresse) ? langAdresse : "fr",
  fallbackLng: "fr",
  interpolation: { escapeValue: false },
});

export default i18n;
