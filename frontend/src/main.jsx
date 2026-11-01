import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./utils/useAuth";
import App from "./App";
import "./i18n/index.js";
// Polices hébergées sur le site : aucun serveur tiers contacté pour l'affichage
import "@fontsource-variable/fraunces/opsz.css";
import "@fontsource-variable/fraunces/opsz-italic.css";
import "@fontsource-variable/geist";
import "@fontsource-variable/jetbrains-mono";
import "./index.css";

const theme = new URLSearchParams(window.location.search).get("theme");
if (theme === "light" || theme === "dark") {
  document.documentElement.dataset.theme = theme;
}

const app = (
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);

// Page prérendue (scripts/prerender.mjs) : React reprend le HTML existant ; sinon rendu normal dans le navigateur
const root = document.getElementById("root");
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
