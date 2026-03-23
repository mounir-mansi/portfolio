import { useEffect, useState } from "react";
import { apiFetch } from "../../../utils/api";
import "./AdminTab.css";

const SLOTS = [
  { key: "hero", label: "Hero (bannière d'accueil)" },
  { key: "about", label: "À propos (photo)" },
];

export default function AdminSections() {
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null);
  const [texts, setTexts] = useState({});

  useEffect(() => {
    apiFetch("/api/sections")
      .then((r) => r.json())
      .then((data) => {
        setSections(data);
        const t = {};
        Object.entries(data).forEach(([k, v]) => { t[k] = v.text || ""; });
        setTexts(t);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async (slot, file, text) => {
    setUploading(slot);
    try {
      const fd = new FormData();
      if (file) fd.append("image", file);
      if (text !== undefined) fd.append("text", text);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/sections/${slot}`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setSections((s) => ({ ...s, [slot]: { imageUrl: updated.imageUrl, text: updated.text } }));
    } catch {
      alert("Erreur lors de l'upload");
    } finally {
      setUploading(null);
    }
  };

  if (loading) return <p className="tab-loading">Chargement...</p>;

  return (
    <div className="admin-tab-content">
      <div className="tab-header">
        <h2>Sections du site</h2>
      </div>

      <div className="sections-admin-grid">
        {SLOTS.map(({ key, label }) => (
          <div key={key} className="section-admin-card">
            <h3>{label}</h3>
            {sections[key]?.imageUrl ? (
              <img src={sections[key].imageUrl} alt={label} className="section-preview" />
            ) : (
              <div className="section-placeholder">
                <i className="fa-solid fa-image" />
                <span>Aucune image</span>
              </div>
            )}
            {key === "about" && (
              <div className="form-group" style={{ marginTop: "0.8em" }}>
                <label>Texte de présentation</label>
                <textarea
                  rows={4}
                  value={texts[key] || ""}
                  onChange={(e) => setTexts((t) => ({ ...t, [key]: e.target.value }))}
                  placeholder="Votre texte..."
                />
              </div>
            )}
            <label className="upload-label">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: "none" }}
                onChange={(e) => handleUpload(key, e.target.files[0], texts[key])}
              />
              <span className={`btn-primary-sm ${uploading === key ? "disabled" : ""}`}>
                <i className="fa-solid fa-upload" />
                {uploading === key ? "Upload..." : sections[key]?.imageUrl ? "Changer l'image" : "Charger une image"}
              </span>
            </label>
            {key === "about" && (
              <button
                className="btn-sm btn-accent"
                style={{ marginTop: "0.5em" }}
                onClick={() => handleUpload(key, null, texts[key])}
                disabled={uploading === key}
              >
                Sauvegarder le texte
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
