import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/useAuth";
import "./ConnexionScreen.css";

export default function ConnexionScreen() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  if (user) {
    navigate("/admin", { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="connexion-page">
      <div className="connexion-box">
        <h1>Administration</h1>
        <p className="connexion-sub">Accès réservé</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Identifiant</label>
            <input
              id="username"
              type="text"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              placeholder="admin"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <div className="pwd-wrapper">
              <input
                id="password"
                type={showPwd ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="toggle-pwd"
                onClick={() => setShowPwd((v) => !v)}
                aria-label={showPwd ? "Masquer" : "Afficher"}
              >
                <i className={`fa-solid ${showPwd ? "fa-eye-slash" : "fa-eye"}`} aria-hidden="true" />
              </button>
            </div>
          </div>
          {error && <p className="connexion-error">{error}</p>}
          <button type="submit" className="btn-connexion" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
        <a href="/" className="back-link">← Retour au site</a>
      </div>
    </div>
  );
}
