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
import FileUploader from "./FileUploader";
import { EMPTY, FIELDS, validate, sendQuoteRequest } from "./quoteForm";
import "./QuickQuote.css";


const PAGES = ["accueil", "services", "realisations", "apropos", "tarifs", "avis", "contact", "menu", "commande", "autre"];
const THEMES = ["clair", "sombre", "indifferent"];
const ECHEANCES = ["asap", "1mois", "2-3mois", "pas-presse"];
const CRENEAUX = ["matin", "apres-midi", "soir", "peu-importe"];
// Couleurs de la charte graphique : #RGB, #RRGGBB, rgb(r, g, b) ou simplement « r, g, b ». Tout est converti en #RRGGBB.
const COLOR_RE = /#(?:[0-9a-f]{6}|[0-9a-f]{3})\b|rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(?:,\s*[\d.]+\s*)?\)|\b\d{1,3}\s*[,\s]\s*\d{1,3}\s*[,\s]\s*\d{1,3}\b/gi;
const MAX_COLORS = 6;

function toHex(token) {
  if (token.startsWith("#")) {
    const h = token.slice(1);
    return "#" + (h.length === 3 ? [...h].map((c) => c + c).join("") : h).toUpperCase();
  }
  const nums = token.match(/\d{1,3}/g).slice(0, 3).map(Number);
  if (nums.some((n) => n > 255)) return null;
  return "#" + nums.map((n) => n.toString(16).padStart(2, "0")).join("").toUpperCase();
}

function parseColors(text) {
  const out = [];
  for (const m of (text || "").matchAll(COLOR_RE)) {
    const hex = toHex(m[0]);
    if (hex && !out.includes(hex)) out.push(hex);
  }
  return out.slice(0, MAX_COLORS);
}
const TOTAL_STEPS = 5;
const MAX_PLUS_PAGES = 5;
const MAX_OTHER_PAGES = 5;
const MAX_MENU_FILES = 3;
const TYPES = ["vitrine", "vitrine-plus", "indecis"];

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
    pack: "", pages: [], autres: [""], theme: "", couleurs: "", police: "", echeance: "", creneau: "",
  });
  const [menuFiles, setMenuFiles] = useState([]);
  const [logoFiles, setLogoFiles] = useState([]);
  const headingRef = useRef(null);
  const { t } = useTranslation();
  const { lang = "fr" } = useParams();

  // Quand la demande part du hero (HeroQuote), ce formulaire reprend à l'étape 2 sans déplacer la page
  const startedFromHero = useRef(false);
  useEffect(() => {
    const onStarted = (e) => {
      const { form: sent, token: sentToken } = e.detail || {};
      if (!sentToken) return;
      startedFromHero.current = true;
      setForm({ ...EMPTY, ...sent });
      setToken(sentToken);
      setErrors({});
      setStatus(null);
      setStep(2);
    };
    window.addEventListener("quote:started", onStarted);
    return () => window.removeEventListener("quote:started", onStarted);
  }, []);

  // À chaque changement d'étape, le focus va sur le titre pour qu'il soit annoncé
  useEffect(() => {
    if (step > 1 && !startedFromHero.current) headingRef.current?.focus();
    startedFromHero.current = false;
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
      const res = await sendQuoteRequest(form);
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
      const autres = brief.autres.map((x) => x.trim().replace(/,/g, " ")).filter(Boolean);
      if (brief.pages.includes("autre") && autres.length) p.pagesAutre = autres.join(", ");
      return p;
    }
    if (n === 4) {
      const p = {};
      if (brief.theme) p.theme = brief.theme;
      if (colors.length) p.couleurs = colors.join(", ");
      if (brief.police.trim()) p.police = brief.police.trim();
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
    if (save && step === 4 && colorsInvalid) {
      document.getElementById("quote-colors")?.focus();
      return;
    }
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

  const colors = parseColors(brief.couleurs);
  const colorsInvalid = brief.couleurs.trim() !== "" && colors.length === 0;
  const checkedPages = brief.pages.filter((p) => p !== "autre").length;
  const pageCount = checkedPages + (brief.pages.includes("autre") ? brief.autres.length : 0);
  const atPageLimit = brief.pack === "vitrine-plus" && pageCount >= MAX_PLUS_PAGES;
  const canAddOther = brief.autres.length < MAX_OTHER_PAGES && !atPageLimit;
  const hasMenu = brief.pages.includes("menu") || brief.pages.includes("commande");

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
                <input {...fieldProps("email")} type="email" autoComplete="email" maxLength={254} required
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
                <fieldset className="quote-choices quote-others">
                  <legend>{t("quote.page_other_label")}</legend>
                  {brief.autres.map((value, i) => (
                    <div key={i} className="quote-other-row">
                      <input type="text" maxLength={50} value={value}
                        id={`quote-pages-autre-${i}`}
                        aria-label={t("quote.page_other_item", { n: i + 1 })}
                        placeholder={i === 0 ? t("quote.page_other_placeholder") : ""}
                        onChange={(e) => setBrief((b) => ({ ...b, autres: b.autres.map((x, j) => (j === i ? e.target.value : x)) }))} />
                      {brief.autres.length > 1 && (
                        <button type="button" className="quote-icon-btn" aria-label={t("quote.page_remove", { n: i + 1 })}
                          onClick={() => setBrief((b) => ({ ...b, autres: b.autres.filter((_, j) => j !== i) }))}>×</button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="quote-link quote-add" disabled={!canAddOther}
                    onClick={() => setBrief((b) => ({ ...b, autres: [...b.autres, ""] }))}>
                    + {t("quote.page_add")}
                  </button>
                  {brief.pack === "vitrine-plus" && <p className="quote-hint">{t("quote.page_other_plus")}</p>}
                </fieldset>
              )}
              {hasMenu && token && (
                <FileUploader token={token} kind="menu" max={MAX_MENU_FILES} files={menuFiles} onChange={setMenuFiles}
                  titleKey="quote.menu_upload_title" hintKey="quote.menu_upload_hint" />
              )}
              {actions(false)}
            </div>
          )}

          {step === 4 && (
            <div className="quote-step">
              {heading("quote.step3_title")}
              {radioGroup(t("quote.theme_label"), "theme", THEMES, brief.theme,
                (v) => setBrief((b) => ({ ...b, theme: v })), (o) => t(`quote.theme_${o}`))}
              {token && (
                <FileUploader token={token} kind="logo" max={1} files={logoFiles} onChange={setLogoFiles}
                  titleKey="quote.logo_upload_title" hintKey="quote.logo_upload_hint" />
              )}
              <div className="quote-field">
                <label htmlFor="quote-colors">{t("quote.charte_colors_label")}</label>
                <input id="quote-colors" type="text" maxLength={150} value={brief.couleurs}
                  placeholder="#C9A24B, rgb(30, 10, 16)"
                  aria-invalid={colorsInvalid ? "true" : undefined}
                  aria-describedby={colorsInvalid ? "quote-colors-error" : "quote-colors-hint"}
                  onChange={(e) => setBrief((b) => ({ ...b, couleurs: e.target.value }))} />
                <p id="quote-colors-hint" className="quote-hint">{t("quote.charte_colors_hint")}</p>
                {colors.length > 0 && (
                  <ul className="quote-color-chips" aria-label={t("quote.charte_colors_found")}>
                    {colors.map((c) => (
                      <li key={c}><i style={{ background: c }} aria-hidden="true" />{c}</li>
                    ))}
                  </ul>
                )}
                {colorsInvalid && <p id="quote-colors-error" className="field-error" role="alert">{t("quote.charte_colors_error")}</p>}
              </div>
              <div className="quote-field">
                <label htmlFor="quote-police">{t("quote.police_label")}</label>
                <input id="quote-police" type="text" maxLength={80} value={brief.police} aria-describedby="quote-police-hint"
                  placeholder={t("quote.police_placeholder")}
                  onChange={(e) => setBrief((b) => ({ ...b, police: e.target.value }))} />
                <p id="quote-police-hint" className="quote-hint">{t("quote.police_hint")}</p>
              </div>
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
