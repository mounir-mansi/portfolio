import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import { apiFetch } from "../../utils/api";
import Honeypot from "../../components/Honeypot/Honeypot";
import { HONEYPOT_FIELD, readHoneypot } from "../../components/Honeypot/honeypotField";
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_HREF } from "../../utils/contactInfo";
import usePageTitle from "../../utils/usePageTitle";
import { PROPOSITIONS, AJOUTS, TOUTES, PAR_DEFAUT } from "../../data/propositions";
import "../ContactPage/ContactPage.css";
import "./PropositionPage.css";

// Mêmes limites que le backend (contactController.js)
const MAX_NAME = 100;
const MAX_MESSAGE = 2000;
const PHONE_REGEX = /^\+?\d{8,15}$/;
const CODE_REGEX = /^[a-z0-9]{6,12}$/;

// Page non destinée à Google : on la marque « noindex » le temps de la visite
function useNoindex() {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);
}

// Case à cocher en carte. compact : sans la ligne d'explication (liste des ajouts), le détail reste en infobulle.
function Choice({ id, info, checked, onChange, compact = false }) {
  return (
    <label className={`prop-choice${compact ? " prop-choice--compact" : ""}`} title={compact ? info.detail : undefined}>
      <input type="checkbox" checked={checked} onChange={() => onChange(id)} />
      <span className="prop-box" aria-hidden="true" />
      <span className="prop-text">
        <span className="prop-label">{info.label}</span>
        {!compact && <span className="prop-detail">{info.detail}</span>}
      </span>
    </label>
  );
}

export default function PropositionPage() {
  const { lang = "fr" } = useParams();
  const [params] = useSearchParams();
  usePageTitle("Votre proposition");
  useNoindex();

  // Pôle 1 : les propositions du lien (?o=forme,maintenance), sinon les valeurs par défaut
  const pole1 = useMemo(() => {
    const demandees = (params.get("o") || "").split(",").map((s) => s.trim()).filter((id) => Object.hasOwn(PROPOSITIONS, id));
    return demandees.length ? [...new Set(demandees)] : PAR_DEFAUT;
  }, [params]);
  // Pôle 2 : ce qu'on peut ajouter (maintenance et nouveau site s'ils ne sont pas déjà proposés, puis les options)
  const pole2 = useMemo(
    () => [...["maintenance", "nouveau"].filter((id) => !pole1.includes(id)), ...Object.keys(AJOUTS)],
    [pole1]
  );
  const rawCode = (params.get("c") || "").toLowerCase();
  const code = CODE_REGEX.test(rawCode) ? rawCode : "";

  const [coches1, setCoches1] = useState(() => new Set(pole1));
  const [coches2, setCoches2] = useState(() => new Set());
  const [ouvert, setOuvert] = useState(false); // « je veux ajouter des fonctionnalités » : déplie la liste du pôle 2
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);
  const [loading, setLoading] = useState(false);
  const statusRef = useRef(null);

  // Le lien change (autre ?o=) : on recoche les propositions du nouveau lien
  useEffect(() => { setCoches1(new Set(pole1)); }, [pole1]);
  useEffect(() => { if (error || done) statusRef.current?.focus(); }, [error, done]);

  const basculer = (setter) => (id) =>
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trap = readHoneypot(e.currentTarget);
    if (loading) return;
    setError("");

    const nom = name.trim();
    const tel = phone.trim();
    const texte = message.trim();
    // Les ajouts ne comptent que si la liste est dépliée : « non » = le formulaire part tel quel
    const ajouts = ouvert ? [...coches2] : [];
    if (!nom) { setError("Indiquez votre nom pour que je sache à qui répondre."); document.getElementById("prop-name")?.focus(); return; }
    if (tel && !PHONE_REGEX.test(tel.replace(/[\s.\-()]/g, ""))) { setError("Le numéro de téléphone n'a pas l'air valide (ou laissez le champ vide)."); document.getElementById("prop-phone")?.focus(); return; }
    if (!coches1.size && !ajouts.length && !texte) { setError("Cochez au moins une case, ou écrivez-moi un message."); return; }

    setLoading(true);
    try {
      const res = await apiFetch("/contact", {
        method: "POST",
        body: JSON.stringify({
          source: "proposition",
          name: nom,
          phone: tel,
          code,
          propositions: [...coches1],
          ajouts,
          message: texte,
          [HONEYPOT_FIELD]: trap,
        }),
      });
      if (res.ok) setDone({ name: nom });
      else if (res.status === 400) {
        const data = await res.json().catch(() => ({}));
        setError(data.code === "LINKS" ? "Les liens ne sont pas acceptés dans ce formulaire." : data.error || "Vérifiez les champs et réessayez.");
      } else if (res.status === 429) setError("Trop de tentatives. Réessayez dans quelques minutes.");
      else setError(`Un problème est survenu. Appelez-moi au ${CONTACT_PHONE_DISPLAY}, je vous réponds directement.`);
    } catch {
      setError(`Un problème est survenu. Appelez-moi au ${CONTACT_PHONE_DISPLAY}, je vous réponds directement.`);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <Layout hideFooterCta>
        <header className="page-head container">
          <h1 className="page-title">Merci {done.name}.</h1>
          <p className="page-intro">J'ai bien reçu votre demande. Je reviens vers vous très vite avec un devis simple, sans engagement.</p>
        </header>
        <div ref={statusRef} tabIndex={-1} role="status" className="page-body container prop-done">
          <p>Vous préférez en parler ? Appelez-moi au <a href={`tel:${CONTACT_PHONE_HREF}`}>{CONTACT_PHONE_DISPLAY}</a>.</p>
          <p><Link to={`/${lang}`}>Découvrir mon travail</Link></p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideFooterCta>
      <header className="page-head container">
        <h1 className="page-title">Votre proposition</h1>
        <p className="page-intro">Une minute suffit : votre nom, ce qui vous intéresse, et c'est parti. Je vous réponds avec un devis simple, sans engagement.</p>
      </header>

      <div className="page-body container">
        <form className="contact-form prop-form" onSubmit={handleSubmit} noValidate>
          <Honeypot />

          {/* 1. Qui êtes-vous */}
          <div className="prop-identite">
            <div className="form-group">
              <label htmlFor="prop-name">Votre nom</label>
              <input id="prop-name" name="name" type="text" autoComplete="name" maxLength={MAX_NAME} value={name} onChange={(e) => setName(e.target.value)} placeholder="Prénom Nom" />
            </div>
            <div className="form-group">
              <label htmlFor="prop-phone">Téléphone <span className="prop-opt">(facultatif)</span></label>
              <input id="prop-phone" name="phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="06 12 34 56 78" />
            </div>
          </div>

          {/* 2. Ma proposition */}
          <fieldset className="prop-pole prop-pole--main">
            <legend>Ce que je vous propose</legend>
            {pole1.map((id, i) => (
              <div key={id} className="prop-reveal" style={{ "--i": i }}>
                <Choice id={id} info={PROPOSITIONS[id]} checked={coches1.has(id)} onChange={basculer(setCoches1)} />
              </div>
            ))}
          </fieldset>

          {/* 3. Informations complémentaires */}
          <div className="form-group">
            <label htmlFor="prop-message">Informations complémentaires <span className="prop-opt">(facultatif)</span></label>
            <textarea id="prop-message" name="message" rows={4} maxLength={MAX_MESSAGE} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Une précision, une question, le meilleur moment pour vous joindre…" />
          </div>

          {/* 4. Ajouter des fonctionnalités ? Non : le formulaire part tel quel. Oui : la liste se déplie. */}
          <div className="prop-plus">
            <label className="prop-choice prop-choice--toggle">
              <input type="checkbox" checked={ouvert} onChange={() => setOuvert((o) => !o)} aria-expanded={ouvert} aria-controls="prop-ajouts" />
              <span className="prop-box" aria-hidden="true" />
              <span className="prop-text">
                <span className="prop-label">Je souhaite aussi ajouter des fonctionnalités ou des services</span>
                <span className="prop-detail">Réservation en ligne, bouton d'appel, Instagram, référencement… Sinon, laissez décoché.</span>
              </span>
            </label>
            {ouvert && (
              <fieldset id="prop-ajouts" className="prop-pole prop-pole--ajouts prop-deplie">
                <legend>Cochez ce qui vous intéresse</legend>
                <div className="prop-grid">
                  {pole2.map((id) => (
                    <Choice key={id} id={id} info={TOUTES[id]} checked={coches2.has(id)} onChange={basculer(setCoches2)} compact />
                  ))}
                </div>
              </fieldset>
            )}
          </div>

          <div ref={statusRef} tabIndex={-1} role="status" aria-live="polite" className="form-status-box">
            {error && <p className="form-status err">{error}</p>}
          </div>

          <button type="submit" className="btn-primary contact-submit" disabled={loading}>
            {loading ? "Envoi…" : "Envoyer ma demande"}
          </button>
          <p className="contact-note">
            Votre nom et votre message ne servent qu'à vous répondre.{" "}
            <Link to={`/${lang}/confidentialite`}>Politique de confidentialité</Link>
          </p>
        </form>
      </div>
    </Layout>
  );
}
