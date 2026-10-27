import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Phone,
  Clock,
  Menu,
  X,
  Globe,
  User,
  LogOut,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

export const Header = () => {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Détecte le défilement pour ajouter une ombre portée moderne à la navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Ferme le menu mobile lors d'un changement de route
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleLanguage = () => {
    const current = (i18n.language || 'fr').toLowerCase();
    const nextLang = current.startsWith('ar') ? 'fr' : 'ar';
    i18n.changeLanguage(nextLang);
  };

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/a-propos', label: t('nav.about') },
    { to: '/formations', label: t('nav.courses') },
    { to: '/prestations', label: t('nav.services') },
    { to: '/actualites', label: t('nav.news') },
    { to: '/evenements', label: t('nav.events') },
    { to: '/annonces-publicite', label: t('nav.ads') },
    { to: '/galerie', label: t('nav.gallery') },
    { to: '/contact', label: t('nav.contact') },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white transition-all duration-200">
      {/* 1. Barre supérieure (Top Bar) d'informations et accès rapide */}
      <div className="bg-brand-950 text-slate-300 text-xs py-2 px-4 sm:px-6 lg:px-8 border-b border-brand-900">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <a
              href="tel:+213550000000"
              className="flex items-center gap-1.5 hover:text-white transition"
              dir="ltr"
            >
              <Phone className="w-3.5 h-3.5 text-accent-400" />
              <span>{t('topbar.phone')}</span>
            </a>
            <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-accent-400" />
              <span>{t('topbar.hours')}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Bouton de changement de langue FR / AR */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-900 hover:bg-brand-800 text-white font-semibold transition"
              title="Changer de langue"
            >
              <Globe className="w-3.5 h-3.5 text-accent-400" />
              <span>{t('topbar.switch_lang')}</span>
            </button>

            {/* Lien d'administration / Compte utilisateur */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 text-accent-400 hover:text-accent-300 font-semibold transition"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{user?.name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-slate-400 hover:text-rose-400 transition"
                  title={t('nav.logout')}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                to="/admin/login"
                className="text-slate-400 hover:text-white transition"
              >
                {t('topbar.admin_login')}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 2. Barre de navigation principale */}
      <div
        className={`px-4 sm:px-6 lg:px-8 transition-shadow duration-300 ${
          isScrolled ? 'shadow-md border-b border-slate-100' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-20">
          {/* Logo B.C.A. */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-950 via-brand-800 to-brand-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md group-hover:scale-105 transition-transform">
              B
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-brand-950 block leading-none">
                B.C.A.
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mt-1">
                Formation & Communication
              </span>
            </div>
          </Link>

          {/* Liens de navigation Desktop */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? 'text-brand-600 bg-brand-50'
                      : 'text-slate-700 hover:text-brand-600 hover:bg-slate-50'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Bouton d'action rapide (S'inscrire) */}
          <div className="hidden lg:flex items-center gap-3">
            <Button
              to="/formations"
              variant="accent"
              size="md"
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              {t('actions.register')}
            </Button>
          </div>

          {/* Bouton menu mobile (Hamburger) */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 transition focus:outline-none"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-slate-900" />
              ) : (
                <Menu className="w-6 h-6 text-slate-900" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Menu Déroulant Mobile */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[113px] bottom-0 bg-white z-40 border-t border-slate-200 overflow-y-auto px-6 py-6 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center justify-between p-3.5 rounded-xl text-base font-semibold transition ${
                    isActive
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-slate-800 hover:bg-slate-50'
                  }`
                }
              >
                <span>{link.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-400 rtl:rotate-180" />
              </NavLink>
            ))}

            <div className="pt-6 mt-4 border-t border-slate-100 flex flex-col gap-3">
              <Button
                to="/formations"
                variant="accent"
                size="lg"
                className="w-full"
              >
                {t('actions.register')}
              </Button>
              <Button
                to="/contact"
                variant="outline"
                size="lg"
                className="w-full"
              >
                {t('actions.contact_us')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
