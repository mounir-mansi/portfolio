import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import QuickQuote from "./QuickQuote";
import "./QuoteModal.css";

// Formulaire de maquette dans une fenêtre modale (mobile et tablette).
// Elle s'ouvre quand l'adresse contient #devis (boutons « Recevoir ma maquette gratuite ») et se ferme en retirant ce #devis.
export default function QuoteModal() {
  const { t } = useTranslation();
  const { hash, pathname, search } = useLocation();
  const navigate = useNavigate();
  const dialogRef = useRef(null);
  const open = hash === "#devis";

  const close = () => navigate({ pathname, search }, { replace: true });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // La page derrière ne défile pas pendant que la modale est ouverte
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="quote-modal"
      aria-labelledby="quote-title"
      onCancel={(e) => { e.preventDefault(); close(); }}
      onClick={(e) => { if (e.target === dialogRef.current) close(); }}
    >
      {open && (
        <>
          <button type="button" className="quote-modal-close" onClick={close} aria-label={t("quote.close")}>
            <span aria-hidden="true">×</span>
          </button>
          <QuickQuote variant="modal" onClose={close} />
        </>
      )}
    </dialog>
  );
}
