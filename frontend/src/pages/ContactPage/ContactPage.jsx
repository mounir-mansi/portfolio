import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Layout from "../../components/Layout/Layout";
import { apiFetch } from "../../utils/api";
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY, CONTACT_PHONE_HREF } from "../../utils/contactInfo";
import usePageTitle from "../../utils/usePageTitle";
import "./ContactPage.css";

// Mêmes règles que le backend (contactController.js)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME = 100;
const MAX_MESSAGE = 2000;
const COUNTER_FROM = 1800;
const DRAFT_KEY = "contact-draft";
const EMPTY = { name: "", email: "", message: "" };
const FIELDS = ["name", "email", "message"];

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "error_name";
  if (!EMAIL_REGEX.test(form.email.trim())) errors.email = "error_email";
  if (!form.message.trim()) errors.message = "error_message";
  return errors;
}

function loadDraft() {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

function saveDraft(form) {
  try {
    if (FIELDS.some((f) => form[f])) sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    else sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // stockage indisponible : le brouillon n'est simplement pas conservé
  }
}

export default function ContactPage() {
  const [form, setForm] = useState(loadDraft);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const statusRef = useRef(null);
  const { t } = useTranslation();
  const { lang = "fr" } = useParams();
  usePageTitle(t("meta.contact"));

  useEffect(() => { saveDraft(form); }, [form]);

  // Déplace le focus sur le message de résultat pour qu'il soit annoncé
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
      document.getElementById(first)?.focus();
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      const res = await apiFetch("/contact", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
        }),
      });
      if (res.ok) {
        setForm(EMPTY);
        setErrors({});
        setStatus({ ok: true, msg: t("contact.success") });
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
    id: name,
    name,
    value: form[name],
    onChange: handleChange,
    onBlur: handleBlur,
    required: true,
    "aria-invalid": errors[name] ? "true" : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });

  const fieldError = (name) =>
    errors[name] && (
      <p id={`${name}-error`} className="field-error">{t(`contact.${errors[name]}`)}</p>
    );

  return (
    <Layout hideFooterCta>
      <header className="page-head container">
        <h1 className="page-title">{t("contact.title")}</h1>
        <p className="page-intro">{t("contact.intro")}</p>
      </header>

      <div className="page-body container contact-layout">
        <form className="contact-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">{t("contact.name")}</label>
            <input
              {...fieldProps("name")} type="text" autoComplete="name" maxLength={MAX_NAME}
              placeholder={t("contact.name_placeholder")}
            />
            {fieldError("name")}
          </div>
          <div className="form-group">
            <label htmlFor="email">{t("contact.email")}</label>
            <input
              {...fieldProps("email")} type="email" autoComplete="email"
              placeholder={t("contact.email_placeholder")}
            />
            {fieldError("email")}
          </div>
          <div className="form-group">
            <label htmlFor="message">{t("contact.message")}</label>
            <textarea
              {...fieldProps("message")} rows={6} maxLength={MAX_MESSAGE}
              placeholder={t("contact.message_placeholder")}
            />
            {fieldError("message")}
            {form.message.length >= COUNTER_FROM && (
              <p className="field-hint">{form.message.length}/{MAX_MESSAGE}</p>
            )}
          </div>

          <div ref={statusRef} tabIndex={-1} role="status" aria-live="polite" className="form-status-box">
            {status && (
              <p className={`form-status ${status.ok ? "ok" : "err"}`}>{status.msg}</p>
            )}
          </div>

          <button type="submit" className="btn-primary contact-submit" disabled={loading}>
            {loading ? t("contact.sending") : t("contact.submit")}
          </button>
          <p className="contact-note">
            {t("quote.note")}{" "}
            <Link to={`/${lang}/confidentialite`}>{t("legal.privacy")}</Link>
          </p>
        </form>

        <aside className="contact-alt">
          <p className="contact-alt-lead">{t("contact.alt_lead")}</p>
          <ul className="contact-alt-list">
            <li>
              <span>{t("contact.email")}</span>
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </li>
            <li>
              <span>{t("contact.alt_phone")}</span>
              <a href={`tel:${CONTACT_PHONE_HREF}`}>{CONTACT_PHONE_DISPLAY}</a>
            </li>
          </ul>
        </aside>
      </div>
    </Layout>
  );
}
