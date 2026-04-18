import { useEffect, useState } from "react";
import { apiFetch } from "../../../utils/api";
import "./AdminTab.css";

const SLOTS = [
  { key: "hero", label: "Hero (bannière d'accueil)" },
  { key: "about", label: "À propos (photo)" },
];

const LANG_TABS = [
  { code: "fr", label: "🇫🇷 FR" },
  { code: "en", label: "🇬🇧 EN" },
  { code: "it", label: "🇮🇹 IT" },
  { code: "es", label: "🇪🇸 ES" },
];

export default function AdminSections() {
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null);
  // texts[slot][lang]
  const [texts, setTexts] = useState({});
  const [activeLang, setActiveLang] = useState("fr");

  useEffect(() => {
    // Charger les données brutes (sans traduction) depuis /api/sections?lang=fr
    // On charge les 4 langues pour pré-remplir les champs
    Promise.all(
      ["fr", "en", "it", "es"].map((lang) =>
        apiFetch(`/api/sections?lang=${lang}`).then((r) => r.json()).then((d) => ({ lang, d }))
      )
    ).then((results) => {
      const t = {};
      SLOTS.forEach(({ key }) => { t[key] = {}; });
      results.forEach(({ lang, d }) => {
        SLOTS.forEach(({ key }) => {
          t[key][lang] = d[key]?.text || "";
        });
      });
      setTexts(t);
      // imageUrl depuis FR
      const frData = results.find((r) => r.lang === "fr")?.d || {};
      setSections(frData);
    }).finally(() => setLoading(false));
  }, []);

  const handleTextChange = (slot, lang, value) => {
    setTexts((t) => ({ ...t, [slot]: { ...t[slot], [lang]: value } }));
  };

  const handleUpload = async (slot, file) => {
    setUploading(slot);
    try {
      const fd = new FormData();
      if (file) fd.append("image", file);
      // Envoyer les textes de toutes les langues
      if (texts[slot]) {
        fd.append("text", texts[slot].fr || "");
        fd.append("text_en", texts[slot].en || "");
        fd.append("text_it", texts[slot].it || "");
        fd.append("text_es", texts[slot].es || "");
      }

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

  const handleSaveTexts = async (slot) => {
    setUploading(slot);
    try {
      const fd = new FormData();
      fd.append("text", texts[slot]?.fr || "");
      fd.append("text_en", texts[slot]?.en || "");
      fd.append("text_it", texts[slot]?.it || "");
      fd.append("text_es", texts[slot]?.es || "");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/sections/${slot}`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      if (!res.ok) throw new Error();
    } catch {
      alert("Erreur lors de la sauvegarde");
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
              <img src={sections[key].imageUrl} alt={label} className="section-preview" width="280" height="160" />
            ) : (
              <div className="section-placeholder">
                <i className="fa-solid fa-image" aria-hidden="true" />
                <span>Aucune image</span>
              </div>
            )}

            {key === "about" && (
              <div style={{ marginTop: "0.8em" }}>
                {/* Onglets de langue pour le texte */}
                <div className="lang-tabs" style={{ marginBottom: "0.5em" }}>
                  {LANG_TABS.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      className={`lang-tab-btn ${activeLang === l.code ? "active" : ""}`}
                      onClick={() => setActiveLang(l.code)}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
                {LANG_TABS.map((l) => (
                  <div key={l.code} className="form-group" style={{ display: activeLang === l.code ? "block" : "none" }}>
                    <label>
                      Texte de présentation <span className="label-hint">({l.label})</span>
                    </label>
                    <textarea
                      rows={4}
                      value={texts[key]?.[l.code] || ""}
                      onChange={(e) => handleTextChange(key, l.code, e.target.value)}
                      placeholder={l.code === "fr" ? "Votre texte..." : `Texte en ${l.label} (laisser vide = utilise le FR)`}
                    />
                  </div>
                ))}
                <button
                  className="btn-sm btn-accent"
                  style={{ marginTop: "0.5em" }}
                  onClick={() => handleSaveTexts(key)}
                  disabled={uploading === key}
                >
                  {uploading === key ? "Sauvegarde..." : "Sauvegarder les textes"}
                </button>
              </div>
            )}

            <label className="upload-label" style={{ marginTop: "0.8em", display: "block" }}>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: "none" }}
                onChange={(e) => handleUpload(key, e.target.files[0])}
              />
              <span className={`btn-primary-sm ${uploading === key ? "disabled" : ""}`}>
                <i className="fa-solid fa-upload" aria-hidden="true" />
                {uploading === key ? "Upload..." : sections[key]?.imageUrl ? "Changer l'image" : "Charger une image"}
              </span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
