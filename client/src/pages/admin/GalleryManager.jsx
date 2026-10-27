import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { SEOHelmet } from '../../components/common/SEOHelmet';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Textarea } from '../../components/common/Textarea';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { ImageUploader } from '../../components/admin/ImageUploader';
import { getImageUrl } from '../../utils/imageUrl';
import {
  Image as ImageIcon,
  Plus,
  Edit2,
  Trash2,
  Layers,
  Upload,
  Video,
  Play,
  X,
} from 'lucide-react';

const ALBUM_THEMES = [
  { value: 'formations', label: 'Formations & Ateliers' },
  { value: 'evenements', label: 'Événements & Séminaires' },
  { value: 'clients', label: 'Clients & Partenaires' },
  { value: 'vie_locale', label: 'Vie locale & Région de Tiaret' },
  { value: 'autre', label: 'Autre' },
];

export const GalleryManager = () => {
  const { showToast } = useToast();

  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  // Album Modal
  const [albumModalOpen, setAlbumModalOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [submittingAlbum, setSubmittingAlbum] = useState(false);

  // Album Form
  const [albumForm, setAlbumForm] = useState({
    title: '',
    theme: 'formations',
    description: '',
    date: new Date().toISOString().split('T')[0],
    isFeatured: false,
  });
  const [albumCoverFile, setAlbumCoverFile] = useState(null);
  const [albumCoverPreview, setAlbumCoverPreview] = useState('');

  // Selected Album for Media Management
  const [activeAlbumDetails, setActiveAlbumDetails] = useState(null);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);

  // Add Media Item Form
  const [mediaType, setMediaType] = useState('photo');
  const [mediaTitle, setMediaTitle] = useState('');
  const [mediaVideoUrl, setMediaVideoUrl] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // Delete State
  const [deleteAlbumId, setDeleteAlbumId] = useState(null);
  const [deleteMediaId, setDeleteMediaId] = useState(null);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const res = await api.get('/albums', { params: { limit: 100 } });
      setAlbums(res.data.data || []);
    } catch (err) {
      console.error('Erreur chargement albums:', err);
      showToast('Impossible de charger les albums de la galerie.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  const handleOpenCreateAlbum = () => {
    setEditingAlbum(null);
    setAlbumForm({
      title: '',
      theme: 'formations',
      description: '',
      date: new Date().toISOString().split('T')[0],
      isFeatured: false,
    });
    setAlbumCoverFile(null);
    setAlbumCoverPreview('');
    setAlbumModalOpen(true);
  };

  const handleOpenEditAlbum = (album) => {
    setEditingAlbum(album);
    setAlbumForm({
      title: album.title || '',
      theme: album.theme || 'formations',
      description: album.description || '',
      date: album.date ? album.date.split('T')[0] : '',
      isFeatured: album.isFeatured ?? false,
    });
    setAlbumCoverFile(null);
    setAlbumCoverPreview(album.coverImage || '');
    setAlbumModalOpen(true);
  };

  const handleSubmitAlbum = async (e) => {
    e.preventDefault();
    if (!albumForm.title) {
      showToast('Le titre de l’album est obligatoire.', 'error');
      return;
    }

    try {
      setSubmittingAlbum(true);
      const data = new FormData();
      data.append('title', albumForm.title);
      data.append('theme', albumForm.theme);
      data.append('description', albumForm.description);
      data.append('date', albumForm.date);
      data.append('isFeatured', albumForm.isFeatured);

      if (albumCoverFile) {
        data.append('coverImage', albumCoverFile);
      }

      if (editingAlbum) {
        await api.put(`/albums/${editingAlbum._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('Album modifié.', 'success');
      } else {
        await api.post('/albums', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('Nouvel album créé avec succès.', 'success');
      }

      setAlbumModalOpen(false);
      fetchAlbums();
    } catch (err) {
      console.error('Erreur sauvegarde album:', err);
      showToast(err.response?.data?.message || 'Erreur lors de l’enregistrement.', 'error');
    } finally {
      setSubmittingAlbum(false);
    }
  };

  const handleDeleteAlbum = async () => {
    if (!deleteAlbumId) return;
    try {
      await api.delete(`/albums/${deleteAlbumId}`);
      showToast('Album supprimé.', 'success');
      setDeleteAlbumId(null);
      fetchAlbums();
    } catch (err) {
      console.error('Erreur suppression album:', err);
      showToast('Erreur lors de la suppression.', 'error');
    }
  };

  // Open Media Manager for an album
  const handleManageMedia = async (album) => {
    try {
      const res = await api.get(`/albums/${album.slug}`);
      setActiveAlbumDetails(res.data.data);
      setMediaModalOpen(true);
      setMediaTitle('');
      setMediaVideoUrl('');
      setMediaFile(null);
      setMediaPreview('');
    } catch (err) {
      console.error('Erreur chargement détails album:', err);
      showToast('Impossible de charger les médias de cet album.', 'error');
    }
  };

  const handleAddMedia = async (e) => {
    e.preventDefault();
    if (!activeAlbumDetails) return;

    try {
      setUploadingMedia(true);
      const data = new FormData();
      data.append('type', mediaType);
      data.append('title', mediaTitle);

      if (mediaType === 'video') {
        if (!mediaVideoUrl) {
          showToast('Veuillez renseigner le lien de la vidéo.', 'error');
          return;
        }
        data.append('url', mediaVideoUrl);
        data.append('videoProvider', mediaVideoUrl.includes('youtube') ? 'youtube' : 'local');
      } else {
        if (!mediaFile && !mediaPreview) {
          showToast('Veuillez sélectionner une photo.', 'error');
          return;
        }
        if (mediaFile) data.append('file', mediaFile);
      }

      await api.post(`/albums/${activeAlbumDetails._id}/media`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      showToast('Média ajouté avec succès !', 'success');
      setMediaTitle('');
      setMediaVideoUrl('');
      setMediaFile(null);
      setMediaPreview('');

      // Refresh album details
      const res = await api.get(`/albums/${activeAlbumDetails.slug}`);
      setActiveAlbumDetails(res.data.data);
      fetchAlbums();
    } catch (err) {
      console.error('Erreur ajout média:', err);
      showToast(err.response?.data?.message || 'Erreur lors de l’ajout du média.', 'error');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleDeleteMedia = async () => {
    if (!deleteMediaId || !activeAlbumDetails) return;
    try {
      await api.delete(`/albums/media/${deleteMediaId}`);
      showToast('Média supprimé.', 'success');
      setDeleteMediaId(null);
      const res = await api.get(`/albums/${activeAlbumDetails.slug}`);
      setActiveAlbumDetails(res.data.data);
      fetchAlbums();
    } catch (err) {
      console.error('Erreur suppression média:', err);
      showToast('Erreur lors de la suppression.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <SEOHelmet title="Gestion de la Galerie & Médias - B.C.A. Admin" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <ImageIcon className="w-6 h-6 mr-2 text-brand-600" />
            Galerie Photos & Vidéos
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gérez les albums de promotions, cérémonies et vidéos du centre B.C.A.
          </p>
        </div>
        <Button onClick={handleOpenCreateAlbum} variant="primary" size="md">
          <Plus className="w-4 h-4 mr-1.5" /> Créer un album
        </Button>
      </div>

      {/* Albums Grid */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Chargement des albums...</p>
          </div>
        ) : albums.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">Aucun album créé pour l'instant.</p>
            <Button onClick={handleOpenCreateAlbum} variant="outline" size="sm" className="mt-4">
              Créer le premier album
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map((album) => (
              <div
                key={album._id}
                className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex flex-col group shadow-xs hover:shadow-md transition"
              >
                <div className="relative aspect-video bg-slate-200 overflow-hidden">
                  <img
                    src={getImageUrl(album.coverImage)}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/90 text-slate-800 uppercase backdrop-blur-xs">
                      {album.theme}
                    </span>
                  </div>
                  <div className="absolute bottom-2 right-2 text-[11px] font-semibold text-white bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                    {album.mediaCount || 0} média(s)
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{album.title}</h3>
                    {album.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {album.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <Button
                      onClick={() => handleManageMedia(album)}
                      variant="outline"
                      size="sm"
                      className="text-xs py-1 px-2.5"
                    >
                      <Layers className="w-3.5 h-3.5 mr-1 text-brand-600" />
                      Gérer photos ({album.mediaCount || 0})
                    </Button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditAlbum(album)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-white"
                        title="Modifier"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteAlbumId(album._id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-white"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Album Create/Edit Modal */}
      <Modal
        isOpen={albumModalOpen}
        onClose={() => setAlbumModalOpen(false)}
        title={editingAlbum ? "Modifier l'album" : 'Créer un nouvel album'}
        size="lg"
      >
        <form onSubmit={handleSubmitAlbum} className="space-y-4">
          <Input
            label="Titre de l'album *"
            value={albumForm.title}
            onChange={(e) => setAlbumForm({ ...albumForm, title: e.target.value })}
            placeholder="ex. Remise des Diplômes Promotion 2025"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Thématique *"
              value={albumForm.theme}
              onChange={(e) => setAlbumForm({ ...albumForm, theme: e.target.value })}
              options={ALBUM_THEMES}
              required
            />
            <Input
              label="Date de l'événement"
              type="date"
              value={albumForm.date}
              onChange={(e) => setAlbumForm({ ...albumForm, date: e.target.value })}
            />
          </div>

          <Textarea
            label="Description de l'album"
            value={albumForm.description}
            onChange={(e) => setAlbumForm({ ...albumForm, description: e.target.value })}
            rows={2}
            placeholder="Contexte, promotion, date..."
          />

          <ImageUploader
            label="Photo de couverture de l'album *"
            previewUrl={albumCoverPreview}
            onFileSelect={(file) => setAlbumCoverFile(file)}
            onChange={(url) => setAlbumCoverPreview(url)}
          />

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-6 text-xs font-semibold text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={albumForm.isFeatured}
                onChange={(e) => setAlbumForm({ ...albumForm, isFeatured: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              Mettre en avant sur la page d'accueil
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button onClick={() => setAlbumModalOpen(false)} variant="ghost" size="sm">
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={submittingAlbum}>
              {editingAlbum ? 'Enregistrer' : 'Créer l’album'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Media Management Modal */}
      {activeAlbumDetails && (
        <Modal
          isOpen={mediaModalOpen}
          onClose={() => setMediaModalOpen(false)}
          title={`Photos & Vidéos : ${activeAlbumDetails.title}`}
          size="4xl"
        >
          <div className="space-y-6">
            {/* Add Media Section */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Ajouter une photo ou vidéo à cet album
              </h4>
              <form onSubmit={handleAddMedia} className="space-y-3">
                <div className="flex gap-4 text-xs font-bold text-slate-700">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="mediaType"
                      checked={mediaType === 'photo'}
                      onChange={() => setMediaType('photo')}
                      className="text-brand-600"
                    />
                    Photo (Fichier)
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="mediaType"
                      checked={mediaType === 'video'}
                      onChange={() => setMediaType('video')}
                      className="text-brand-600"
                    />
                    Vidéo (YouTube / Facebook / Lien)
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Titre / Légende du média"
                    value={mediaTitle}
                    onChange={(e) => setMediaTitle(e.target.value)}
                    placeholder="ex. Atelier pratique infographie"
                  />
                  {mediaType === 'video' ? (
                    <Input
                      label="Lien de la vidéo (YouTube ou MP4) *"
                      value={mediaVideoUrl}
                      onChange={(e) => setMediaVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      required
                    />
                  ) : (
                    <ImageUploader
                      label="Fichier image *"
                      previewUrl={mediaPreview}
                      onFileSelect={(file) => setMediaFile(file)}
                      onChange={(url) => setMediaPreview(url)}
                    />
                  )}
                </div>

                <div className="flex justify-end">
                  <Button type="submit" variant="primary" size="sm" loading={uploadingMedia}>
                    <Upload className="w-3.5 h-3.5 mr-1.5" /> Ajouter à l'album
                  </Button>
                </div>
              </form>
            </div>

            {/* List of existing media */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Médias contenus ({activeAlbumDetails.mediaItems?.length || 0})
              </h4>
              {!activeAlbumDetails.mediaItems || activeAlbumDetails.mediaItems.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  Aucun média présent dans cet album.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-1">
                  {activeAlbumDetails.mediaItems.map((item) => (
                    <div
                      key={item._id}
                      className="relative group rounded-xl overflow-hidden aspect-square bg-slate-100 border border-slate-200"
                    >
                      {item.type === 'video' ? (
                        <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-white p-2 text-center">
                          <Play className="w-8 h-8 text-red-500 mb-1" />
                          <span className="text-[10px] truncate max-w-full">
                            {item.title || 'Vidéo'}
                          </span>
                        </div>
                      ) : (
                        <img
                          src={getImageUrl(item.url)}
                          alt={item.title || ''}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <button
                        onClick={() => setDeleteMediaId(item._id)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-md bg-red-600 text-white opacity-0 group-hover:opacity-100 transition shadow-xs"
                        title="Supprimer ce média"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Album Modal */}
      <ConfirmModal
        isOpen={!!deleteAlbumId}
        onClose={() => setDeleteAlbumId(null)}
        onConfirm={handleDeleteAlbum}
        title="Supprimer cet album ?"
        message="Êtes-vous sûr de vouloir supprimer cet album et tous ses médias associés ?"
      />

      {/* Delete Media Modal */}
      <ConfirmModal
        isOpen={!!deleteMediaId}
        onClose={() => setDeleteMediaId(null)}
        onConfirm={handleDeleteMedia}
        title="Supprimer ce média ?"
        message="Voulez-vous retirer cette photo ou vidéo de l'album ?"
      />
    </div>
  );
};

export default GalleryManager;
