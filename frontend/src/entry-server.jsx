import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { AuthProvider } from "./utils/useAuth";
import App from "./App";
import i18n from "./i18n/index.js";
import { ssrHead, resetSsrHead } from "./utils/ssrHead";

// Rendu serveur d'une page (utilisé seulement par scripts/prerender.mjs, jamais dans le navigateur).
// Renvoie le HTML du contenu et les balises <head> collectées pendant le rendu.
export async function render(url) {
  const lang = url.split("/")[1];
  await i18n.changeLanguage(lang);
  resetSsrHead();
  const html = renderToString(
    <StaticRouter location={url}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </StaticRouter>
  );
  return { html, head: { ...ssrHead, alternates: [...ssrHead.alternates], jsonld: [...ssrHead.jsonld] } };
}
