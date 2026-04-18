import { useState } from "react";
import { useTranslation } from "react-i18next";
import Layout from "../../components/Layout/Layout";
import { apiFetch } from "../../utils/api";
import "./ContactPage.css";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

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
      setStatus({ ok: true, msg: t("contact.success") });
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setStatus({ ok: false, msg: err.message || t("contact.error") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="contact-page">
        <div className="contact-page-header">
          <h1>{t("contact.title")}</h1>
          <p className="contact-intro">{t("contact.intro")}</p>
        </div>

        <div className="contact-page-body">
          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="name">{t("contact.name")}</label>
              <input
                id="name" name="name" type="text" autoComplete="name"
                value={form.name} onChange={handleChange}
                placeholder={t("contact.name_placeholder")} required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">{t("contact.email")}</label>
              <input
                id="email" name="email" type="email" autoComplete="email"
                value={form.email} onChange={handleChange}
                placeholder="votre@email.com" required
              />
            </div>
            <div className="form-group">
              <label htmlFor="message">{t("contact.message")}</label>
              <textarea
                id="message" name="message" rows={6}
                value={form.message} onChange={handleChange}
                placeholder={t("contact.message_placeholder")} required
              />
            </div>
            {status && (
              <p className={`form-status ${status.ok ? "ok" : "err"}`}>{status.msg}</p>
            )}
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading
                ? t("contact.sending")
                : <><i className="fa-solid fa-paper-plane" aria-hidden="true" /> {t("contact.submit")}</>
              }
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
