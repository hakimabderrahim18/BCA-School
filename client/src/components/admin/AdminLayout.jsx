import React, { useState } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  GraduationCap,
  CalendarRange,
  UserCheck,
  Briefcase,
  Award,
  FileText,
  Megaphone,
  Building2,
  Tag,
  Newspaper,
  Layers,
  Calendar,
  CheckSquare,
  Image as ImageIcon,
  Mail,
  MessageSquareQuote,
  Handshake,
  Settings,
  Users,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ChevronRight,
  Shield,
} from 'lucide-react';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isEditor = user?.role === 'editor';

  const NAV_SECTIONS = [
    {
      title: "Vue d'ensemble",
      items: [
        { label: 'Tableau de bord', to: '/admin', icon: LayoutDashboard, exact: true },
      ],
    },
    {
      title: 'Pédagogie & Formation',
      items: [
        { label: 'Formations', to: '/admin/formations', icon: GraduationCap },
        { label: 'Sessions & Calendrier', to: '/admin/sessions', icon: CalendarRange },
        { label: 'Préinscriptions', to: '/admin/preinscriptions', icon: UserCheck },
      ],
    },
    {
      title: 'Prestations & Devis',
      items: [
        { label: 'Prestations Services', to: '/admin/prestations', icon: Briefcase },
        { label: 'Réalisations', to: '/admin/realisations', icon: Award },
        { label: 'Demandes de Devis', to: '/admin/devis', icon: FileText },
      ],
    },
    {
      title: 'Régie & Annonces',
      items: [
        { label: 'Bannières Pub', to: '/admin/bannieres', icon: Megaphone },
        { label: 'Annuaire Annonceurs', to: '/admin/annonceurs', icon: Building2 },
        { label: 'Petites Annonces', to: '/admin/petites-annonces', icon: Tag },
      ],
    },
    {
      title: 'Contenus & Médias',
      items: [
        { label: 'Articles d’actualité', to: '/admin/articles', icon: Newspaper },
        { label: 'Catégories', to: '/admin/categories', icon: Layers },
        { label: 'Agenda & Événements', to: '/admin/evenements', icon: Calendar },
        { label: 'Propositions d’événements', to: '/admin/evenements-propositions', icon: CheckSquare },
        { label: 'Galerie & Albums', to: '/admin/galerie', icon: ImageIcon },
      ],
    },
    {
      title: 'Relations & Paramètres',
      items: [
        { label: 'Messages de contact', to: '/admin/messages', icon: Mail },
        { label: 'Témoignages & Avis', to: '/admin/temoignages', icon: MessageSquareQuote },
        { label: 'Partenaires & Logos', to: '/admin/partenaires', icon: Handshake },
        { label: 'Paramètres du site', to: '/admin/parametres', icon: Settings },
        ...(isAdmin
          ? [{ label: 'Comptes Utilisateurs', to: '/admin/utilisateurs', icon: Users }]
          : []),
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row text-slate-800">
      {/* Mobile Header Bar */}
      <div className="lg:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <Link to="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500 text-white font-black flex items-center justify-center text-sm">
            B
          </div>
          <span className="font-extrabold text-base tracking-tight">B.C.A. Admin</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 text-white font-black flex items-center justify-center text-lg shadow-md">
              B
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-tight block">
                B.C.A. Admin
              </span>
              <span className="text-[11px] text-amber-400 font-medium block">
                Centre & Communication
              </span>
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items (Scrollable) */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-6 text-xs">
          {NAV_SECTIONS.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                {section.title}
              </span>
              <div className="mt-1 space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? location.pathname === item.to
                    : location.pathname.startsWith(item.to);

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition ${
                        isActive
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Card & Logout Bottom */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-slate-800 text-amber-400 font-bold flex items-center justify-center shrink-0 border border-slate-700">
                {(user?.name || user?.firstName || 'A').charAt(0)}
              </div>
              <div className="truncate">
                <span className="block text-xs font-bold text-white truncate">
                  {user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Administrateur'}
                </span>
                <span className="block text-[10px] text-slate-400 uppercase tracking-wider">
                  {user?.role}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              title="Déconnexion"
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile sidebar */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="hidden lg:flex bg-white border-b border-slate-200 px-8 py-3.5 items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="font-semibold text-slate-800">Panneau de Contrôle</span>
            <span>/</span>
            <span className="text-slate-600 capitalize">
              {location.pathname.replace('/admin', '').replace('/', '') || 'Tableau de bord'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Voir le site public
            </Link>

            <div className="h-4 w-px bg-slate-200" />

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-700">
                {user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Administrateur'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-brand-50 text-brand-700 border border-brand-200">
                {user?.role}
              </span>
            </div>

            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dynamic Page Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
