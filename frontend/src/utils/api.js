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
  return res;
}
