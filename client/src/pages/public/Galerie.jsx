import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { SEOHelmet } from '../../components/common/SEOHelmet';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Lightbox } from '../../components/common/Lightbox';
import { Pagination } from '../../components/common/Pagination';
import { getImageUrl } from '../../utils/imageUrl';
import {
  Image as ImageIcon,
  Video,
  Calendar,
  Layers,
  Eye,
  X,
  Play,
  ArrowRight,
  Filter,
} from 'lucide-react';

const THEMES = [
  { id: '', label: 'Tous les thèmes' },
  { id: 'formations', label: 'Formations & Ateliers' },
  { id: 'evenements', label: 'Événements & Séminaires' },
  { id: 'clients', label: 'Clients & Partenaires' },
  { id: 'vie_locale', label: 'Vie locale & Région' },
];

export const Galerie = () => {
  const { t } = useTranslation();

  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Selected Album details for the Modal
  const [activeAlbum, setActiveAlbum] = useState(null);
  const [loadingAlbum, setLoadingAlbum] = useState(false);

  // Lightbox for photos
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Active video player modal
  const [activeVideo, setActiveVideo] = useState(null);

  // Fetch albums when theme or page changes
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setLoading(true);
        const params = { page, limit: 9 };
        if (selectedTheme) params.theme = selectedTheme;

        const res = await api.get('/albums', { params });
        setAlbums(res.data.data || []);
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.totalPages || 1);
        }
      } catch (err) {
        console.error('Erreur chargement galerie:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, [selectedTheme, page]);

  // Open Album Modal and fetch its items
  const handleOpenAlbum = async (album) => {
    try {
      setLoadingAlbum(true);
      setActiveAlbum(album);
      const res = await api.get(`/albums/${album.slug}`);
      setActiveAlbum(res.data.data);
    } catch (err) {
      console.error('Erreur chargement détail album:', err);
    } finally {
      setLoadingAlbum(false);
    }
  };

  // Open Lightbox for photos inside an album
  const handleOpenPhotoLightbox = (photoIndex) => {
    if (!activeAlbum || !activeAlbum.mediaItems) return;

    const photosOnly = activeAlbum.mediaItems.filter((m) => m.type === 'photo');
    const formatted = photosOnly.map((p) => ({
      url: getImageUrl(p.url),
      title: p.title || activeAlbum.title,
      caption: p.caption,
    }));

    setLightboxImages(formatted);
    setLightboxIndex(photoIndex);
    setLightboxOpen(true);
  };

  const getThemeLabel = (themeId) => {
    const found = THEMES.find((th) => th.id === themeId);
    return found ? found.label : themeId;
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      <SEOHelmet
        title="Galerie Photos & Vidéos - B.C.A. Tiaret"
        description="Explorez nos albums photos et vidéos : promotions de stagiaires, sessions de formation, événements culturels et vie locale à Tiaret."
      />

      {/* Hero Header */}
      <section className="bg-brand-900 text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <Badge variant="accent" className="mb-4">
            Médiathèque
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Galerie Photos & Vidéos
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Revivez les temps forts du centre B.C.A., nos cérémonies de remise de diplômes, ateliers pratiques et reportages sur la région de Tiaret.
          </p>
        </div>
      </section>

      {/* Theme Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl p-3 shadow-md border border-slate-100 flex items-center justify-start sm:justify-center overflow-x-auto gap-2 no-scrollbar">
          {THEMES.map((theme) => {
            const isActive = selectedTheme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => {
                  setSelectedTheme(theme.id);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50'
                }`}
              >
                {theme.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Albums Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : albums.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-lg mx-auto">
            <ImageIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">Aucun album disponible</h3>
            <p className="text-sm text-slate-500 mb-6">
              Aucun album ne correspond au thème sélectionné pour le moment.
            </p>
            {selectedTheme && (
              <Button onClick={() => setSelectedTheme('')} variant="outline" size="sm">
                Réinitialiser le filtre
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {albums.map((album) => (
              <div
                key={album._id}
                onClick={() => handleOpenAlbum(album)}
                className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                {/* Cover Image */}
                <div className="relative aspect-video overflow-hidden bg-slate-100">
                  <img
                    src={getImageUrl(album.coverImage)}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                  {/* Top Badge Theme */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-white/90 text-slate-800 backdrop-blur-sm shadow-sm">
                      {getThemeLabel(album.theme)}
                    </span>
                  </div>

                  {/* Album Media Count */}
                  <div className="absolute bottom-3 right-3 text-white text-xs font-semibold flex items-center bg-black/50 px-2 py-1 rounded-lg backdrop-blur-sm">
                    <Layers className="w-3.5 h-3.5 mr-1" />
                    <span>{album.mediaCount || 'Voir'} médias</span>
                  </div>
                </div>

                {/* Info Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1 mb-2">
                      {album.title}
                    </h3>
                    {album.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                        {album.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {album.date ? new Date(album.date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : 'Récent'}
                    </span>
                    <span className="text-brand-600 font-bold group-hover:translate-x-1 transition-transform flex items-center">
                      Explorer <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </section>

      {/* Album Details Modal */}
      {activeAlbum && (
        <Modal
          isOpen={!!activeAlbum}
          onClose={() => setActiveAlbum(null)}
          title={activeAlbum.title}
          size="5xl"
        >
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Badge variant="primary">{getThemeLabel(activeAlbum.theme)}</Badge>
                {activeAlbum.date && (
                  <span className="text-xs text-slate-500 flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {new Date(activeAlbum.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {activeAlbum.mediaItems ? activeAlbum.mediaItems.length : 0} éléments au total
              </span>
            </div>

            {activeAlbum.description && (
              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                {activeAlbum.description}
              </p>
            )}

            {/* Media Items Grid */}
            {loadingAlbum ? (
              <div className="py-16 text-center">
                <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-500">Chargement des photos et vidéos...</p>
              </div>
            ) : !activeAlbum.mediaItems || activeAlbum.mediaItems.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Cet album ne contient pas encore de photos.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto pr-1">
                {activeAlbum.mediaItems.map((media, idx) => {
                  if (media.type === 'video') {
                    return (
                      <div
                        key={media._id || idx}
                        onClick={() => setActiveVideo(media)}
                        className="group relative aspect-video rounded-xl overflow-hidden bg-black cursor-pointer shadow-sm border border-slate-200"
                      >
                        <img
                          src={getImageUrl(media.thumbnail || activeAlbum.coverImage)}
                          alt={media.title || 'Vidéo'}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-90 group-hover:scale-105 transition-all"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-5 h-5 ml-0.5 fill-current" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 text-white text-[10px] font-semibold truncate bg-black/60 px-2 py-0.5 rounded">
                          {media.title || 'Vidéo'}
                        </div>
                      </div>
                    );
                  }

                  // Photo type
                  const photoOnlyIndex = activeAlbum.mediaItems
                    .filter((m) => m.type === 'photo')
                    .findIndex((p) => p._id === media._id);

                  return (
                    <div
                      key={media._id || idx}
                      onClick={() => handleOpenPhotoLightbox(photoOnlyIndex >= 0 ? photoOnlyIndex : 0)}
                      className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 cursor-pointer shadow-sm border border-slate-200"
                    >
                      <img
                        src={getImageUrl(media.url)}
                        alt={media.title || `Photo ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Eye className="w-6 h-6" />
                      </div>
                      {media.title && (
                        <div className="absolute bottom-1 left-1 right-1 text-white text-[10px] truncate bg-black/60 px-1.5 py-0.5 rounded">
                          {media.title}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Video Player Modal */}
      {activeVideo && (
        <Modal
          isOpen={!!activeVideo}
          onClose={() => setActiveVideo(null)}
          title={activeVideo.title || 'Lecture Vidéo'}
          size="4xl"
        >
          <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
            {activeVideo.embedUrl || (activeVideo.url && (activeVideo.url.includes('youtube') || activeVideo.url.includes('youtu.be'))) ? (
              <iframe
                src={
                  activeVideo.embedUrl ||
                  `https://www.youtube.com/embed/${activeVideo.url.split('v=')[1]?.split('&')[0] || activeVideo.url.split('/').pop()}`
                }
                title={activeVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video src={activeVideo.url} controls autoPlay className="w-full h-full object-contain" />
            )}
          </div>
          {activeVideo.caption && (
            <p className="mt-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
              {activeVideo.caption}
            </p>
          )}
        </Modal>
      )}

      {/* Photo Lightbox */}
      <Lightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={lightboxImages}
        currentIndex={lightboxIndex}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
};

export default Galerie;
