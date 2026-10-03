import { createContext, useContext, useState } from 'react';
import { api } from '../api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ss_user'));
    } catch {
      return null;
    }
  });

  const persist = (u) => {
    setUser(u);
    try {
      if (u) localStorage.setItem('ss_user', JSON.stringify(u));
      else localStorage.removeItem('ss_user');
    } catch {
      /* storage unavailable; session lasts until reload */
    }
  };

  const login = async (email, password) =>
    persist(await api('/auth/login', { method: 'POST', body: { email, password } }));
  const register = async (name, email, password) =>
    persist(await api('/auth/register', { method: 'POST', body: { name, email, password } }));
  const logout = () => persist(null);

  return (
    <AuthContext.Provider value={{ user, token: user?.token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
