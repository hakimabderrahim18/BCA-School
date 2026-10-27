import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { SEOHelmet } from '../../components/common/SEOHelmet';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Lightbox } from '../../components/common/Lightbox';
import { ShareButtons } from '../../components/common/ShareButtons';
import { getImageUrl } from '../../utils/imageUrl';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  ArrowLeft,
  CheckCircle,
  ExternalLink,
  MessageCircle,
  Image as ImageIcon,
  Video,
  Share2,
} from 'lucide-react';

export const AnnonceurDetail = () => {
  const { slug } = useParams();
  const { t } = useTranslation();

  const [annonceur, setAnnonceur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    const fetchAnnonceur = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/annonceurs/${slug}`);
        setAnnonceur(res.data.data);
      } catch (err) {
        console.error('Erreur chargement annonceur:', err);
        setError('Impossible de charger la fiche de cet annonceur.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnonceur();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !annonceur) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Annonceur non trouvé</h1>
        <p className="text-slate-600 mb-6">{error || "Cet établissement n'est pas ou plus répertorié dans notre annuaire."}</p>
        <Button to="/annonces-publicite" variant="primary">
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour à l'annuaire
        </Button>
      </div>
    );
  }

  const galleryImages = (annonceur.gallery || []).map((img, idx) => ({
    url: img,
    title: `${annonceur.name} - Photo ${idx + 1}`,
  }));

  const openLightboxAt = (idx) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <SEOHelmet
        title={`${annonceur.name} - Annuaire B.C.A. Tiaret`}
        description={annonceur.shortDescription || `${annonceur.name}, entreprise partenaire à ${annonceur.commune || 'Tiaret'}.`}
        image={annonceur.logo}
      />

      {/* Cover / Header Banner */}
      <div className="relative bg-brand-900 h-64 md:h-80 overflow-hidden">
        {annonceur.coverImage ? (
          <img
            src={getImageUrl(annonceur.coverImage)}
            alt={annonceur.name}
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 opacity-90" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-black/30" />

        {/* Back Link */}
        <div className="absolute top-6 left-4 sm:left-8 z-10">
          <Link
            to="/annonces-publicite"
            className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Retour à l'annuaire
          </Link>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
            {/* Logo and Identity */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left">
              <div className="w-32 h-32 rounded-2xl bg-white p-2 shadow-lg border border-slate-200 overflow-hidden shrink-0 -mt-16 sm:-mt-20">
                {annonceur.logo ? (
                  <img
                    src={getImageUrl(annonceur.logo)}
                    alt={annonceur.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-3xl">
                    {annonceur.name.charAt(0)}
                  </div>
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {annonceur.name}
                  </h1>
                  {annonceur.isVerified && (
                    <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200" title="Établissement vérifié par B.C.A.">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> Partenaire vérifié
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-slate-500">
                  {annonceur.sector && (
                    <Badge variant="primary">
                      {annonceur.sector.name || annonceur.sector}
                    </Badge>
                  )}
                  {annonceur.commune && (
                    <span className="flex items-center text-slate-600">
                      <MapPin className="w-4 h-4 mr-1 text-brand-500" />
                      {annonceur.commune}, Wilaya de Tiaret
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3">
              {annonceur.phone && (
                <a
                  href={`tel:${annonceur.phone}`}
                  className="inline-flex items-center px-4 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 transition shadow-sm"
                >
                  <Phone className="w-4 h-4 mr-2" /> Appeler
                </a>
              )}
              {annonceur.whatsapp && (
                <a
                  href={`https://wa.me/${annonceur.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition shadow-sm"
                >
                  <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                </a>
              )}
              {annonceur.website && (
                <a
                  href={annonceur.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition"
                >
                  <Globe className="w-4 h-4 mr-2" /> Site web
                  <ExternalLink className="w-3.5 h-3.5 ml-1.5 opacity-60" />
                </a>
              )}
            </div>
          </div>

          {/* Grid Layout: Content & Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
            {/* Left 2 Cols: Presentation, Video, Gallery */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-brand-600" />
                  Présentation de l'établissement
                </h2>
                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-4">
                  {annonceur.description ? (
                    <div dangerouslySetInnerHTML={{ __html: annonceur.description }} />
                  ) : (
                    <p>{annonceur.shortDescription || 'Aucune description détaillée disponible.'}</p>
                  )}
                </div>
              </div>

              {/* Promotional Video */}
              {annonceur.videoUrl && (
                <div className="pt-4">
                  <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
                    <Video className="w-5 h-5 mr-2 text-red-500" />
                    Vidéo de présentation
                  </h3>
                  <div className="aspect-video rounded-2xl overflow-hidden bg-black shadow-md">
                    {annonceur.videoUrl.includes('youtube.com') || annonceur.videoUrl.includes('youtu.be') ? (
                      <iframe
                        src={
                          annonceur.videoUrl.includes('embed')
                            ? annonceur.videoUrl
                            : `https://www.youtube.com/embed/${annonceur.videoUrl.split('v=')[1]?.split('&')[0] || annonceur.videoUrl.split('/').pop()}`
                        }
                        title={annonceur.name}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video src={annonceur.videoUrl} controls className="w-full h-full object-cover" />
                    )}
                  </div>
                </div>
              )}

              {/* Photo Gallery */}
              {galleryImages.length > 0 && (
                <div className="pt-4">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center justify-between">
                    <span className="flex items-center">
                      <ImageIcon className="w-5 h-5 mr-2 text-brand-600" />
                      Galerie photos & réalisations ({galleryImages.length})
                    </span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {galleryImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => openLightboxAt(idx)}
                        className="group relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <img
                          src={getImageUrl(img.url)}
                          alt={img.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Sharing */}
              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <span className="text-sm font-semibold text-slate-700 flex items-center">
                  <Share2 className="w-4 h-4 mr-2 text-slate-500" /> Partager cette fiche :
                </span>
                <ShareButtons
                  title={`${annonceur.name} - Annuaire Tiaret`}
                  url={window.location.href}
                  description={annonceur.shortDescription}
                />
              </div>
            </div>

            {/* Right Col: Details Card, Hours, Address & Map */}
            <div className="space-y-6">
              {/* Practical Details */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-4">
                <h3 className="font-bold text-slate-900 text-base border-b border-slate-200 pb-3">
                  Coordonnées & Informations
                </h3>

                {annonceur.address && (
                  <div className="flex items-start text-sm">
                    <MapPin className="w-5 h-5 text-brand-600 mr-3 shrink-0 mt-0.5" />
                    <div>
                      <span className="block font-semibold text-slate-900">Adresse</span>
                      <span className="text-slate-600 leading-snug">{annonceur.address}</span>
                      {annonceur.commune && (
                        <span className="text-slate-500 block text-xs mt-0.5">
                          {annonceur.commune}, Tiaret
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {annonceur.phone && (
                  <div className="flex items-start text-sm">
                    <Phone className="w-5 h-5 text-brand-600 mr-3 shrink-0 mt-0.5" />
                    <div>
                      <span className="block font-semibold text-slate-900">Téléphone</span>
                      <a href={`tel:${annonceur.phone}`} className="text-brand-600 font-medium hover:underline">
                        {annonceur.phone}
                      </a>
                    </div>
                  </div>
                )}

                {annonceur.email && (
                  <div className="flex items-start text-sm">
                    <Mail className="w-5 h-5 text-brand-600 mr-3 shrink-0 mt-0.5" />
                    <div>
                      <span className="block font-semibold text-slate-900">E-mail</span>
                      <a href={`mailto:${annonceur.email}`} className="text-brand-600 hover:underline break-all">
                        {annonceur.email}
                      </a>
                    </div>
                  </div>
                )}

                {annonceur.openingHours && (
                  <div className="flex items-start text-sm pt-2 border-t border-slate-200">
                    <Clock className="w-5 h-5 text-amber-500 mr-3 shrink-0 mt-0.5" />
                    <div>
                      <span className="block font-semibold text-slate-900">Horaires d'ouverture</span>
                      <p className="text-slate-600 whitespace-pre-line text-xs mt-1 leading-relaxed">
                        {annonceur.openingHours}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Social Media Links */}
              {annonceur.socialLinks && Object.values(annonceur.socialLinks).some(Boolean) && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h4 className="font-bold text-slate-900 text-sm mb-3">Réseaux Sociaux</h4>
                  <div className="flex flex-wrap gap-2">
                    {annonceur.socialLinks.facebook && (
                      <a
                        href={annonceur.socialLinks.facebook}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition"
                      >
                        Facebook
                      </a>
                    )}
                    {annonceur.socialLinks.instagram && (
                      <a
                        href={annonceur.socialLinks.instagram}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-pink-50 text-pink-600 text-xs font-semibold hover:bg-pink-100 transition"
                      >
                        Instagram
                      </a>
                    )}
                    {annonceur.socialLinks.linkedin && (
                      <a
                        href={annonceur.socialLinks.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 text-xs font-semibold hover:bg-sky-100 transition"
                      >
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* CTA Box for Local Businesses */}
              <div className="bg-gradient-to-br from-brand-900 to-slate-900 text-white p-6 rounded-2xl shadow-md">
                <span className="text-amber-400 text-xs font-bold uppercase tracking-wider block mb-1">
                  Espace Professionnel
                </span>
                <h4 className="font-bold text-lg mb-2">Vous dirigez une entreprise à Tiaret ?</h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Boostez votre notoriété en intégrant l'annuaire de référence B.C.A. et touchez des milliers de clients locaux.
                </p>
                <Button to="/annonces-publicite" variant="accent" size="sm" className="w-full justify-center">
                  Découvrir nos offres publicitaires
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Component */}
      <Lightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={galleryImages}
        currentIndex={lightboxIndex}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
};

export default AnnonceurDetail;
