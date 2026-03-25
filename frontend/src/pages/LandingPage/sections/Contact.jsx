import { useState } from "react";
import { apiFetch } from "../../../utils/api";
import "./Contact.css";

export default function Contact() {
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
    <section id="contact" className="contact">
      <div className="contact-wrapper">
        <div className="contact-info">
          <p className="section-tag">Contact</p>
          <h2>Travaillons ensemble</h2>
          <p className="contact-desc">
            Un projet web, une question ou simplement envie d'échanger&#x202F;? Je suis disponible.
          </p>
          <div className="contact-links">
            <a href="https://github.com/mounir-mansi" target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-github" aria-hidden="true" /> GitHub
            </a>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Nom</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Votre nom"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="votre@email.com"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              rows={5}
              value={form.message}
              onChange={handleChange}
              placeholder="Votre message..."
              required
            />
          </div>
          {status && (
            <p className={`form-status ${status.ok ? "ok" : "err"}`}>{status.msg}</p>
          )}
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Envoi..." : "Envoyer le message"}
          </button>
        </form>
      </div>
    </section>
  );
}
