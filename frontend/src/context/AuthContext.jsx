import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("svx-user")) || null; }
    catch { return null; }
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("svx-user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("svx-user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);