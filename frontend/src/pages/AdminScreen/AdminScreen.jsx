import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/useAuth";
import AdminMessages from "./tabs/AdminMessages";
import AdminProjects from "./tabs/AdminProjects";
import AdminSkills from "./tabs/AdminSkills";
import AdminSections from "./tabs/AdminSections";
import "./AdminScreen.css";

const TABS = [
  { id: "messages", label: "Messages", icon: "fa-envelope" },
  { id: "projects", label: "Projets", icon: "fa-code" },
  { id: "skills", label: "Compétences", icon: "fa-star" },
  { id: "sections", label: "Sections", icon: "fa-image" },
];

export default function AdminScreen() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("messages");

  if (!user) {
    navigate("/connexion", { replace: true });
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="admin">
      <header className="admin-header">
        <a href="/" className="admin-logo">Mounir Mansi</a>
        <div className="admin-header-right">
          <a href="/" className="admin-link-site">← Voir le site</a>
          <button className="admin-logout" onClick={handleLogout}>Déconnexion</button>
        </div>
      </header>

      <div className="admin-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`admin-tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            <i className={`fa-solid ${t.icon}`} /> {t.label}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {tab === "messages" && <AdminMessages />}
        {tab === "projects" && <AdminProjects />}
        {tab === "skills" && <AdminSkills />}
        {tab === "sections" && <AdminSections />}
      </div>
    </div>
  );
}
