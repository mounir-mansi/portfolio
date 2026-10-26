import { useEffect, useState } from "react";
import { apiFetch } from "../../../utils/api";
import "./AdminTab.css";

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyId, setReplyId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    apiFetch("/admin/messages")
      .then((r) => r.json())
      .then(setMessages)
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    await apiFetch(`/admin/messages/${id}/read`, { method: "PATCH" });
    setMessages((m) => m.map((msg) => msg.id === id ? { ...msg, read: true } : msg));
  };

  const deleteMsg = async (id) => {
    if (!confirm("Supprimer ce message ?")) return;
    await apiFetch(`/admin/messages/${id}`, { method: "DELETE" });
    setMessages((m) => m.filter((msg) => msg.id !== id));
  };

  const sendReply = async (msg) => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      const res = await apiFetch(`/admin/messages/${msg.id}/reply`, {
        method: "POST",
        body: JSON.stringify({ replyMessage: replyText }),
      });
      if (!res.ok) throw new Error();
      setMessages((m) => m.map((m2) => m2.id === msg.id ? { ...m2, replied: true, read: true } : m2));
      setReplyId(null);
      setReplyText("");
    } catch {
      alert("Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  };

  const unread = messages.filter((m) => !m.read).length;

  if (loading) return <p className="tab-loading">Chargement...</p>;

  return (
    <div className="admin-tab-content">
      <div className="tab-header">
        <h2>Messages {unread > 0 && <span className="badge-count">{unread}</span>}</h2>
      </div>

      {messages.length === 0 && <p className="tab-empty">Aucun message.</p>}

      <div className="messages-list">
        {messages.map((msg) => (
          <div key={msg.id} className={`msg-card ${!msg.read ? "unread" : ""}`}>
            <div className="msg-header">
              <div className="msg-meta">
                {!msg.read && <span className="unread-dot" />}
                <strong>{msg.name}</strong>
                {msg.source === "devis" && <span className="tag-quote">Maquette gratuite</span>}
                {msg.phone && (
                  <a className="msg-email" href={`tel:${msg.phone.replace(/[^\d+]/g, "")}`}>{msg.phone}</a>
                )}
                {msg.email && <span className="msg-email">{msg.email}</span>}
                {msg.company && <span className="msg-email">{msg.company}</span>}
                {msg.activity && <span className="msg-email">{msg.activity}</span>}
                {msg.replied && <span className="tag-replied">Répondu</span>}
              </div>
              <span className="msg-date">{new Date(msg.createdAt).toLocaleDateString("fr-FR")}</span>
            </div>
            {msg.message && <p className="msg-body">{msg.message}</p>}
            {(msg.pack || msg.pages?.length > 0 || msg.theme || msg.couleurs || msg.echeance || msg.creneau || msg.aLogo !== null) && (
              <p className="msg-body msg-brief">
                {msg.pack && <span><strong>Type :</strong> {msg.pack}. </span>}
                {msg.pages?.length > 0 && <span><strong>{msg.pack === "vitrine" ? "Sections" : "Pages"} :</strong> {msg.pages.join(", ")}{msg.pagesAutre ? " (" + msg.pagesAutre + ")" : ""}. </span>}
                {msg.theme && <span><strong>Style :</strong> {msg.theme}. </span>}
                {msg.couleurs && <span><strong>Couleurs :</strong> {msg.couleurs}. </span>}
                {msg.aLogo !== null && <span><strong>Logo :</strong> {msg.aLogo ? "oui" : "non"}. </span>}
                {msg.echeance && <span><strong>Pour quand :</strong> {msg.echeance}. </span>}
                {msg.creneau && <span><strong>Rappel :</strong> {msg.creneau}.</span>}
              </p>
            )}
            {(msg.menuFiles?.length > 0 || msg.logoFile) && (
              <p className="msg-body msg-brief">
                <strong>Fichiers :</strong>{" "}
                {(msg.menuFiles || []).map((f, i) => (
                  <a key={f} className="msg-file" href={`/admin/messages/${msg.id}/files/${f}`} download>Menu {i + 1}</a>
                ))}
                {msg.logoFile && <a className="msg-file" href={`/admin/messages/${msg.id}/files/${msg.logoFile}`} download>Logo</a>}
              </p>
            )}
            <div className="msg-actions">
              {!msg.read && (
                <button className="btn-sm" onClick={() => markRead(msg.id)}>
                  Marquer lu
                </button>
              )}
              {msg.email ? (
                <button
                  className="btn-sm btn-accent"
                  onClick={() => { setReplyId(msg.id); setReplyText(""); markRead(msg.id); }}
                >
                  <i className="fa-solid fa-reply" aria-hidden="true" /> Répondre
                </button>
              ) : (
                <span className="msg-email">Pas d'email : à rappeler</span>
              )}
              <button className="btn-sm btn-danger" onClick={() => deleteMsg(msg.id)} aria-label="Supprimer">
                <i className="fa-solid fa-trash" aria-hidden="true" />
              </button>
            </div>
            {replyId === msg.id && (
              <div className="reply-form">
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Votre réponse..."
                />
                <div className="reply-actions">
                  <button className="btn-sm btn-accent" onClick={() => sendReply(msg)} disabled={sending}>
                    {sending ? "Envoi..." : "Envoyer"}
                  </button>
                  <button className="btn-sm" onClick={() => setReplyId(null)}>Annuler</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
