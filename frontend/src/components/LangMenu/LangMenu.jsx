import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import "./LangMenu.css";

// Noms dans leur propre langue : on reconnaît la sienne sans avoir à la traduire
const NAMES = { fr: "Français", en: "English", it: "Italiano", es: "Español" };

// Drapeaux dessinés en SVG : les drapeaux emoji ne s'affichent pas sous Windows (ils deviennent « FR », « IT »…)
function Flag({ code }) {
  return (
    <span className="lang-flag" aria-hidden="true">
      <svg viewBox="0 0 30 20" preserveAspectRatio="xMidYMid slice" focusable="false">
        {code === "fr" && (
          <>
            <rect width="10" height="20" fill="#0055a4" />
            <rect x="10" width="10" height="20" fill="#fff" />
            <rect x="20" width="10" height="20" fill="#ef4135" />
          </>
        )}
        {code === "it" && (
          <>
            <rect width="10" height="20" fill="#009246" />
            <rect x="10" width="10" height="20" fill="#fff" />
            <rect x="20" width="10" height="20" fill="#ce2b37" />
          </>
        )}
        {code === "es" && (
          <>
            <rect width="30" height="20" fill="#aa151b" />
            <rect y="5" width="30" height="10" fill="#f1bf00" />
          </>
        )}
        {code === "en" && (
          <>
            <rect width="30" height="20" fill="#012169" />
            <path d="M0 0L30 20M30 0L0 20" stroke="#fff" strokeWidth="4" />
            <path d="M0 0L30 20M30 0L0 20" stroke="#c8102e" strokeWidth="1.6" />
            <path d="M15 0V20M0 10H30" stroke="#fff" strokeWidth="6" />
            <path d="M15 0V20M0 10H30" stroke="#c8102e" strokeWidth="3.6" />
          </>
        )}
      </svg>
    </span>
  );
}

// Bouton rond avec le drapeau de la langue en cours ; il ouvre la liste des langues.
export default function LangMenu({ lang, langs, onSelect }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);

  // Clic ailleurs ou Échap : le menu se ferme (Échap rend le focus au bouton)
  useEffect(() => {
    if (!open) return;
    const onPointer = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (code) => {
    setOpen(false);
    if (code !== lang) onSelect(code);
  };

  return (
    <div className="lang-menu" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="lang-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-label={`${t("nav.aria_lang_group")} (${NAMES[lang] || lang})`}
        aria-expanded={open}
        aria-controls="lang-menu-list"
      >
        <Flag code={lang} />
      </button>

      {open && (
        <ul id="lang-menu-list" className="lang-list">
          {langs.map((code) => (
            <li key={code}>
              <button
                type="button"
                className={`lang-option ${code === lang ? "is-active" : ""}`}
                lang={code}
                aria-current={code === lang ? "true" : undefined}
                onClick={() => choose(code)}
              >
                <Flag code={code} />
                <span>{NAMES[code]}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
