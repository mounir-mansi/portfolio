import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CONTACT_EMAIL } from "../../utils/contactInfo";
import { EMPTY, validate, sendQuoteRequest } from "../QuickQuote/quoteForm";
import Honeypot from "../Honeypot/Honeypot";
import { readHoneypot } from "../Honeypot/honeypotField";
import "./HeroQuote.css";

const FIELDS = ["name", "company", "phone", "email", "activity"];

// Formulaire de l'étape 1 dans le hero (écrans larges). Il envoie la demande, puis la section #devis
// (QuickQuote) reprend à l'étape 2 grâce à l'événement « quote:started ».
export default function HeroQuote() {
  const { t } = useTranslation();
  const { lang = "fr" } = useParams();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trap = readHoneypot(e.currentTarget);
    if (loading) return;
    const found = validate(form);
    const mine = Object.keys(found).filter((k) => FIELDS.includes(k));
    if (mine.length > 0) {
      setErrors(found);
      setStatus(null);
      document.getElementById(`hero-quote-${mine[0]}`)?.focus();
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      const res = await sendQuoteRequest(form, trap);
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrors({});
        setDone(true);
        window.dispatchEvent(new CustomEvent("quote:started", { detail: { form, token: data.token || null } }));
      } else if (res.status === 400) {
        const data = await res.json().catch(() => ({}));
        setStatus(t(data.code === "LINKS" ? "contact.error_links" : "contact.error_check", { email: CONTACT_EMAIL }));
      } else if (res.status === 429) {
        setStatus(t("contact.error_rate"));
      } else {
        setStatus(t("contact.error_network", { email: CONTACT_EMAIL }));
      }
    } catch {
      setStatus(t("contact.error_network", { email: CONTACT_EMAIL }));
    } finally {
      setLoading(false);
    }
  };

  const goToBrief = () => {
    const section = document.getElementById("devis");
    section?.scrollIntoView({ behavior: "smooth" });
    section?.querySelector(".quote-step-title")?.focus({ preventScroll: true });
  };

  const field = (name, { wide, ...props }) => (
    <div className={`hero-quote-field${wide ? " is-wide" : ""}`}>
      <label htmlFor={`hero-quote-${name}`}>{t(`quote.${name}`)}</label>
      <input
        id={`hero-quote-${name}`}
        name={name}
        value={form[name]}
        onChange={handleChange}
        required
        aria-invalid={errors[name] ? "true" : undefined}
        aria-describedby={errors[name] ? `hero-quote-${name}-error` : undefined}
        {...props}
      />
      {errors[name] && <p id={`hero-quote-${name}-error`} className="field-error">{t(errors[name])}</p>}
    </div>
  );

  const terms = t("quote.terms", { returnObjects: true });

  return (
    <aside className="hero-quote reveal" style={{ "--delay": "240ms" }} aria-labelledby="hero-quote-title">
      <p id="hero-quote-title" className="hero-quote-title">{t("quote.title")}</p>
      {Array.isArray(terms) && <p className="hero-quote-terms">{terms.join(" · ")}</p>}

      {done ? (
        <div className="hero-quote-done" role="status">
          <p>{t("quote.received")}</p>
          <button type="button" className="btn-primary" onClick={goToBrief}>
            {t("home.hero_quote_continue")} <span aria-hidden="true">↓</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <Honeypot />
          <div className="hero-quote-grid">
            {field("name", { type: "text", autoComplete: "name", maxLength: 100 })}
            {field("company", { type: "text", autoComplete: "organization", maxLength: 100 })}
            {field("phone", { type: "tel", inputMode: "tel", autoComplete: "tel", maxLength: 30, placeholder: "06 12 34 56 78" })}
            {field("email", { type: "email", autoComplete: "email", maxLength: 254, placeholder: t("contact.email_placeholder") })}
            {field("activity", { type: "text", autoComplete: "off", maxLength: 100, placeholder: t("home.hero_quote_activity_ph"), wide: true })}
          </div>
          <div aria-live="polite">{status && <p className="form-status err">{status}</p>}</div>
          <button type="submit" className="btn-primary hero-quote-submit" disabled={loading}>
            {loading ? t("contact.sending") : t("quote.submit")} <span aria-hidden="true">↗</span>
          </button>
          <p className="hero-quote-note">
            {t("quote.note")} <Link to={`/${lang}/confidentialite`}>{t("legal.privacy")}</Link>
          </p>
        </form>
      )}
    </aside>
  );
}
