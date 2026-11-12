import { useEffect, useState } from "react";
import { apiFetch } from "../../../utils/api";
import "./AdminTab.css";

const STATUS_LABELS = { pending: "À relire", published: "Publié", hidden: "Masqué" };
const STATUS_TAGS = { pending: "tag-quote", published: "tag-replied", hidden: "tag-hidden" };

const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/admin/reviews")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Chargement impossible"))))
      .then(setReviews)
      .catch(() => setError("Impossible de charger les avis."))
      .finally(() => setLoading(false));
  }, []);

  const setStatus = async (id, status) => {
    try {
      const res = await apiFetch(`/admin/reviews/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setReviews((list) => list.map((r) => (r.id === id ? updated : r)));
    } catch {
      alert("Erreur : le statut n'a pas été modifié.");
    }
  };

  const remove = async (id) => {
    if (!confirm("Supprimer définitivement cet avis ?")) return;
    try {
      const res = await apiFetch(`/admin/reviews/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setReviews((list) => list.filter((r) => r.id !== id));
    } catch {
      alert("Erreur : l'avis n'a pas été supprimé.");
    }
  };

  const pending = reviews.filter((r) => r.status === "pending").length;

  if (loading) return <p className="tab-loading">Chargement...</p>;

  return (
    <div className="admin-tab-content">
      <div className="tab-header">
        <h2>Avis {pending > 0 && <span className="badge-count">{pending}</span>}</h2>
      </div>

      <p className="rev-help">
        Un avis n'est visible sur le site qu'une fois publié. Le lien à envoyer à vos clients : <strong>/fr/avis</strong>.
      </p>

      {error && <p className="tab-empty">{error}</p>}
      {!error && reviews.length === 0 && <p className="tab-empty">Aucun avis reçu pour le moment.</p>}

      <div className="messages-list">
        {reviews.map((r) => (
          <div key={r.id} className={`msg-card ${r.status === "pending" ? "unread" : ""}`}>
            <div className="msg-header">
              <div className="msg-meta">
                {r.status === "pending" && <span className="unread-dot" />}
                <strong>{[r.name, r.lastName].filter(Boolean).join(" ")}</strong>
                <span className="rev-stars" role="img" aria-label={`Note : ${r.rating} sur 5`}>{stars(r.rating)}</span>
                <span className={STATUS_TAGS[r.status]}>{STATUS_LABELS[r.status] || r.status}</span>
                {r.role && <span className="msg-email">{r.role}</span>}
                {r.email && <span className="msg-email">{r.email} (non affiché)</span>}
              </div>
              <span className="msg-date">{new Date(r.createdAt).toLocaleDateString("fr-FR")}</span>
            </div>
            <p className="msg-body">{r.text}</p>
            <div className="msg-actions">
              {r.status !== "published" && (
                <button className="btn-sm btn-accent" onClick={() => setStatus(r.id, "published")}>
                  <i className="fa-solid fa-check" aria-hidden="true" /> Publier
                </button>
              )}
              {r.status !== "hidden" && (
                <button className="btn-sm" onClick={() => setStatus(r.id, "hidden")}>
                  <i className="fa-solid fa-eye-slash" aria-hidden="true" /> Masquer
                </button>
              )}
              <button className="btn-sm btn-danger" onClick={() => remove(r.id)} aria-label="Supprimer">
                <i className="fa-solid fa-trash" aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
