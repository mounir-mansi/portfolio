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
const FIELDS = ["name", "company", "phone", "activity", "email"];
const EMPTY = { name: "", company: "", phone: "", activity: "", email: "" };

const PAGES = ["accueil", "services", "realisations", "apropos", "tarifs", "avis", "contact", "menu", "commande", "autre"];
const THEMES = ["clair", "sombre", "indifferent"];
const ECHEANCES = ["asap", "1mois", "2-3mois", "pas-presse"];
const CRENEAUX = ["matin", "apres-midi", "soir", "peu-importe"];
// Le nom français est celui qui part dans l'email de brief
const PALETTES = [
  { id: "bleu-or", fr: "Bleu nuit et or", a: "#14213d", b: "#d4a937" },
  { id: "vert-creme", fr: "Vert et crème", a: "#2f5d3a", b: "#f3ecd6" },
  { id: "rouge-noir", fr: "Rouge et noir", a: "#c0392b", b: "#161616" },
  { id: "rose-blanc", fr: "Rose et blanc", a: "#e58fa8", b: "#fbf4f4" },
  { id: "orange-brun", fr: "Orange et brun", a: "#e07a2f", b: "#4a2e1c" },
  { id: "violet-gris", fr: "Violet et gris", a: "#6b4aa3", b: "#b8b8c2" },
  { id: "bleu-blanc", fr: "Bleu et blanc", a: "#2d6cdf", b: "#f5f8ff" },
  { id: "noir-blanc", fr: "Noir et blanc", a: "#111111", b: "#f5f5f5" },
];
const TOTAL_STEPS = 5;
const MAX_PLUS_PAGES = 5;
const TYPES = ["vitrine", "vitrine-plus", "indecis"];

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "contact.error_name";
  if (!form.company.trim()) errors.company = "quote.error_company";
  if (!PHONE_REGEX.test(form.phone.trim().replace(PHONE_SEPARATORS, ""))) errors.phone = "quote.error_phone";
  if (!form.activity.trim()) errors.activity = "quote.error_activity";
  if (form.email.trim() && !EMAIL_REGEX.test(form.email.trim())) errors.email = "contact.error_email";
  return errors;
}

// Section « Recevez la maquette gratuite » (ancre #devis sur l'accueil).
// Étape 1 : la demande est envoyée tout de suite. Étapes 2 à 4 : brief facultatif qui complète la demande.
export default function QuickQuote() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [brief, setBrief] = useState({
    pack: "", pages: [], pagesAutre: "", theme: "", palette: "", couleursAutre: "", aLogo: null, echeance: "", creneau: "",
  });
  const headingRef = useRef(null);
  const { t } = useTranslation();
  const { lang = "fr" } = useParams();

  // À chaque changement d'étape, le focus va sur le titre pour qu'il soit annoncé
  useEffect(() => {
    if (step > 1) headingRef.current?.focus();
  }, [step]);

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

  // Étape 1 : envoie la demande. Elle est enregistrée même si le visiteur s'arrête ici.
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
          company: form.company.trim(),
          phone: form.phone.trim(),
          activity: form.activity.trim(),
          email: form.email.trim(),
        }),
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setToken(data.token || null);
        setErrors({});
        setStep(2);
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

  // Champs envoyés pour chaque étape (uniquement ce qui a été rempli)
  const stepPayload = (n) => {
    if (n === 2) return brief.pack ? { pack: brief.pack } : {};
    if (n === 3) {
      const p = {};
      if (brief.pages.length) p.pages = brief.pages;
      if (brief.pages.includes("autre") && brief.pagesAutre.trim()) p.pagesAutre = brief.pagesAutre.trim();
      return p;
    }
    if (n === 4) {
      const p = {};
      if (brief.theme) p.theme = brief.theme;
      const palette = PALETTES.find((x) => x.id === brief.palette);
      const colors = [palette?.fr, brief.couleursAutre.trim()].filter(Boolean).join(", ");
      if (colors) p.couleurs = colors;
      if (brief.aLogo !== null) p.aLogo = brief.aLogo;
      return p;
    }
    const p = {};
    if (brief.echeance) p.echeance = brief.echeance;
    if (brief.creneau) p.creneau = brief.creneau;
    return p;
  };

  // Enregistre l'étape courante (si elle contient quelque chose) puis avance.
  // `final` : termine le brief, avec les réponses de l'étape courante.
  const advance = async ({ save, final }) => {
    if (loading) return;
    const payload = save ? stepPayload(step) : {};
    const hasData = Object.keys(payload).length > 0;
    if (token && (hasData || final)) {
      setLoading(true);
      try {
        const res = await apiFetch("/contact/brief", {
          method: "PATCH",
          body: JSON.stringify({ token, ...payload, ...(final ? { final: true } : {}) }),
        });
        if (!res.ok) throw new Error("brief");
        setStatus(null);
      } catch {
        // La demande de l'étape 1 est déjà enregistrée : on termine proprement
        setStatus({ ok: false, msg: t("quote.brief_error") });
        setStep(TOTAL_STEPS + 1);
        setLoading(false);
        return;
      }
      setLoading(false);
    }
    setStep(final || step >= TOTAL_STEPS ? TOTAL_STEPS + 1 : step + 1);
  };

  const atPageLimit = brief.pack === "vitrine-plus" && brief.pages.length >= MAX_PLUS_PAGES;

  const toggleListItem = (key, value) =>
    setBrief((b) => ({
      ...b,
      [key]: b[key].includes(value) ? b[key].filter((x) => x !== value) : [...b[key], value],
    }));

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

  const radioGroup = (legend, name, options, value, onChange, labelOf) => (
    <fieldset className="quote-choices">
      <legend>{legend}</legend>
      <div className="quote-choice-row">
        {options.map((o) => (
          <label key={o} className={`quote-choice ${value === o ? "is-on" : ""}`}>
            <input type="radio" name={name} value={o} checked={value === o} onChange={() => onChange(o)} />
            <span>{labelOf(o)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );

  const actions = (isLast) => (
    <div className="quote-actions">
      <button type="button" className="btn-primary quote-submit" disabled={loading}
        onClick={() => advance({ save: true, final: isLast })}>
        {loading ? t("contact.sending") : isLast ? t("quote.finish") : t("quote.next")}
      </button>
      <div className="quote-links">
        <button type="button" className="quote-link" disabled={loading} onClick={() => advance({ save: false })}>
          {t("quote.skip")}
        </button>
        {!isLast && (
          <button type="button" className="quote-link" disabled={loading}
            onClick={() => advance({ save: true, final: true })}>
            {t("quote.finish")}
          </button>
        )}
      </div>
    </div>
  );

  const progress = step >= 2 && step <= TOTAL_STEPS && (
    <div className="quote-progress">
      <p>{t("quote.progress", { current: step, total: TOTAL_STEPS })}</p>
      <div className="quote-bar" aria-hidden="true"><span style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} /></div>
    </div>
  );

  const heading = (key) => (
    <h3 ref={headingRef} tabIndex={-1} className="quote-step-title">{t(key)}</h3>
  );

  return (
    <section id="devis" className="block quote" aria-labelledby="quote-title">
      <div className="container quote-grid">
        <div className="quote-intro reveal">
          <h2 id="quote-title" className="block-title">{t("quote.title")}</h2>
          {Array.isArray(t("quote.terms", { returnObjects: true })) && (
            <ul className="quote-terms">
              {t("quote.terms", { returnObjects: true }).map((term) => <li key={term}>{term}</li>)}
            </ul>
          )}
          <p className="quote-offer">{t("quote.offer")}</p>
        </div>

        <div className="quote-form reveal" style={{ "--delay": "120ms" }}>
          {progress}
          <div aria-live="polite" className="quote-live">
            {step === 2 && <p className="form-status ok">{t("quote.received")}</p>}
            {status && <p className={`form-status ${status.ok ? "ok" : "err"}`}>{status.msg}</p>}
          </div>

          {step === 1 && (
            <form className="quote-step" onSubmit={handleSubmit} noValidate>
              <div className="quote-field">
                <label htmlFor="quote-name">{t("quote.name")}</label>
                <input {...fieldProps("name")} type="text" autoComplete="name" maxLength={100} required
                  placeholder={t("contact.name_placeholder")} />
                {fieldError("name")}
              </div>
              <div className="quote-field">
                <label htmlFor="quote-company">{t("quote.company")}</label>
                <input {...fieldProps("company")} type="text" autoComplete="organization" maxLength={100} required
                  placeholder={t("quote.company_placeholder")} />
                {fieldError("company")}
              </div>
              <div className="quote-field">
                <label htmlFor="quote-phone">{t("quote.phone")}</label>
                <input {...fieldProps("phone")} type="tel" inputMode="tel" autoComplete="tel" maxLength={30} required
                  placeholder="06 12 34 56 78" />
                {fieldError("phone")}
              </div>
              <div className="quote-field">
                <label htmlFor="quote-activity">{t("quote.activity")}</label>
                <input {...fieldProps("activity")} type="text" autoComplete="off" maxLength={100} required
                  placeholder={t("quote.activity_placeholder")} />
                {fieldError("activity")}
              </div>
              <div className="quote-field">
                <label htmlFor="quote-email">{t("quote.email")}</label>
                <input {...fieldProps("email")} type="email" autoComplete="email" maxLength={254}
                  placeholder={t("contact.email_placeholder")} />
                {fieldError("email")}
              </div>
              <button type="submit" className="btn-primary quote-submit" disabled={loading}>
                {loading ? t("contact.sending") : t("quote.submit")}
              </button>
              <p className="quote-note">
                {t("quote.note")}{" "}
                <Link to={`/${lang}/confidentialite`}>{t("legal.privacy")}</Link>
              </p>
            </form>
          )}

          {step === 2 && (
            <div className="quote-step">
              {heading("quote.type_title")}
              <p className="quote-hint">{t("quote.type_hint")}</p>
              <fieldset className="quote-types">
                <legend className="sr-only">{t("quote.type_title")}</legend>
                {TYPES.map((ty) => (
                  <label key={ty} className={`quote-type ${brief.pack === ty ? "is-on" : ""}`}>
                    <input type="radio" name="pack" value={ty} checked={brief.pack === ty}
                      onChange={() => setBrief((b) => ({ ...b, pack: ty, pages: ty === "vitrine-plus" ? b.pages.slice(0, MAX_PLUS_PAGES) : b.pages }))} />
                    <strong>{t(`quote.type_${ty}`)}</strong>
                    <span>{t(`quote.type_${ty}_desc`)}</span>
                  </label>
                ))}
              </fieldset>
              {actions(false)}
            </div>
          )}

          {step === 3 && (
            <div className="quote-step">
              {heading(brief.pack === "vitrine" ? "quote.sections_title" : brief.pack === "vitrine-plus" ? "quote.step2_title" : "quote.contents_title")}
              <p className="quote-hint">
                {brief.pack === "vitrine" ? t("quote.sections_hint") : brief.pack === "vitrine-plus" ? t("quote.pages_hint") : t("quote.step2_hint")}
              </p>
              <div className="quote-checks">
                {PAGES.map((p) => (
                  <label key={p} className={`quote-choice ${brief.pages.includes(p) ? "is-on" : ""}`}>
                    <input type="checkbox" checked={brief.pages.includes(p)} onChange={() => toggleListItem("pages", p)}
                      disabled={atPageLimit && !brief.pages.includes(p)} />
                    <span>{p === "accueil" && brief.pack === "vitrine" ? t("quote.section_accueil") : t(`quote.page_${p}`)}</span>
                  </label>
                ))}
              </div>
              {brief.pages.includes("autre") && (
                <div className="quote-field">
                  <label htmlFor="quote-pages-autre">{t("quote.page_other_label")}</label>
                  <input id="quote-pages-autre" type="text" maxLength={300} value={brief.pagesAutre}
                    placeholder={t("quote.page_other_placeholder")}
                    aria-describedby={brief.pack === "vitrine-plus" ? "quote-pages-autre-hint" : undefined}
                    onChange={(e) => setBrief((b) => ({ ...b, pagesAutre: e.target.value }))} />
                  {brief.pack === "vitrine-plus" && (
                    <p id="quote-pages-autre-hint" className="quote-hint">{t("quote.page_other_plus")}</p>
                  )}
                </div>
              )}
              {actions(false)}
            </div>
          )}

          {step === 4 && (
            <div className="quote-step">
              {heading("quote.step3_title")}
              {radioGroup(t("quote.theme_label"), "theme", THEMES, brief.theme,
                (v) => setBrief((b) => ({ ...b, theme: v })), (o) => t(`quote.theme_${o}`))}
              <fieldset className="quote-choices">
                <legend>{t("quote.colors_label")}</legend>
                <div className="quote-palettes">
                  {PALETTES.map((p) => (
                    <label key={p.id} className={`quote-palette ${brief.palette === p.id ? "is-on" : ""}`}>
                      <input type="radio" name="palette" value={p.id} checked={brief.palette === p.id}
                        onChange={() => setBrief((b) => ({ ...b, palette: b.palette === p.id ? "" : p.id }))}
                        onClick={() => brief.palette === p.id && setBrief((b) => ({ ...b, palette: "" }))} />
                      <span className="quote-swatch" aria-hidden="true"
                        style={{ background: `linear-gradient(135deg, ${p.a} 50%, ${p.b} 50%)` }} />
                      <span>{t(`quote.palette_${p.id}`)}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="quote-field">
                <label htmlFor="quote-colors-autre">{t("quote.colors_other_label")}</label>
                <input id="quote-colors-autre" type="text" maxLength={150} value={brief.couleursAutre}
                  onChange={(e) => setBrief((b) => ({ ...b, couleursAutre: e.target.value }))} />
              </div>
              {radioGroup(t("quote.logo_label"), "logo", ["yes", "no"],
                brief.aLogo === null ? "" : brief.aLogo ? "yes" : "no",
                (v) => setBrief((b) => ({ ...b, aLogo: v === "yes" })), (o) => t(`quote.${o}`))}
              {actions(false)}
            </div>
          )}

          {step === 5 && (
            <div className="quote-step">
              {heading("quote.step4_title")}
              {radioGroup(t("quote.echeance_label"), "echeance", ECHEANCES, brief.echeance,
                (v) => setBrief((b) => ({ ...b, echeance: v })), (o) => t(`quote.echeance_${o}`))}
              {radioGroup(t("quote.creneau_label"), "creneau", CRENEAUX, brief.creneau,
                (v) => setBrief((b) => ({ ...b, creneau: v })), (o) => t(`quote.creneau_${o}`))}
              {actions(true)}
            </div>
          )}

          {step > TOTAL_STEPS && (
            <div className="quote-step quote-done">
              {heading("quote.done_title")}
              <p className="quote-hint">{t("quote.done_text")}</p>
            </div>
          )}
        </div>

        <div className="quote-direct reveal">
          <p className="quote-direct-lead">{t("contact.alt_lead")}</p>
          <ul className="quote-direct-list">
            <li>
              <span>{t("contact.alt_phone")}</span>
              <a href={`tel:${CONTACT_PHONE_HREF}`}>{CONTACT_PHONE_DISPLAY}</a>
            </li>
            <li>
              <span>WhatsApp</span>
              <a href={CONTACT_WHATSAPP_HREF} target="_blank" rel="noopener noreferrer">{t("quote.whatsapp")}</a>
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
