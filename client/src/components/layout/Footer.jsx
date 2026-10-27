import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  Linkedin,
  Send,
  ArrowUpRight,
  Shield,
} from 'lucide-react';
import { Button } from '../common/Button';

export const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    alert('Merci de votre inscription à notre lettre d’information !');
  };

  return (
    <footer className="bg-brand-950 text-slate-300 border-t border-brand-900 mt-auto">
      {/* Section Principale */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Colonne 1 : Présentation B.C.A. */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3 group inline-block">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-500 flex items-center justify-center text-white font-extrabold text-xl shadow-md">
                B
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-white block leading-none">
                  B.C.A.
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-1">
                  Tiaret, Algérie
                </span>
              </div>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed">
              {t('footer.about_text')}
            </p>

            {/* Réseaux Sociaux */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-brand-900 hover:bg-brand-600 text-slate-300 hover:text-white flex items-center justify-center transition"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-brand-900 hover:bg-brand-600 text-slate-300 hover:text-white flex items-center justify-center transition"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-brand-900 hover:bg-brand-600 text-slate-300 hover:text-white flex items-center justify-center transition"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Colonne 2 : Liens Rapides */}
          <div>
            <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-5">
              {t('footer.quick_links')}
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/formations" className="hover:text-accent-400 transition flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t('nav.courses')}</span>
                </Link>
              </li>
              <li>
                <Link to="/prestations" className="hover:text-accent-400 transition flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t('nav.services')}</span>
                </Link>
              </li>
              <li>
                <Link to="/actualites" className="hover:text-accent-400 transition flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t('nav.news')}</span>
                </Link>
              </li>
              <li>
                <Link to="/evenements" className="hover:text-accent-400 transition flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t('nav.events')}</span>
                </Link>
              </li>
              <li>
                <Link to="/annonces-publicite" className="hover:text-accent-400 transition flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t('nav.ads')}</span>
                </Link>
              </li>
              <li>
                <Link to="/galerie" className="hover:text-accent-400 transition flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t('nav.gallery')}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 3 : Coordonnées de contact */}
          <div>
            <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-5">
              {t('contact.our_coordinates')}
            </h3>
            <ul className="space-y-3.5 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-accent-400 shrink-0 mt-0.5" />
                <span>Cité Administrative, Boulevard Principal, Tiaret (14)</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-accent-400 shrink-0" />
                <a href="tel:+213550000000" className="hover:text-white transition" dir="ltr">
                  0550 00 00 00 / 046 45 00 00
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-accent-400 shrink-0" />
                <a href="mailto:contact@bca-tiaret.dz" className="hover:text-white transition">
                  contact@bca-tiaret.dz
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-accent-400 shrink-0 mt-0.5" />
                <span>Samedi au Jeudi : 08h30 - 17h00</span>
              </li>
            </ul>
          </div>

          {/* Colonne 4 : Newsletter & Inscription */}
          <div>
            <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-5">
              {t('footer.newsletter_title')}
            </h3>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              {t('footer.newsletter_desc')}
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2.5">
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder={t('footer.newsletter_placeholder')}
                  className="w-full rounded-xl bg-brand-900 border border-brand-800 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-400 transition"
                />
              </div>
              <Button type="submit" variant="accent" size="sm" className="w-full" rightIcon={<Send className="w-3.5 h-3.5" />}>
                {t('actions.submit')}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Barre Inférieure (Copyright & Mentions Légales) */}
      <div className="border-t border-brand-900 bg-brand-950/80 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {currentYear} B.C.A. Tiaret. {t('footer.rights')}
          </div>

          <div className="flex items-center gap-6">
            <Link to="/mentions-legales" className="hover:text-slate-300 transition">
              {t('footer.legal')}
            </Link>
            <Link to="/confidentialite" className="hover:text-slate-300 transition">
              {t('footer.privacy')}
            </Link>
            <Link to="/admin/login" className="hover:text-amber-400 text-slate-400 font-medium transition flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-amber-500" />
              <span>Espace Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
