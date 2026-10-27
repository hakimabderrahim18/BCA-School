import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { PublicLayout } from './components/layout/PublicLayout';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { Button } from './components/common/Button';
import { SEOHelmet } from './components/common/SEOHelmet';

// ============================================================================
// Lazy loading des pages publiques
// ============================================================================
const Home = lazy(() => import('./pages/public/Home'));
const About = lazy(() => import('./pages/public/About'));
const Formations = lazy(() => import('./pages/public/Formations'));
const FormationDetail = lazy(() => import('./pages/public/FormationDetail'));
const Prestations = lazy(() => import('./pages/public/Prestations'));
const PrestationDetail = lazy(() => import('./pages/public/PrestationDetail'));
const Actualites = lazy(() => import('./pages/public/Actualites'));
const ArticleDetail = lazy(() => import('./pages/public/ArticleDetail'));
const Evenements = lazy(() => import('./pages/public/Evenements'));
const EvenementDetail = lazy(() => import('./pages/public/EvenementDetail'));
const AnnoncesPublicite = lazy(() => import('./pages/public/AnnoncesPublicite'));
const AnnonceurDetail = lazy(() => import('./pages/public/AnnonceurDetail'));
const Galerie = lazy(() => import('./pages/public/Galerie'));
const Contact = lazy(() => import('./pages/public/Contact'));
const MentionsLegales = lazy(() => import('./pages/public/MentionsLegales'));
const Confidentialite = lazy(() => import('./pages/public/Confidentialite'));

// ============================================================================
// Lazy loading du panneau d'administration
// ============================================================================
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const FormationsManager = lazy(() => import('./pages/admin/FormationsManager'));
const SessionsManager = lazy(() => import('./pages/admin/SessionsManager'));
const PreinscriptionsManager = lazy(() => import('./pages/admin/PreinscriptionsManager'));
const PrestationsManager = lazy(() => import('./pages/admin/PrestationsManager'));
const RealisationsManager = lazy(() => import('./pages/admin/RealisationsManager'));
const QuotesManager = lazy(() => import('./pages/admin/QuotesManager'));
const ArticlesManager = lazy(() => import('./pages/admin/ArticlesManager'));
const CategoriesManager = lazy(() => import('./pages/admin/CategoriesManager'));
const EventsManager = lazy(() => import('./pages/admin/EventsManager'));
const EventProposalsManager = lazy(() => import('./pages/admin/EventProposalsManager'));
const AnnonceursManager = lazy(() => import('./pages/admin/AnnonceursManager'));
const PetitesAnnoncesManager = lazy(() => import('./pages/admin/PetitesAnnoncesManager'));
const AdSlotsManager = lazy(() => import('./pages/admin/AdSlotsManager'));
const GalleryManager = lazy(() => import('./pages/admin/GalleryManager'));
const ContactMessagesManager = lazy(() => import('./pages/admin/ContactMessagesManager'));
const TestimonialsManager = lazy(() => import('./pages/admin/TestimonialsManager'));
const PartnersManager = lazy(() => import('./pages/admin/PartnersManager'));
const SettingsManager = lazy(() => import('./pages/admin/SettingsManager'));
const UsersManager = lazy(() => import('./pages/admin/UsersManager'));

// Indicateur visuel de chargement fluide
const PageLoader = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center p-8">
    <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4" />
    <p className="text-sm font-semibold text-slate-500 animate-pulse">Chargement de la page...</p>
  </div>
);

// Page 404 Not Found
const NotFound = () => (
  <div className="min-h-[60vh] flex items-center justify-center px-4 py-20 text-center">
    <SEOHelmet title="Page introuvable (404) - B.C.A. Tiaret" />
    <div className="max-w-md mx-auto">
      <span className="text-6xl font-extrabold text-brand-600 block mb-2">404</span>
      <h1 className="text-2xl font-bold text-slate-900 mb-3">Page introuvable</h1>
      <p className="text-sm text-slate-500 mb-6">
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Button to="/" variant="accent" size="md">
        Revenir à la page d'accueil
      </Button>
    </div>
  </div>
);

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <ToastProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* ========================================================= */}
              {/* ROUTES PUBLIQUES (Header, Footer, WhatsApp flottant)       */}
              {/* ========================================================= */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<Home />} />
                <Route path="a-propos" element={<About />} />
                <Route path="formations" element={<Formations />} />
                <Route path="formations/:slug" element={<FormationDetail />} />
                <Route path="prestations" element={<Prestations />} />
                <Route path="prestations/:slug" element={<PrestationDetail />} />
                <Route path="actualites" element={<Actualites />} />
                <Route path="actualites/:slug" element={<ArticleDetail />} />
                <Route path="evenements" element={<Evenements />} />
                <Route path="evenements/:slug" element={<EvenementDetail />} />
                <Route path="annonces-publicite" element={<AnnoncesPublicite />} />
                <Route path="annonces-publicite/:slug" element={<AnnonceurDetail />} />
                <Route path="galerie" element={<Galerie />} />
                <Route path="contact" element={<Contact />} />
                <Route path="mentions-legales" element={<MentionsLegales />} />
                <Route path="confidentialite" element={<Confidentialite />} />
                <Route path="*" element={<NotFound />} />
              </Route>

              {/* ========================================================= */}
              {/* AUTHENTIFICATION ADMIN                                    */}
              {/* ========================================================= */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* ========================================================= */}
              {/* PANNEAU D'ADMINISTRATION PROTÉGÉ (/admin)                */}
              {/* ========================================================= */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="formations" element={<FormationsManager />} />
                <Route path="sessions" element={<SessionsManager />} />
                <Route path="preinscriptions" element={<PreinscriptionsManager />} />
                <Route path="prestations" element={<PrestationsManager />} />
                <Route path="realisations" element={<RealisationsManager />} />
                <Route path="devis" element={<QuotesManager />} />
                <Route path="articles" element={<ArticlesManager />} />
                <Route path="categories" element={<CategoriesManager />} />
                <Route path="evenements" element={<EventsManager />} />
                <Route path="evenements-propositions" element={<EventProposalsManager />} />
                <Route path="annonceurs" element={<AnnonceursManager />} />
                <Route path="petites-annonces" element={<PetitesAnnoncesManager />} />
                <Route path="bannieres" element={<AdSlotsManager />} />
                <Route path="galerie" element={<GalleryManager />} />
                <Route path="messages" element={<ContactMessagesManager />} />
                <Route path="temoignages" element={<TestimonialsManager />} />
                <Route path="partenaires" element={<PartnersManager />} />
                <Route path="parametres" element={<SettingsManager />} />
                <Route
                  path="utilisateurs"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <UsersManager />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </Suspense>
        </ToastProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}
