import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { SEOHelmet } from '../../components/common/SEOHelmet';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Lock, Mail, ArrowLeft, ShieldCheck, UserCheck } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const from = location.state?.from?.pathname || '/admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!identifier || !password) {
      setErrorMsg('Veuillez renseigner votre adresse e-mail ou votre numéro de téléphone ainsi que votre mot de passe.');
      return;
    }

    try {
      setLoading(true);
      await login(identifier, password);
      showToast('Connexion réussie. Bienvenue sur le panneau B.C.A. !', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Erreur authentification:', err);
      const msg =
        err.response?.data?.message ||
        'Identifiants incorrects ou compte suspendu. Veuillez vérifier vos accès.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <SEOHelmet title="Connexion Administration - B.C.A. Tiaret" />

      <div className="max-w-md w-full">
        {/* Back link */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Retourner au site public
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 text-white font-black flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg shadow-brand-600/30">
              B
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Espace Administration
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Centre de Formation & Agence de Communication B.C.A.
            </p>
          </div>

          {/* Error notice */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs leading-relaxed animate-shake">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="E-mail ou Téléphone"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="admin@bca-tiaret.dz ou 0550000000"
              icon={UserCheck}
              autoComplete="username"
              required
            />

            <Input
              label="Mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              icon={Lock}
              autoComplete="current-password"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full justify-center shadow-lg shadow-brand-600/20"
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              Se connecter au panneau
            </Button>
          </form>

          {/* Footer note */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Accès réservé exclusivement aux gestionnaires et formateurs habilités du centre B.C.A. à Tiaret. Toutes les connexions sont auditées et journalisées.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
