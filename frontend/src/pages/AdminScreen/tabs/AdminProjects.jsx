import { useEffect, useState } from "react";
import { apiFetch } from "../../../utils/api";
import "./AdminTab.css";

const LANG_TABS = [
  { code: "fr", label: "🇫🇷 FR" },
  { code: "en", label: "🇬🇧 EN" },
  { code: "it", label: "🇮🇹 IT" },
  { code: "es", label: "🇪🇸 ES" },
];

const EMPTY = {
  title: "", description: "", longDescription: "", highlights: "",
  stack: "", liveUrl: "", githubUrl: "", featured: false, order: 0,
  title_en: "", title_it: "", title_es: "",
  description_en: "", description_it: "", description_es: "",
  longDescription_en: "", longDescription_it: "", longDescription_es: "",
  highlights_en: "", highlights_it: "", highlights_es: "",
};

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [image, setImage] = useState(null);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activeLang, setActiveLang] = useState("fr");

  const load = () =>
    apiFetch("/admin/projects").then((r) => r.json()).then(setProjects).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const startEdit = (p) => {
    setEditId(p.id);
    setForm({
      title: p.title,
      description: p.description,
      longDescription: p.longDescription || "",
      highlights: p.highlights?.join("\n") || "",
      stack: p.stack.join(", "),
      liveUrl: p.liveUrl || "",
      githubUrl: p.githubUrl || "",
      featured: p.featured,
      order: p.order,
      title_en: p.title_en || "",
      title_it: p.title_it || "",
      title_es: p.title_es || "",
      description_en: p.description_en || "",
      description_it: p.description_it || "",
      description_es: p.description_es || "",
      longDescription_en: p.longDescription_en || "",
      longDescription_it: p.longDescription_it || "",
      longDescription_es: p.longDescription_es || "",
      highlights_en: p.highlights_en?.join("\n") || "",
      highlights_it: p.highlights_it?.join("\n") || "",
      highlights_es: p.highlights_es?.join("\n") || "",
    });
    setImage(null);
    setActiveLang("fr");
    setShowForm(true);
  };

  const resetForm = () => { setForm(EMPTY); setImage(null); setEditId(null); setShowForm(false); setActiveLang("fr"); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append("image", image);

      const url = editId ? `/admin/projects/${editId}` : "/admin/projects";
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, { method, credentials: "include", body: fd });
      if (!res.ok) throw new Error();
      resetForm();
      load();
    } catch {
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const toggleVisible = async (id) => {
    const res = await apiFetch(`/admin/projects/${id}/visible`, { method: "PATCH" });
    const updated = await res.json();
    setProjects((p) => p.map((pr) => (pr.id === id ? updated : pr)));
  };

  const deleteProject = async (id) => {
    if (!confirm("Supprimer ce projet ?")) return;
    await apiFetch(`/admin/projects/${id}`, { method: "DELETE" });
    setProjects((p) => p.filter((pr) => pr.id !== id));
  };

  if (loading) return <p className="tab-loading">Chargement...</p>;

  return (
    <div className="admin-tab-content">
      <div className="tab-header">
        <h2>Projets</h2>
        <button className="btn-primary-sm" onClick={() => { resetForm(); setShowForm(true); }}>
          <i className="fa-solid fa-plus" aria-hidden="true" /> Ajouter
        </button>
      </div>

      {showForm && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <h3>{editId ? "Modifier le projet" : "Nouveau projet"}</h3>

          {/* Onglets de langue */}
          <div className="lang-tabs">
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

          {/* Champs FR */}
          {activeLang === "fr" && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Titre * <span className="label-hint">(FR)</span></label>
                  <input name="title" value={form.title} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Stack (virgule séparée)</label>
                  <input name="stack" value={form.stack} onChange={handleChange} placeholder="React, Node, PostgreSQL" />
                </div>
              </div>
              <div className="form-group">
                <label>Description courte * <span className="label-hint">(FR — affiché sur la carte)</span></label>
                <textarea name="description" rows={2} value={form.description} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Description complète <span className="label-hint">(FR — page dédiée)</span></label>
                <textarea name="longDescription" rows={5} value={form.longDescription} onChange={handleChange}
                  placeholder="Décris le projet en détail..." />
              </div>
              <div className="form-group">
                <label>Points clés <span className="label-hint">(FR — un par ligne)</span></label>
                <textarea name="highlights" rows={4} value={form.highlights} onChange={handleChange}
                  placeholder={"Authentification JWT\nDéploiement VPS\nGalerie Cloudflare R2"} />
              </div>
            </>
          )}

          {/* Champs EN */}
          {activeLang === "en" && (
            <>
              <div className="form-group">
                <label>Title <span className="label-hint">(EN — leave empty to use FR)</span></label>
                <input name="title_en" value={form.title_en} onChange={handleChange} placeholder={form.title || "Same as FR"} />
              </div>
              <div className="form-group">
                <label>Short description <span className="label-hint">(EN)</span></label>
                <textarea name="description_en" rows={2} value={form.description_en} onChange={handleChange}
                  placeholder={form.description || "Same as FR"} />
              </div>
              <div className="form-group">
                <label>Full description <span className="label-hint">(EN)</span></label>
                <textarea name="longDescription_en" rows={5} value={form.longDescription_en} onChange={handleChange}
                  placeholder={form.longDescription || "Same as FR"} />
              </div>
              <div className="form-group">
                <label>Key highlights <span className="label-hint">(EN — one per line)</span></label>
                <textarea name="highlights_en" rows={4} value={form.highlights_en} onChange={handleChange}
                  placeholder={form.highlights || "Same as FR"} />
              </div>
            </>
          )}

          {/* Champs IT */}
          {activeLang === "it" && (
            <>
              <div className="form-group">
                <label>Titolo <span className="label-hint">(IT — lascia vuoto per usare il FR)</span></label>
                <input name="title_it" value={form.title_it} onChange={handleChange} placeholder={form.title || "Come FR"} />
              </div>
              <div className="form-group">
                <label>Descrizione breve <span className="label-hint">(IT)</span></label>
                <textarea name="description_it" rows={2} value={form.description_it} onChange={handleChange}
                  placeholder={form.description || "Come FR"} />
              </div>
              <div className="form-group">
                <label>Descrizione completa <span className="label-hint">(IT)</span></label>
                <textarea name="longDescription_it" rows={5} value={form.longDescription_it} onChange={handleChange}
                  placeholder={form.longDescription || "Come FR"} />
              </div>
              <div className="form-group">
                <label>Punti chiave <span className="label-hint">(IT — uno per riga)</span></label>
                <textarea name="highlights_it" rows={4} value={form.highlights_it} onChange={handleChange}
                  placeholder={form.highlights || "Come FR"} />
              </div>
            </>
          )}

          {/* Champs ES */}
          {activeLang === "es" && (
            <>
              <div className="form-group">
                <label>Título <span className="label-hint">(ES — dejar vacío para usar el FR)</span></label>
                <input name="title_es" value={form.title_es} onChange={handleChange} placeholder={form.title || "Como FR"} />
              </div>
              <div className="form-group">
                <label>Descripción corta <span className="label-hint">(ES)</span></label>
                <textarea name="description_es" rows={2} value={form.description_es} onChange={handleChange}
                  placeholder={form.description || "Como FR"} />
              </div>
              <div className="form-group">
                <label>Descripción completa <span className="label-hint">(ES)</span></label>
                <textarea name="longDescription_es" rows={5} value={form.longDescription_es} onChange={handleChange}
                  placeholder={form.longDescription || "Como FR"} />
              </div>
              <div className="form-group">
                <label>Puntos clave <span className="label-hint">(ES — uno por línea)</span></label>
                <textarea name="highlights_es" rows={4} value={form.highlights_es} onChange={handleChange}
                  placeholder={form.highlights || "Como FR"} />
              </div>
            </>
          )}

          {/* Champs communs (toujours visibles) */}
          <div className="form-row">
            <div className="form-group">
              <label>URL Live</label>
              <input name="liveUrl" value={form.liveUrl} onChange={handleChange} type="url" />
            </div>
            <div className="form-group">
              <label>URL GitHub</label>
              <input name="githubUrl" value={form.githubUrl} onChange={handleChange} type="url" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group form-check">
              <input type="checkbox" id="featured" name="featured" checked={form.featured} onChange={handleChange} />
              <label htmlFor="featured">Mis en avant</label>
            </div>
            <div className="form-group">
              <label>Ordre</label>
              <input name="order" type="number" value={form.order} onChange={handleChange} style={{ width: "80px" }} />
            </div>
            <div className="form-group">
              <label>Image (JPEG/PNG/WebP, max 5 Mo)</label>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setImage(e.target.files[0])} />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary-sm" disabled={saving}>{saving ? "Sauvegarde..." : "Sauvegarder"}</button>
            <button type="button" className="btn-sm" onClick={resetForm}>Annuler</button>
          </div>
        </form>
      )}

      <div className="projects-admin-grid">
        {projects.map((p) => (
          <div key={p.id} className={`project-admin-card ${p.featured ? "featured" : ""} ${!p.visible ? "hidden-project" : ""}`}>
            {p.imageUrl && <img src={p.imageUrl} alt={p.title} className="project-thumb" width="120" height="90" />}
            <div className="project-admin-body">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5em", flexWrap: "wrap" }}>
                <strong>{p.title}</strong>
                {p.featured && <span className="tag-featured">Mis en avant</span>}
                {!p.visible && <span className="tag-hidden"><i className="fa-solid fa-eye-slash" aria-hidden="true" /> Masqué</span>}
                {p.longDescription && <span className="tag-detail"><i className="fa-solid fa-file-lines" aria-hidden="true" /> Détail</span>}
                {p.title_en && <span className="tag-lang">EN</span>}
                {p.title_it && <span className="tag-lang">IT</span>}
                {p.title_es && <span className="tag-lang">ES</span>}
              </div>
              <p>{p.description}</p>
              {p.stack?.length > 0 && (
                <div className="stack-tags">
                  {p.stack.map((s, i) => <span key={i} className="stack-tag">{s}</span>)}
                </div>
              )}
              <div className="msg-actions">
                <button className="btn-sm btn-accent" onClick={() => startEdit(p)}>
                  <i className="fa-solid fa-pen" aria-hidden="true" /> Modifier
                </button>
                <button className="btn-sm" onClick={() => toggleVisible(p.id)} aria-label={p.visible ? "Masquer" : "Afficher"} title={p.visible ? "Masquer du portfolio" : "Afficher sur le portfolio"}>
                  <i className={`fa-solid ${p.visible ? "fa-eye" : "fa-eye-slash"}`} aria-hidden="true" />
                </button>
                <button className="btn-sm btn-danger" onClick={() => deleteProject(p.id)} aria-label="Supprimer">
                  <i className="fa-solid fa-trash" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && !showForm && <p className="tab-empty">Aucun projet. Ajoutez-en un !</p>}
    </div>
  );
}
