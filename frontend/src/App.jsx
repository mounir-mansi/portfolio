import { useEffect } from "react";
import { Routes, Route, Navigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import HomePage from "./pages/HomePage/HomePage";
import AboutPage from "./pages/AboutPage/AboutPage";
import SkillsPage from "./pages/SkillsPage/SkillsPage";
import ProjectsPage from "./pages/ProjectsPage/ProjectsPage";
import ContactPage from "./pages/ContactPage/ContactPage";
import ProjectDetailPage from "./pages/ProjectDetailPage/ProjectDetailPage";
import ConnexionScreen from "./pages/ConnexionScreen/ConnexionScreen";
import AdminScreen from "./pages/AdminScreen/AdminScreen";

const LANGS = ["fr", "en", "it", "es"];

function LangRouter() {
  const { lang } = useParams();
  const { i18n } = useTranslation();
  const { pathname, hash } = useLocation();
  // Page courante sans le segment de langue : changer de langue ne remonte pas la page
  const route = pathname.split("/").slice(2).join("/");

  useEffect(() => {
    if (LANGS.includes(lang)) {
      i18n.changeLanguage(lang);
      document.documentElement.lang = lang;
    }
  }, [lang, i18n]);

  // Remonte en haut à chaque changement de page, sauf pour les liens d'ancre (#services)
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [route]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!LANGS.includes(lang)) {
    return <Navigate to="/fr" replace />;
  }

  return (
    <Routes>
      <Route index element={<HomePage />} />
      <Route path="a-propos" element={<AboutPage />} />
      <Route path="competences" element={<SkillsPage />} />
      <Route path="projets" element={<ProjectsPage />} />
      <Route path="projets/:id" element={<ProjectDetailPage />} />
      <Route path="contact" element={<ContactPage />} />
      <Route path="connexion" element={<ConnexionScreen />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/fr" replace />} />
      <Route path="/connexion" element={<ConnexionScreen />} />
      <Route path="/admin" element={<AdminScreen />} />
      <Route path="/:lang/*" element={<LangRouter />} />
    </Routes>
  );
}
