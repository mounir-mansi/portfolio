// Champ piège anti-robots : invisible pour un visiteur, mais un robot qui remplit tous les champs le remplit aussi.
// Le backend ignore silencieusement toute demande où ce champ n'est pas vide (voir contactController.js).
export const HONEYPOT_FIELD = "website_url_check";

// Valeur du champ piège dans un formulaire (vide pour un vrai visiteur)
export const readHoneypot = (formElement) => new FormData(formElement).get(HONEYPOT_FIELD) || "";
