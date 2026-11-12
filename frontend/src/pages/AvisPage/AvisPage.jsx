import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import Honeypot from "../../components/Honeypot/Honeypot";
import { HONEYPOT_FIELD, readHoneypot } from "../../components/Honeypot/honeypotField";
import { apiFetch } from "../../utils/api";
import { CONTACT_PHONE_DISPLAY } from "../../utils/contactInfo";
import usePageTitle from "../../utils/usePageTitle";
import useNoindex from "../../utils/useNoindex";
import useReveal from "../../utils/useReveal";
import "../ContactPage/ContactPage.css";
import "./AvisPage.css";

// Mêmes limites que le backend (reviewController.js)
const MAX = { name: 60, role: 100, email: 254, text: 1000 };
const MIN_TEXT = 20;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NOTES = ["Décevant", "Moyen", "Correct", "Très bien", "Excellent"];

function Star({ lit }) {
  return (
    <svg className={`avis-star${lit ? " is-lit" : ""}`} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 2.5l2.94 6.07 6.56.9-4.79 4.62 1.2 6.6L12 17.5l-5.9 3.19 1.2-6.6L2.5 9.47l6.56-.9L12 2.5z" />
    </svg>
  );
}

// Rangée d'étoiles en lecture seule (note d'un avis publié)
function Stars({ value }) {
  return (
    <span className="avis-stars" role="img" aria-label={`Note : ${value} sur 5`}>
      {[1, 2, 3, 4, 5].map((n) => <Star key={n} lit={n <= value} />)}
    </span>
  );
}

// Questions fréquentes : la première (traitement des avis) reste ouverte, c'est l'information que la loi demande de rendre visible
const FAQ = [
  {
    q: "Comment sont traités les avis ?",
    a: (
      <>
        Chaque avis est relu avant publication, puis affiché avec sa date. Je publie les avis sincères, positifs comme critiques,
        et je ne retire que les messages injurieux, publicitaires ou sans rapport avec mon travail. Aucun avis n'est rémunéré,
        aucune contrepartie n'est proposée, et je ne modifie pas les textes. L'identité des auteurs n'est pas vérifiée au-delà de
        notre échange direct.
      </>
    ),
  },
  {
    q: "Mon nom complet est-il affiché ?",
    a: "Non. Seuls votre prénom et l'initiale de votre nom sont affichés (par exemple Marie D.). Votre nom complet n'est vu que par moi, pour vérifier que vous êtes bien client.",
  },
  {
    q: "Mon avis sera-t-il publié ?",
    a: "Oui, s'il est sincère. Je le relis, puis je le publie en général sous quelques jours. Votre prénom, l'initiale de votre nom, votre métier et votre avis sont affichés. Votre email n'est jamais affiché.",
  },
  {
    q: "Puis-je modifier ou supprimer mon avis ?",
    a: (
      <>
        Oui. Écrivez-moi à <a href="mailto:contact@mandev.fr">contact@mandev.fr</a> en indiquant votre prénom et la date de l'avis :
        je le corrige ou je le retire.
      </>
    ),
  },
  {
    q: "Faut-il avoir été client ?",
    a: "Oui. Cette page est réservée aux personnes avec qui j'ai réalisé un projet. Un avis sans projet réalisé ensemble n'est pas publié.",
  },
];

const moisAnnee = (iso) => {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  } catch {
    return "";
  }
};

export default function AvisPage() {
  const { lang = "fr" } = useParams();
  usePageTitle("Laisser un avis");
  useNoindex();

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");
  const [text, setText] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);
  const [loading, setLoading] = useState(false);
  const [avis, setAvis] = useState(null); // null : chargement, [] : aucun avis publié
  const statusRef = useRef(null);

  useReveal([avis?.length, Boolean(done)]);

  // Avis publiés : si le serveur ne répond pas, on n'affiche simplement pas la liste
  useEffect(() => {
    let annule = false;
    apiFetch("/api/reviews")
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => [])
      .then((liste) => { if (!annule) setAvis(Array.isArray(liste) ? liste : []); });
    return () => { annule = true; };
  }, []);

  useEffect(() => {
    if (done) {
      // Remerciement : on remonte au titre « Merci… » et on donne le focus sans laisser le navigateur défiler
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      statusRef.current?.focus({ preventScroll: true });
    } else if (error) {
      statusRef.current?.focus();
    }
  }, [error, done]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trap = readHoneypot(e.currentTarget);
    if (loading) return;
    setError("");

    const prenom = name.trim();
    const nom = lastName.trim();
    const metier = role.trim();
    const avisTexte = text.trim();
    const mail = email.trim();
    const echec = (message, id) => { setError(message); if (id) document.getElementById(id)?.focus(); };

    if (!prenom) return echec("Indiquez votre prénom.", "avis-name");
    if (!nom) return echec("Indiquez votre nom.", "avis-lastname");
    if (!rating) return echec("Choisissez une note de 1 à 5 étoiles.");
    if (avisTexte.length < MIN_TEXT) return echec(`Votre avis est un peu court : ${MIN_TEXT} caractères minimum.`, "avis-text");
    if (mail && !EMAIL_REGEX.test(mail)) return echec("L'adresse email n'a pas l'air valide (ou laissez le champ vide).", "avis-email");
    if (!consent) return echec("Cochez la case pour accepter la publication de votre avis.", "avis-consent");

    setLoading(true);
    try {
      const res = await apiFetch("/api/reviews", {
        method: "POST",
        body: JSON.stringify({ name: prenom, lastName: nom, role: metier, rating, text: avisTexte, email: mail, consent: true, [HONEYPOT_FIELD]: trap }),
      });
      if (res.ok) setDone({ name: prenom });
      else if (res.status === 400) {
        const data = await res.json().catch(() => ({}));
        setError(data.code === "LINKS" ? "Les liens ne sont pas acceptés dans ce formulaire." : data.error || "Vérifiez les champs et réessayez.");
      } else if (res.status === 429) setError("Trop de tentatives. Réessayez dans quelques minutes.");
      else setError(`Un problème est survenu. Écrivez-moi ou appelez-moi au ${CONTACT_PHONE_DISPLAY}.`);
    } catch {
      setError(`Un problème est survenu. Écrivez-moi ou appelez-moi au ${CONTACT_PHONE_DISPLAY}.`);
    } finally {
      setLoading(false);
    }
  };

  const affiche = hover || rating;

  return (
    <Layout hideFooterCta>
      <header className="page-head container avis-head">
        <div className="avis-hero-stars" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <svg key={i} className="avis-hero-star" style={{ "--i": i }} viewBox="0 0 24 24" focusable="false">
              <path d="M12 2.5l2.94 6.07 6.56.9-4.79 4.62 1.2 6.6L12 17.5l-5.9 3.19 1.2-6.6L2.5 9.47l6.56-.9L12 2.5z" />
            </svg>
          ))}
        </div>
        <h1 className="page-title avis-title">{done ? `Merci ${done.name}.` : "Votre avis compte."}</h1>
        <p className="page-intro avis-intro">
          {done
            ? "J'ai bien reçu votre avis. Je le relis, puis il sera publié sur cette page."
            : "Un projet réalisé ensemble ? Dites-moi en quelques lignes comment ça s'est passé. Cela prend une minute."}
        </p>
      </header>

      <div className="page-body container avis-layout">
        <div className="avis-main">
          {done ? (
            <div ref={statusRef} tabIndex={-1} role="status" className="avis-done reveal">
              <p>Si vous avez laissé votre email, je peux vous écrire pour vous remercier ou préciser un point. Il ne sera jamais affiché.</p>
              <p><Link to={`/${lang}`}>Retour au site</Link></p>
            </div>
          ) : (
            <form className="contact-form avis-form" onSubmit={handleSubmit} noValidate>
              <Honeypot />

              <fieldset className="avis-rate">
                <legend>Votre note</legend>
                <div className="avis-rate-row" onMouseLeave={() => setHover(0)}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} className="avis-rate-item">
                      <input
                        type="radio"
                        name="rating"
                        id={`avis-r${n}`}
                        value={n}
                        checked={rating === n}
                        onChange={() => setRating(n)}
                      />
                      <label htmlFor={`avis-r${n}`} onMouseEnter={() => setHover(n)}>
                        <Star lit={n <= affiche} />
                        <span className="sr-only">{n} étoile{n > 1 ? "s" : ""} sur 5, {NOTES[n - 1]}</span>
                      </label>
                    </span>
                  ))}
                  <span className="avis-rate-word" aria-hidden="true">{affiche ? NOTES[affiche - 1] : ""}</span>
                </div>
              </fieldset>

              <div className="avis-duo">
                <div className="form-group">
                  <label htmlFor="avis-name">Votre prénom</label>
                  <input id="avis-name" name="name" type="text" autoComplete="given-name" maxLength={MAX.name} value={name} onChange={(e) => setName(e.target.value)} placeholder="Prénom" />
                </div>
                <div className="form-group">
                  <label htmlFor="avis-lastname">Votre nom</label>
                  <input id="avis-lastname" name="lastName" type="text" autoComplete="family-name" maxLength={MAX.name} value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Nom" aria-describedby="avis-lastname-note" />
                </div>
              </div>
              <p id="avis-lastname-note" className="avis-note-nom">Seule l'initiale de votre nom sera affichée (ex. Marie D.).</p>

              <div className="form-group">
                <label htmlFor="avis-role">Votre métier ou commerce <span className="avis-opt">(facultatif)</span></label>
                <input id="avis-role" name="role" type="text" maxLength={MAX.role} value={role} onChange={(e) => setRole(e.target.value)} placeholder="Ex. restaurateur" />
              </div>

              <div className="form-group">
                <label htmlFor="avis-text">Votre avis</label>
                <textarea id="avis-text" name="text" rows={5} maxLength={MAX.text} value={text} onChange={(e) => setText(e.target.value)} placeholder="Ce qui vous a plu, ce qui a changé pour vous, ce que je peux améliorer…" aria-describedby="avis-count" />
                <p id="avis-count" className={`avis-count${text.trim().length > 0 && text.trim().length < MIN_TEXT ? " is-short" : ""}`}>
                  {text.length} / {MAX.text}
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="avis-email">Votre email <span className="avis-opt">(facultatif)</span></label>
                <input id="avis-email" name="email" type="email" autoComplete="email" maxLength={MAX.email} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Jamais affiché" />
              </div>

              <label className="avis-consent">
                <input id="avis-consent" type="checkbox" checked={consent} onChange={() => setConsent((c) => !c)} />
                <span className="avis-box" aria-hidden="true" />
                <span>J'accepte que mon prénom, l'initiale de mon nom, mon métier et mon avis soient publiés sur ce site.</span>
              </label>

              <div ref={statusRef} tabIndex={-1} role="status" aria-live="polite" className="form-status-box">
                {error && <p className="form-status err">{error}</p>}
              </div>

              <div className="avis-envoi">
                <button type="submit" className="btn-primary contact-submit" disabled={loading}>
                  {loading ? "Envoi…" : "Envoyer mon avis"}
                </button>
                <p className="contact-note">
                  Votre email, s'il est renseigné, ne sert qu'à vous répondre.{" "}
                  <Link to={`/${lang}/confidentialite`}>Confidentialité</Link>
                </p>
              </div>
            </form>
          )}
        </div>

        <aside className="avis-aside" aria-labelledby="avis-liste-titre">
          <h2 id="avis-liste-titre" className="avis-aside-title">Avis publiés</h2>

          {avis === null && <p className="avis-vide">Chargement…</p>}
          {avis?.length === 0 && <p className="avis-vide">Aucun avis publié pour le moment.</p>}
          {avis?.length > 0 && (
            <ul className="avis-liste">
              {avis.map((r, i) => (
                <li key={r.id} className="avis-carte reveal" style={{ "--delay": `${Math.min(i, 5) * 80}ms` }}>
                  <figure>
                    <Stars value={r.rating} />
                    <blockquote><p>{r.text}</p></blockquote>
                    <figcaption>
                      {r.name}
                      {r.role ? ` · ${r.role}` : ""}
                      {r.publishedAt ? <span className="avis-date"> · {moisAnnee(r.publishedAt)}</span> : null}
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          )}

          <section className="avis-faq" aria-labelledby="avis-faq-titre">
            <h2 id="avis-faq-titre" className="avis-aside-title">Questions fréquentes</h2>
            {FAQ.map((item, i) => (
              <details key={item.q} className="avis-faq-item" open={i === 0}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </section>
        </aside>
      </div>
    </Layout>
  );
}
