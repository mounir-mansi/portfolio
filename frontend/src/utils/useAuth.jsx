import { createContext, useContext, useState } from "react";
import { apiFetch } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("portfolio_admin");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  async function login(username, password) {
    const res = await apiFetch("/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Erreur de connexion");
    }
    const meRes = await apiFetch("/admin/me");
    const me = await meRes.json();
    setUser(me);
    localStorage.setItem("portfolio_admin", JSON.stringify(me));
  }

  async function logout() {
    await apiFetch("/logout");
    setUser(null);
    localStorage.removeItem("portfolio_admin");
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
