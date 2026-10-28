import { useState } from "react";
import { useTranslation } from "react-i18next";
import { apiUpload, apiFetch } from "../../utils/api";
import { CONTACT_EMAIL } from "../../utils/contactInfo";

const ACCEPTED = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024;

const formatSize = (bytes) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} Mo` : `${Math.max(1, Math.round(bytes / 1024))} Ko`);

// Import de fichiers (menu ou logo). Chaque fichier part dès qu'il est choisi, avec le jeton de la demande.
// Le serveur revérifie le vrai type du fichier : les contrôles d'ici ne servent qu'à prévenir plus vite.
export default function FileUploader({ token, kind, max, files, onChange, titleKey, hintKey }) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const inputId = `quote-file-${kind}`;
  const full = files.length >= max;

  const upload = async (list) => {
    setError(null);
    let current = files;
    for (const file of list) {
      // Un logo en remplace un autre ; seuls les menus sont limités en nombre
      if (kind === "menu" && current.length >= max) {
        setError(t("quote.file_error_max", { count: max }));
        break;
      }
      if (!ACCEPTED.includes(file.type)) {
        setError(t("quote.file_error_type"));
        continue;
      }
      if (file.size > MAX_BYTES) {
        setError(t("quote.file_error_size"));
        continue;
      }
      setBusy(true);
      try {
        const body = new FormData();
        body.append("file", file);
        const res = await apiUpload(`/contact/brief/files?kind=${kind}`, body, token);
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          // Un logo remplace le précédent ; les menus s'ajoutent
          current = kind === "logo" ? [{ fileId: data.fileId, name: file.name, size: file.size }] : [...current, { fileId: data.fileId, name: file.name, size: file.size }];
          onChange(current);
        } else if (res.status === 413) setError(t("quote.file_error_size"));
        else if (res.status === 400) setError(t("quote.file_error_type"));
        else setError(t("quote.file_error_generic", { email: CONTACT_EMAIL }));
      } catch {
        setError(t("quote.file_error_generic", { email: CONTACT_EMAIL }));
      } finally {
        setBusy(false);
      }
    }
  };

  const remove = async (fileId) => {
    setError(null);
    try {
      await apiFetch(`/contact/brief/files/${fileId}`, { method: "DELETE", headers: { "x-brief-token": token } });
    } catch {
      // Le fichier restera côté serveur jusqu'à l'expiration ; on le retire quand même de la liste
    }
    onChange(files.filter((f) => f.fileId !== fileId));
  };

  const handleChange = (e) => {
    const list = [...e.target.files];
    e.target.value = "";
    if (list.length) upload(list);
  };

  return (
    <div className="quote-upload">
      <p className="quote-upload-title" id={`${inputId}-title`}>{t(titleKey)}</p>
      <p className="quote-hint" id={`${inputId}-hint`}>{t(hintKey)}</p>

      {files.length > 0 && (
        <ul className="quote-upload-list">
          {files.map((f) => (
            <li key={f.fileId}>
              <span className="quote-upload-name">{f.name}</span>
              <span className="quote-upload-size">{formatSize(f.size)}</span>
              <button type="button" className="quote-link" onClick={() => remove(f.fileId)}>
                {t("quote.file_remove")}
              </button>
            </li>
          ))}
        </ul>
      )}

      {(!full || kind === "logo") && (
        <label className={`quote-choice quote-upload-btn ${busy ? "is-busy" : ""}`}>
          <input id={inputId} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
            multiple={kind === "menu"} disabled={busy}
            aria-describedby={`${inputId}-hint`} onChange={handleChange} />
          <span>{busy ? t("quote.file_uploading") : files.length && kind === "logo" ? t("quote.file_replace") : t("quote.file_choose")}</span>
        </label>
      )}

      <p className="field-error" role="alert">{error}</p>
    </div>
  );
}
