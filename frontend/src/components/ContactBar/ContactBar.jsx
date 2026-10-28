import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CONTACT_PHONE_HREF, CONTACT_WHATSAPP_HREF } from "../../utils/contactInfo";
import "./ContactBar.css";

// Mobile : barre fixe « Appeler | Maquette gratuite ». Desktop : bouton WhatsApp flottant.
// La barre se cache sur la page Contact et quand le formulaire #devis est à l'écran.
export default function ContactBar() {
  const { t } = useTranslation();
  const { lang = "fr" } = useParams();
  const { pathname } = useLocation();
  // L'état mémorise la page à laquelle il se rapporte : changer de page l'invalide sans le réinitialiser à la main
  const [quote, setQuote] = useState({ path: "", inView: false });
  const quoteInView = quote.path === pathname && quote.inView;
  const onContactPage = pathname.endsWith("/contact");

  useEffect(() => {
    const target = document.getElementById("devis");
    if (!target || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      ([entry]) => setQuote({ path: pathname, inView: entry.isIntersecting }),
      { threshold: 0.15 }
    );
    io.observe(target);
    return () => io.disconnect();
  }, [pathname]);

  const showBar = !onContactPage && !quoteInView;

  // Réserve la place de la barre en bas de page pour qu'elle ne masque pas le pied de page
  useEffect(() => {
    document.body.classList.toggle("has-bar", showBar);
    return () => document.body.classList.remove("has-bar");
  }, [showBar]);

  return (
    <>
      <nav className="contact-bar" aria-label={t("nav.aria_contact")} hidden={!showBar}>
        <a href={`tel:${CONTACT_PHONE_HREF}`} className="contact-bar-call">{t("nav.call")}</a>
        <Link to={{ pathname: `/${lang}`, hash: "#devis" }} className="contact-bar-quote">{t("nav.mockup")}</Link>
      </nav>
      <a
        href={CONTACT_WHATSAPP_HREF}
        className="wa-float"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
      >
        <i className="fa-brands fa-whatsapp" aria-hidden="true" />
      </a>
    </>
  );
}
