import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./utils/useAuth";
import App from "./App";
import "./i18n/index.js";
import "./index.css";

const theme = new URLSearchParams(window.location.search).get("theme");
if (theme === "light" || theme === "dark") {
  document.documentElement.dataset.theme = theme;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
