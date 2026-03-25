import { useState } from "react";
import Layout from "../../components/Layout/Layout";
import { apiFetch } from "../../utils/api";
import "./ContactPage.css";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await apiFetch("/contact", {
        method: "POST",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus({ ok: true, msg: "Message envoyé\u00a0! Je vous réponds rapidement." });
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setStatus({ ok: false, msg: err.message || "Erreur lors de l'envoi." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="contact-page">
        <div className="contact-page-header">
          <h1>Travaillons ensemble</h1>
          <p className="contact-intro">
            Un projet web, une question ou simplement envie d'échanger&nbsp;? Je suis disponible.
          </p>
        </div>

        <div className="contact-page-body">
          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="name">Nom</label>
              <input
                id="name" name="name" type="text" autoComplete="name"
                value={form.name} onChange={handleChange}
                placeholder="Votre nom" required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email" name="email" type="email" autoComplete="email"
                value={form.email} onChange={handleChange}
                placeholder="votre@email.com" required
              />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message" name="message" rows={6}
                value={form.message} onChange={handleChange}
                placeholder="Décrivez votre projet ou votre demande..." required
              />
            </div>
            {status && (
              <p className={`form-status ${status.ok ? "ok" : "err"}`}>{status.msg}</p>
            )}
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Envoi en cours..." : <><i className="fa-solid fa-paper-plane" aria-hidden="true" /> Envoyer le message</>}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
