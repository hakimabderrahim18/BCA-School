import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('bca_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Vérification de la session auprès du serveur au montage
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('bca_access_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.data.success) {
          const freshUser = response.data.data.user;
          setUser(freshUser);
          localStorage.setItem('bca_user', JSON.stringify(freshUser));
        }
      } catch (error) {
        console.warn('[AuthContext] Session expirée ou invalide.');
        localStorage.removeItem('bca_access_token');
        localStorage.removeItem('bca_user');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  /**
   * Connexion utilisateur par email ou numéro de téléphone
   */
  const login = async (identifier, password) => {
    const response = await api.post('/auth/login', { identifier, password });
    if (response.data.success) {
      const { user: loggedInUser, accessToken } = response.data.data;
      localStorage.setItem('bca_access_token', accessToken);
      localStorage.setItem('bca_user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      setIsLoading(false);
      return loggedInUser;
    }
  };

  /**
   * Déconnexion utilisateur
   */
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignorer l'erreur réseau éventuelle lors du logout
    } finally {
      localStorage.removeItem('bca_access_token');
      localStorage.removeItem('bca_user');
      setUser(null);
      window.location.href = '/';
    }
  };

  /**
   * Met à jour les informations locales du profil
   */
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('bca_user', JSON.stringify(updatedUser));
  };

  /**
   * Vérifie si l'utilisateur possède l'un des rôles demandés
   */
  const hasRole = (...roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l’intérieur d’un AuthProvider');
  }
  return context;
};
