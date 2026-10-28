import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "./BackToTop.css";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label={t("nav.back_to_top")}>
      {/* Chevron — Font Awesome Free 6.4.0 (CC BY 4.0), en SVG pour ne charger aucune police d'icônes */}
      <svg viewBox="0 0 512 512" aria-hidden="true" focusable="false">
        <path d="M233.4 105.4c12.5-12.5 32.8-12.5 45.3 0l192 192c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L256 173.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l192-192z" />
      </svg>
    </button>
  );
}
