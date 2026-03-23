import { useEffect, useState } from "react";
import { apiFetch } from "../../../utils/api";
import "./AdminTab.css";

const EMPTY = { name: "", category: "", icon: "", order: 0 };

export default function AdminSkills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = () =>
    apiFetch("/api/skills").then((r) => r.json()).then(setSkills).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const startEdit = (s) => {
    setEditId(s.id);
    setForm({ name: s.name, category: s.category, icon: s.icon || "", order: s.order });
    setShowForm(true);
  };

  const resetForm = () => { setForm(EMPTY); setEditId(null); setShowForm(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editId ? `/admin/skills/${editId}` : "/admin/skills";
      const method = editId ? "PUT" : "POST";
      const res = await apiFetch(url, { method, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      resetForm();
      load();
    } catch {
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const deleteSkill = async (id) => {
    if (!confirm("Supprimer ce skill ?")) return;
    await apiFetch(`/admin/skills/${id}`, { method: "DELETE" });
    setSkills((s) => s.filter((sk) => sk.id !== id));
  };

  const categories = [...new Set(skills.map((s) => s.category))];

  if (loading) return <p className="tab-loading">Chargement...</p>;

  return (
    <div className="admin-tab-content">
      <div className="tab-header">
        <h2>Compétences</h2>
        <button className="btn-primary-sm" onClick={() => { resetForm(); setShowForm(true); }}>
          <i className="fa-solid fa-plus" /> Ajouter
        </button>
      </div>

      {showForm && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <h3>{editId ? "Modifier le skill" : "Nouveau skill"}</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Nom *</label>
              <input name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Catégorie *</label>
              <input name="category" value={form.category} onChange={handleChange} placeholder="Frontend, Backend..." required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Icône Font Awesome</label>
              <input name="icon" value={form.icon} onChange={handleChange} placeholder="fa-brands fa-react" />
            </div>
            <div className="form-group">
              <label>Ordre</label>
              <input name="order" type="number" value={form.order} onChange={handleChange} />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary-sm" disabled={saving}>{saving ? "Sauvegarde..." : "Sauvegarder"}</button>
            <button type="button" className="btn-sm" onClick={resetForm}>Annuler</button>
          </div>
        </form>
      )}

      {categories.map((cat) => (
        <div key={cat} className="skills-admin-cat">
          <h3 className="cat-title">{cat}</h3>
          <div className="skills-admin-grid">
            {skills.filter((s) => s.category === cat).map((s) => (
              <div key={s.id} className="skill-admin-card">
                <i className={s.icon || "fa-solid fa-code"} />
                <span>{s.name}</span>
                <div className="skill-actions">
                  <button className="btn-icon" onClick={() => startEdit(s)}><i className="fa-solid fa-pen" /></button>
                  <button className="btn-icon btn-icon-danger" onClick={() => deleteSkill(s.id)}><i className="fa-solid fa-trash" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {skills.length === 0 && !showForm && <p className="tab-empty">Aucun skill. Ajoutez-en un !</p>}
    </div>
  );
}
