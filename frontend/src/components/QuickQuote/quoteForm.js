import { apiFetch } from "../../utils/api";

// Mêmes règles que le backend (contactController.js, source "devis")
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_SEPARATORS = /[\s.\-()]/g;
const PHONE_REGEX = /^\+?\d{8,15}$/;

export const FIELDS = ["name", "company", "phone", "activity", "email"];
export const EMPTY = { name: "", company: "", phone: "", activity: "", email: "" };

// Clés de traduction des erreurs, par champ
export function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "contact.error_name";
  if (!form.company.trim()) errors.company = "quote.error_company";
  if (!PHONE_REGEX.test(form.phone.trim().replace(PHONE_SEPARATORS, ""))) errors.phone = "quote.error_phone";
  if (!form.activity.trim()) errors.activity = "quote.error_activity";
  if (form.email.trim() && !EMAIL_REGEX.test(form.email.trim())) errors.email = "contact.error_email";
  return errors;
}

// Étape 1 : envoi de la demande, partagé entre le formulaire du hero et la section #devis
export function sendQuoteRequest(form) {
  return apiFetch("/contact", {
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
}
