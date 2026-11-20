import { createContext } from "react";

// Contexte d'authentification : séparé du composant AuthProvider pour que chaque fichier n'exporte qu'un seul type de chose
// (règle react-refresh/only-export-components, nécessaire à la mise à jour à chaud en développement).
export const AuthContext = createContext(null);
