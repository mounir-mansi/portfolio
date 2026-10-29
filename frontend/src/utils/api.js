const BASE = import.meta.env.VITE_API_URL || "";

// Envoi de fichier : pas de Content-Type, le navigateur ajoute lui-même la frontière multipart
export async function apiUpload(path, formData, briefToken) {
  return fetch(`${BASE}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "x-brief-token": briefToken },
    body: formData,
  });
}

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  // Session administrateur expirée côté serveur : le navigateur se croit encore connecté, les onglets recevraient une erreur
  // au lieu de leurs données et la page deviendrait vide. On efface la session locale et on repart de la connexion.
  if (res.status === 401 && path.startsWith("/admin")) {
    try { localStorage.removeItem("portfolio_admin"); } catch { /* stockage indisponible */ }
    window.location.assign("/connexion");
    return new Promise(() => {}); // la page se recharge : on n'exécute pas la suite avec la réponse d'erreur
  }
  return res;
}
