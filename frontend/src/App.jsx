import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import HomePage from "./pages/HomePage/HomePage";
import AboutPage from "./pages/AboutPage/AboutPage";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage";
import ProjectsPage from "./pages/ProjectsPage/ProjectsPage";
import ContactPage from "./pages/ContactPage/ContactPage";
import ProjectDetailPage from "./pages/ProjectDetailPage/ProjectDetailPage";
import MentionsLegalesPage from "./pages/LegalPages/MentionsLegalesPage";
import ConfidentialitePage from "./pages/LegalPages/ConfidentialitePage";
import CgvPage from "./pages/LegalPages/CgvPage";
import useSeoTags from "./utils/useSeoTags";

// Connexion et admin sont chargés à la demande : leurs icônes (Font Awesome) ne pèsent pas sur les pages publiques
const ConnexionScreen = lazy(() => import("./pages/ConnexionScreen/ConnexionScreen"));
const AdminScreen = lazy(() => import("./pages/AdminScreen/AdminScreen"));

const LANGS = ["fr", "en", "it", "es"];

// L'ancienne page Compétences vit désormais dans À propos
function SkillsRedirect() {
  const { lang } = useParams();
  return <Navigate to={`/${lang}/a-propos#stack`} replace />;
}

function LangRouter() {
  const { lang } = useParams();
  const { i18n } = useTranslation();
  const { pathname, hash } = useLocation();
  // Page courante sans le segment de langue : changer de langue ne remonte pas la page
  const route = pathname.split("/").slice(2).join("/");
  useSeoTags(lang, route);

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
      <Route path="competences" element={<SkillsRedirect />} />
      <Route path="projets" element={<ProjectsPage />} />
      <Route path="projets/:id" element={<ProjectDetailPage />} />
      <Route path="contact" element={<ContactPage />} />
      <Route path="mentions-legales" element={<MentionsLegalesPage />} />
      <Route path="confidentialite" element={<ConfidentialitePage />} />
      <Route path="cgv" element={<CgvPage />} />
      <Route path="connexion" element={<ConnexionScreen />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Navigate to="/fr" replace />} />
        <Route path="/connexion" element={<ConnexionScreen />} />
        <Route path="/admin" element={<AdminScreen />} />
        <Route path="/:lang/*" element={<LangRouter />} />
      </Routes>
    </Suspense>
  );
}
