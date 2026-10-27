import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { SEOHelmet } from '../../components/common/SEOHelmet';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { Button } from '../../components/common/Button';
import {
  GraduationCap,
  Mail,
  FileText,
  CheckSquare,
  Tag,
  Newspaper,
  Calendar,
  Building2,
  Users,
  Megaphone,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Clock,
  Plus,
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/dashboard/stats');
        setStats(res.data.data);
      } catch (err) {
        console.error('Erreur chargement statistiques dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-28 bg-slate-200 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const counts = stats?.counts || {
    formations: 0,
    articles: 0,
    events: 0,
    annonceurs: 0,
    adSlots: 0,
    users: 0,
  };

  const pending = stats?.pending || {
    inscriptions: 0,
    messages: 0,
    quotes: 0,
    proposals: 0,
    petitesAnnonces: 0,
  };

  const recent = stats?.recent || {
    inscriptions: [],
    messages: [],
    quotes: [],
  };

  return (
    <div className="space-y-8">
      <SEOHelmet title="Tableau de bord - B.C.A. Admin" />

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full inline-block mb-2">
            Espace d'administration B.C.A.
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Bonjour, {user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Directeur'} !
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
            Voici l'état des activités de votre centre à Tiaret. Consultez vos demandes en attente, gérez les inscriptions et publiez de nouveaux contenus.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
          <Button to="/admin/formations" variant="accent" size="sm">
            <Plus className="w-4 h-4 mr-1.5" /> Nouvelle formation
          </Button>
          <Button to="/admin/articles" variant="outline" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
            <Plus className="w-4 h-4 mr-1.5" /> Rédiger un article
          </Button>
        </div>
      </div>

      {/* Urgent Action Badges (Items needing attention) */}
      {(pending.inscriptions > 0 ||
        pending.messages > 0 ||
        pending.quotes > 0 ||
        pending.proposals > 0 ||
        pending.petitesAnnonces > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3 text-amber-800 font-bold text-sm">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Actions prioritaires requises :</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {pending.inscriptions > 0 && (
              <Link
                to="/admin/preinscriptions"
                className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-amber-300 text-xs font-semibold text-slate-800 hover:border-brand-500 shadow-xs transition"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                {pending.inscriptions} nouvelle(s) préinscription(s)
              </Link>
            )}

            {pending.messages > 0 && (
              <Link
                to="/admin/messages"
                className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-amber-300 text-xs font-semibold text-slate-800 hover:border-brand-500 shadow-xs transition"
              >
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                {pending.messages} message(s) de contact non lu(s)
              </Link>
            )}

            {pending.quotes > 0 && (
              <Link
                to="/admin/devis"
                className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-amber-300 text-xs font-semibold text-slate-800 hover:border-brand-500 shadow-xs transition"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {pending.quotes} demande(s) de devis en attente
              </Link>
            )}

            {pending.proposals > 0 && (
              <Link
                to="/admin/evenements-propositions"
                className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-amber-300 text-xs font-semibold text-slate-800 hover:border-brand-500 shadow-xs transition"
              >
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                {pending.proposals} événement(s) proposé(s) à valider
              </Link>
            )}

            {pending.petitesAnnonces > 0 && (
              <Link
                to="/admin/petites-annonces"
                className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-amber-300 text-xs font-semibold text-slate-800 hover:border-brand-500 shadow-xs transition"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                {pending.petitesAnnonces} petite(s) annonce(s) à modérer
              </Link>
            )}
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Formations */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Formations
            </span>
            <span className="text-3xl font-black text-slate-900 block mt-1">
              {counts.formations}
            </span>
            <Link
              to="/admin/formations"
              className="text-xs font-semibold text-brand-600 hover:underline inline-flex items-center mt-2"
            >
              Gérer le catalogue <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-brand-600 flex items-center justify-center">
            <GraduationCap className="w-7 h-7" />
          </div>
        </div>

        {/* Card 2: Actualités */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Articles & News
            </span>
            <span className="text-3xl font-black text-slate-900 block mt-1">
              {counts.articles}
            </span>
            <Link
              to="/admin/articles"
              className="text-xs font-semibold text-brand-600 hover:underline inline-flex items-center mt-2"
            >
              Tous les articles <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Newspaper className="w-7 h-7" />
          </div>
        </div>

        {/* Card 3: Événements */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Événements
            </span>
            <span className="text-3xl font-black text-slate-900 block mt-1">
              {counts.events}
            </span>
            <Link
              to="/admin/evenements"
              className="text-xs font-semibold text-brand-600 hover:underline inline-flex items-center mt-2"
            >
              Agenda local <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Calendar className="w-7 h-7" />
          </div>
        </div>

        {/* Card 4: Annonceurs */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Annonceurs
            </span>
            <span className="text-3xl font-black text-slate-900 block mt-1">
              {counts.annonceurs}
            </span>
            <Link
              to="/admin/annonceurs"
              className="text-xs font-semibold text-brand-600 hover:underline inline-flex items-center mt-2"
            >
              Annuaire local <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Building2 className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Recent Activity Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Table 1: Dernières Préinscriptions */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center">
              <GraduationCap className="w-5 h-5 mr-2 text-brand-600" />
              Dernières Préinscriptions
            </h2>
            <Link
              to="/admin/preinscriptions"
              className="text-xs font-semibold text-brand-600 hover:underline"
            >
              Voir tout ({pending.inscriptions} nouveaux)
            </Link>
          </div>

          {recent.inscriptions.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              Aucune préinscription récente enregistrée.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {recent.inscriptions.map((item) => (
                <div key={item._id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-800 block">{item.fullName}</span>
                    <span className="text-slate-500 block truncate max-w-xs">
                      {item.formation?.title || 'Formation générale'}
                    </span>
                    <span className="text-[11px] text-slate-400">{item.phone}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <StatusBadge status={item.status} />
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Table 2: Derniers Messages de Contact */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center">
              <Mail className="w-5 h-5 mr-2 text-brand-600" />
              Derniers Messages Reçus
            </h2>
            <Link
              to="/admin/messages"
              className="text-xs font-semibold text-brand-600 hover:underline"
            >
              Voir tout ({pending.messages} non lus)
            </Link>
          </div>

          {recent.messages.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              Aucun message de contact dans la boîte de réception.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {recent.messages.map((item) => (
                <div key={item._id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-800 block">{item.fullName}</span>
                    <span className="text-slate-600 font-medium block truncate max-w-xs">
                      {item.subject}
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate max-w-xs">
                      {item.message}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <StatusBadge status={item.status} />
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Quick Links */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Accès Rapide aux Modules</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <Link
            to="/admin/sessions"
            className="p-4 rounded-2xl bg-slate-50 hover:bg-brand-50 hover:text-brand-700 transition text-center text-xs font-semibold flex flex-col items-center gap-2"
          >
            <Clock className="w-5 h-5 text-brand-600" />
            <span>Sessions</span>
          </Link>
          <Link
            to="/admin/prestations"
            className="p-4 rounded-2xl bg-slate-50 hover:bg-brand-50 hover:text-brand-700 transition text-center text-xs font-semibold flex flex-col items-center gap-2"
          >
            <FileText className="w-5 h-5 text-amber-600" />
            <span>Prestations</span>
          </Link>
          <Link
            to="/admin/bannieres"
            className="p-4 rounded-2xl bg-slate-50 hover:bg-brand-50 hover:text-brand-700 transition text-center text-xs font-semibold flex flex-col items-center gap-2"
          >
            <Megaphone className="w-5 h-5 text-purple-600" />
            <span>Bannières Pub</span>
          </Link>
          <Link
            to="/admin/categories"
            className="p-4 rounded-2xl bg-slate-50 hover:bg-brand-50 hover:text-brand-700 transition text-center text-xs font-semibold flex flex-col items-center gap-2"
          >
            <Tag className="w-5 h-5 text-emerald-600" />
            <span>Catégories</span>
          </Link>
          <Link
            to="/admin/galerie"
            className="p-4 rounded-2xl bg-slate-50 hover:bg-brand-50 hover:text-brand-700 transition text-center text-xs font-semibold flex flex-col items-center gap-2"
          >
            <Users className="w-5 h-5 text-rose-600" />
            <span>Albums Photos</span>
          </Link>
          <Link
            to="/admin/parametres"
            className="p-4 rounded-2xl bg-slate-50 hover:bg-brand-50 hover:text-brand-700 transition text-center text-xs font-semibold flex flex-col items-center gap-2"
          >
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>Paramètres</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
