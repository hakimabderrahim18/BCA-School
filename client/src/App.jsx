import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { PublicLayout } from './components/layout/PublicLayout';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { Button } from './components/common/Button';
import { SEOHelmet } from './components/common/SEOHelmet';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Lazy loading résilient aux déploiements (évite les erreurs "Failed to fetch dynamically imported module")
const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    try {
      const component = await componentImport();
      sessionStorage.removeItem('bca_chunk_load_failed');
      return component;
    } catch (error) {
      const isChunkError =
        error?.message?.includes('dynamically imported module') ||
        error?.message?.includes('Loading chunk') ||
        error?.message?.includes('Failed to fetch');

      if (isChunkError) {
        const alreadyReloaded = sessionStorage.getItem('bca_chunk_load_failed');
        if (!alreadyReloaded) {
          sessionStorage.setItem('bca_chunk_load_failed', 'true');
          window.location.reload();
          return new Promise(() => {});
        }
      }
      throw error;
    }
  });

// ============================================================================
// Lazy loading des pages publiques
// ============================================================================
const Home = lazyWithRetry(() => import('./pages/public/Home'));
const About = lazyWithRetry(() => import('./pages/public/About'));
const Formations = lazyWithRetry(() => import('./pages/public/Formations'));
const FormationDetail = lazyWithRetry(() => import('./pages/public/FormationDetail'));
const Prestations = lazyWithRetry(() => import('./pages/public/Prestations'));
const PrestationDetail = lazyWithRetry(() => import('./pages/public/PrestationDetail'));
const Actualites = lazyWithRetry(() => import('./pages/public/Actualites'));
const ArticleDetail = lazyWithRetry(() => import('./pages/public/ArticleDetail'));
const Evenements = lazyWithRetry(() => import('./pages/public/Evenements'));
const EvenementDetail = lazyWithRetry(() => import('./pages/public/EvenementDetail'));
const AnnoncesPublicite = lazyWithRetry(() => import('./pages/public/AnnoncesPublicite'));
const AnnonceurDetail = lazyWithRetry(() => import('./pages/public/AnnonceurDetail'));
const Galerie = lazyWithRetry(() => import('./pages/public/Galerie'));
const Contact = lazyWithRetry(() => import('./pages/public/Contact'));
const MentionsLegales = lazyWithRetry(() => import('./pages/public/MentionsLegales'));
const Confidentialite = lazyWithRetry(() => import('./pages/public/Confidentialite'));

// ============================================================================
// Lazy loading du panneau d'administration
// ============================================================================
const AdminLogin = lazyWithRetry(() => import('./pages/admin/Login'));
const AdminLayout = lazyWithRetry(() => import('./components/admin/AdminLayout'));
const AdminDashboard = lazyWithRetry(() => import('./pages/admin/Dashboard'));
const FormationsManager = lazyWithRetry(() => import('./pages/admin/FormationsManager'));
const SessionsManager = lazyWithRetry(() => import('./pages/admin/SessionsManager'));
const PreinscriptionsManager = lazyWithRetry(() => import('./pages/admin/PreinscriptionsManager'));
const PrestationsManager = lazyWithRetry(() => import('./pages/admin/PrestationsManager'));
const RealisationsManager = lazyWithRetry(() => import('./pages/admin/RealisationsManager'));
const QuotesManager = lazyWithRetry(() => import('./pages/admin/QuotesManager'));
const ArticlesManager = lazyWithRetry(() => import('./pages/admin/ArticlesManager'));
const CategoriesManager = lazyWithRetry(() => import('./pages/admin/CategoriesManager'));
const EventsManager = lazyWithRetry(() => import('./pages/admin/EventsManager'));
const EventProposalsManager = lazyWithRetry(() => import('./pages/admin/EventProposalsManager'));
const AnnonceursManager = lazyWithRetry(() => import('./pages/admin/AnnonceursManager'));
const PetitesAnnoncesManager = lazyWithRetry(() => import('./pages/admin/PetitesAnnoncesManager'));
const AdSlotsManager = lazyWithRetry(() => import('./pages/admin/AdSlotsManager'));
const GalleryManager = lazyWithRetry(() => import('./pages/admin/GalleryManager'));
const ContactMessagesManager = lazyWithRetry(() => import('./pages/admin/ContactMessagesManager'));
const TestimonialsManager = lazyWithRetry(() => import('./pages/admin/TestimonialsManager'));
const PartnersManager = lazyWithRetry(() => import('./pages/admin/PartnersManager'));
const SettingsManager = lazyWithRetry(() => import('./pages/admin/SettingsManager'));
const UsersManager = lazyWithRetry(() => import('./pages/admin/UsersManager'));

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
      <ErrorBoundary>
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
    </ErrorBoundary>
  </HelmetProvider>
  );
}
