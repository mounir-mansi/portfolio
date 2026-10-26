import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../../utils/api";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_HREF,
  CONTACT_WHATSAPP_HREF,
} from "../../utils/contactInfo";
import "./QuickQuote.css";

// Mêmes règles que le backend (contactController.js, source "devis")
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_SEPARATORS = /[\s.\-()]/g;
const PHONE_REGEX = /^\+?\d{8,15}$/;
const EMPTY = { name: "", phone: "", activity: "", email: "" };
const FIELDS = ["name", "phone", "activity", "email"];

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "contact.error_name";
  if (!PHONE_REGEX.test(form.phone.trim().replace(PHONE_SEPARATORS, ""))) errors.phone = "quote.error_phone";
  if (!form.activity.trim()) errors.activity = "quote.error_activity";
  if (form.email.trim() && !EMAIL_REGEX.test(form.email.trim())) errors.email = "contact.error_email";
  return errors;
}

// Section « Recevez la maquette gratuite » (ancre #devis sur l'accueil)
export default function QuickQuote() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const statusRef = useRef(null);
  const { t } = useTranslation();
  const { lang = "fr" } = useParams();

  // Déplace le focus sur le résultat pour qu'il soit annoncé
  useEffect(() => {
    if (status) statusRef.current?.focus();
  }, [status]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...form, [name]: value };
    setForm(next);
    if (errors[name]) {
      const fieldError = validate(next)[name];
      setErrors((prev) => {
        const copy = { ...prev };
        if (fieldError) copy[name] = fieldError;
        else delete copy[name];
        return copy;
      });
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    const fieldError = validate(form)[name];
    setErrors((prev) => {
      const copy = { ...prev };
      if (fieldError && form[name]) copy[name] = fieldError;
      else if (!fieldError) delete copy[name];
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const found = validate(form);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setStatus(null);
      const first = FIELDS.find((f) => found[f]);
      document.getElementById(`quote-${first}`)?.focus();
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      const res = await apiFetch("/contact", {
        method: "POST",
        body: JSON.stringify({
          source: "devis",
          name: form.name.trim(),
          phone: form.phone.trim(),
          activity: form.activity.trim(),
          email: form.email.trim(),
        }),
      });
      if (res.ok) {
        setForm(EMPTY);
        setErrors({});
        setStatus({ ok: true, msg: t("quote.success") });
      } else if (res.status === 400) {
        setStatus({ ok: false, msg: t("contact.error_check") });
      } else if (res.status === 429) {
        setStatus({ ok: false, msg: t("contact.error_rate") });
      } else {
        setStatus({ ok: false, msg: t("contact.error_network", { email: CONTACT_EMAIL }) });
      }
    } catch {
      setStatus({ ok: false, msg: t("contact.error_network", { email: CONTACT_EMAIL }) });
    } finally {
      setLoading(false);
    }
  };

  const fieldProps = (name) => ({
    id: `quote-${name}`,
    name,
    value: form[name],
    onChange: handleChange,
    onBlur: handleBlur,
    "aria-invalid": errors[name] ? "true" : undefined,
    "aria-describedby": errors[name] ? `quote-${name}-error` : undefined,
  });

  const fieldError = (name) =>
    errors[name] && (
      <p id={`quote-${name}-error`} className="field-error">{t(errors[name])}</p>
    );

  return (
    <section id="devis" className="block quote" aria-labelledby="quote-title">
      <div className="container quote-grid">
        <div className="quote-intro reveal">
          <h2 id="quote-title" className="block-title">{t("quote.title")}</h2>
          <p className="quote-offer">{t("quote.offer")}</p>
        </div>

        <form className="quote-form reveal" style={{ "--delay": "120ms" }} onSubmit={handleSubmit} noValidate>
          <div className="quote-field">
            <label htmlFor="quote-name">{t("quote.name")}</label>
            <input
              {...fieldProps("name")} type="text" autoComplete="name" maxLength={100} required
              placeholder={t("contact.name_placeholder")}
            />
            {fieldError("name")}
          </div>
          <div className="quote-field">
            <label htmlFor="quote-phone">{t("quote.phone")}</label>
            <input
              {...fieldProps("phone")} type="tel" inputMode="tel" autoComplete="tel" maxLength={30} required
              placeholder="06 12 34 56 78"
            />
            {fieldError("phone")}
          </div>
          <div className="quote-field">
            <label htmlFor="quote-activity">{t("quote.activity")}</label>
            <input
              {...fieldProps("activity")} type="text" autoComplete="off" maxLength={100} required
              placeholder={t("quote.activity_placeholder")}
            />
            {fieldError("activity")}
          </div>
          <div className="quote-field">
            <label htmlFor="quote-email">{t("quote.email")}</label>
            <input
              {...fieldProps("email")} type="email" autoComplete="email" maxLength={254}
              placeholder={t("contact.email_placeholder")}
            />
            {fieldError("email")}
          </div>

          <div ref={statusRef} tabIndex={-1} role="status" aria-live="polite" className="quote-status-box">
            {status && (
              <p className={`form-status ${status.ok ? "ok" : "err"}`}>{status.msg}</p>
            )}
          </div>

          <button type="submit" className="btn-primary quote-submit" disabled={loading}>
            {loading ? t("contact.sending") : t("quote.submit")}
          </button>
          <p className="quote-note">
            {t("quote.note")}{" "}
            <Link to={`/${lang}/confidentialite`}>{t("legal.privacy")}</Link>
          </p>
        </form>

        <div className="quote-direct reveal">
          <p className="quote-direct-lead">{t("contact.alt_lead")}</p>
          <ul className="quote-direct-list">
            <li>
              <span>{t("contact.alt_phone")}</span>
              <a href={`tel:${CONTACT_PHONE_HREF}`}>{CONTACT_PHONE_DISPLAY}</a>
            </li>
            <li>
              <span>WhatsApp</span>
              <a href={CONTACT_WHATSAPP_HREF} target="_blank" rel="noopener noreferrer">{CONTACT_PHONE_DISPLAY}</a>
            </li>
            <li>
              <span>{t("contact.email")}</span>
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
