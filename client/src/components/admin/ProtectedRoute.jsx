import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../common/Button';

/**
 * Garde de route sécurisé pour l'administration (/admin)
 * Vérifie l'authentification et les permissions par rôle
 */
export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-white rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-400 font-medium animate-pulse">
          Vérification des accès administrateur...
        </p>
      </div>
    );
  }

  // Redirection vers /admin/login si non connecté
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Vérification des privilèges par rôle
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Accès Non Autorisé</h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Votre profil actuel (<strong>{user.role}</strong>) ne dispose pas des droits requis pour accéder à ce module d'administration.
          </p>
          <div className="flex flex-col gap-2">
            <Button to="/admin" variant="primary" size="md">
              Retour au tableau de bord
            </Button>
            <Button to="/" variant="outline" size="sm">
              Aller sur le site public
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
