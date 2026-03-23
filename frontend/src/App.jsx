import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import AboutPage from "./pages/AboutPage/AboutPage";
import SkillsPage from "./pages/SkillsPage/SkillsPage";
import ProjectsPage from "./pages/ProjectsPage/ProjectsPage";
import ContactPage from "./pages/ContactPage/ContactPage";
import ConnexionScreen from "./pages/ConnexionScreen/ConnexionScreen";
import AdminScreen from "./pages/AdminScreen/AdminScreen";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/a-propos" element={<AboutPage />} />
      <Route path="/competences" element={<SkillsPage />} />
      <Route path="/projets" element={<ProjectsPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/connexion" element={<ConnexionScreen />} />
      <Route path="/admin" element={<AdminScreen />} />
    </Routes>
  );
}
