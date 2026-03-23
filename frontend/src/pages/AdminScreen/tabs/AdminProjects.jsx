import { useEffect, useState } from "react";
import { apiFetch } from "../../../utils/api";
import "./AdminTab.css";

const EMPTY = { title: "", description: "", stack: "", liveUrl: "", githubUrl: "", featured: false };

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [image, setImage] = useState(null);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = () =>
    apiFetch("/api/projects").then((r) => r.json()).then(setProjects).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const startEdit = (p) => {
    setEditId(p.id);
    setForm({ title: p.title, description: p.description, stack: p.stack.join(", "), liveUrl: p.liveUrl || "", githubUrl: p.githubUrl || "", featured: p.featured });
    setImage(null);
    setShowForm(true);
  };

  const resetForm = () => { setForm(EMPTY); setImage(null); setEditId(null); setShowForm(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append("image", image);

      const url = editId ? `/admin/projects/${editId}` : "/admin/projects";
      const method = editId ? "PUT" : "POST";

      const res = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
        method,
        credentials: "include",
        body: fd,
      });
      if (!res.ok) throw new Error();
      resetForm();
      load();
    } catch {
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
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
          <i className="fa-solid fa-plus" /> Ajouter
        </button>
      </div>

      {showForm && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <h3>{editId ? "Modifier le projet" : "Nouveau projet"}</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Titre *</label>
              <input name="title" value={form.title} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Stack (virgule séparée)</label>
              <input name="stack" value={form.stack} onChange={handleChange} placeholder="React, Node, PostgreSQL" />
            </div>
          </div>
          <div className="form-group">
            <label>Description *</label>
            <textarea name="description" rows={3} value={form.description} onChange={handleChange} required />
          </div>
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
              <label htmlFor="featured">Projet mis en avant</label>
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
          <div key={p.id} className={`project-admin-card ${p.featured ? "featured" : ""}`}>
            {p.imageUrl && <img src={p.imageUrl} alt={p.title} className="project-thumb" />}
            <div className="project-admin-body">
              <strong>{p.title}</strong>
              {p.featured && <span className="tag-featured">Mis en avant</span>}
              <p>{p.description}</p>
              {p.stack?.length > 0 && (
                <div className="stack-tags">
                  {p.stack.map((s, i) => <span key={i} className="stack-tag">{s}</span>)}
                </div>
              )}
              <div className="msg-actions">
                <button className="btn-sm btn-accent" onClick={() => startEdit(p)}>
                  <i className="fa-solid fa-pen" /> Modifier
                </button>
                <button className="btn-sm btn-danger" onClick={() => deleteProject(p.id)}>
                  <i className="fa-solid fa-trash" />
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
