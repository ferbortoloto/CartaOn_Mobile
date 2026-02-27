import React, { createContext, useState, useEffect } from 'react';
import {
  signIn,
  signUp,
  signOut,
  getProfile,
  updateProfile as updateProfileService,
  getSession,
  onAuthStateChange,
} from '../services/auth.service';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);       // profile completo do banco
  const [session, setSession] = useState(null); // sessão do Supabase Auth
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carrega sessão existente ao abrir o app
    getSession().then(async (s) => {
      if (s) {
        try {
          const profile = await getProfile(s.user.id);
          setSession(s);
          setUser(profile);
          setIsAuthenticated(true);
        } catch {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    });

    // Escuta mudanças de autenticação (login, logout, refresh de token)
    const unsubscribe = onAuthStateChange(async (_event, s) => {
      setSession(s);
      if (s) {
        try {
          const profile = await getProfile(s.user.id);
          setUser(profile);
          setIsAuthenticated(true);
        } catch {
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    const { profile } = await signIn(email, password);
    setUser(profile);
    setIsAuthenticated(true);
    return { success: true, user: profile };
  };

  const register = async (formData) => {
    const { profile } = await signUp(formData);
    setUser(profile);
    setIsAuthenticated(true);
    return { success: true, user: profile };
  };

  const updateProfile = async (fields) => {
    const updated = await updateProfileService(user.id, fields);
    setUser(updated);
    return { success: true };
  };

  const logout = async () => {
    await signOut();
    setUser(null);
    setSession(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, isAuthenticated, loading, login, logout, register, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
