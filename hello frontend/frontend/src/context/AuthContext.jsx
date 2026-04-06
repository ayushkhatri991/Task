import { createContext, useContext, useState, useEffect } from "react";
import { logout as apiLogout } from "../api/auth";

const AuthContext = createContext(null);

// Decode JWT payload without a library
const decodeToken = (token) => {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return {};
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = sessionStorage.getItem("token");
    const storedUser = sessionStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, tokenValue) => {
    // Merge role + _id from JWT into userData (backend omits role from response body)
    const decoded = decodeToken(tokenValue);
    const enrichedUser = {
      ...userData,
      role: decoded.role || userData.role,
      _id: userData._id || decoded._id,
    };
    setUser(enrichedUser);
    setToken(tokenValue);
    sessionStorage.setItem("token", tokenValue);
    sessionStorage.setItem("user", JSON.stringify(enrichedUser));
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (_) {}
    setUser(null);
    setToken(null);
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
