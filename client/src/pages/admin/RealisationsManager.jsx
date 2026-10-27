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
import { StatusBadge } from '../../components/admin/StatusBadge';
import { ImageUploader } from '../../components/admin/ImageUploader';
import { getImageUrl } from '../../utils/imageUrl';
import {
  Award,
  Plus,
  Search,
  Edit2,
  Trash2,
  Building,
  Calendar,
} from 'lucide-react';

export const RealisationsManager = () => {
  const { showToast } = useToast();

  const [realisations, setRealisations] = useState([]);
  const [prestations, setPrestations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    prestation: '',
    clientName: '',
    completionDate: '',
    description: '',
    tags: '',
    isFeatured: false,
    isActive: true,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resR, resP] = await Promise.all([
        api.get('/prestations/realisations', { params: { limit: 100 } }),
        api.get('/prestations', { params: { limit: 100 } }),
      ]);
      setRealisations(resR.data.data || []);
      setPrestations(resP.data.data || []);
    } catch (err) {
      console.error('Erreur chargement réalisations:', err);
      showToast('Impossible de charger les réalisations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      prestation: prestations[0]?._id || '',
      clientName: '',
      completionDate: '',
      description: '',
      tags: 'Identité visuelle, Packaging, Tiaret',
      isFeatured: false,
      isActive: true,
    });
    setSelectedFile(null);
    setPreviewImage('');
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      prestation: item.prestation?._id || item.prestation || '',
      clientName: item.clientName || '',
      completionDate: item.completionDate ? item.completionDate.split('T')[0] : '',
      description: item.description || '',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : item.tags || '',
      isFeatured: item.isFeatured ?? false,
      isActive: item.isActive ?? true,
    });
    setSelectedFile(null);
    setPreviewImage(item.coverImage || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      showToast('Le titre de la réalisation est obligatoire.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('title', formData.title);
      if (formData.prestation) data.append('prestation', formData.prestation);
      data.append('clientName', formData.clientName);
      if (formData.completionDate) data.append('completionDate', formData.completionDate);
      data.append('description', formData.description);
      data.append('isFeatured', formData.isFeatured);
      data.append('isActive', formData.isActive);

      const tagsArr = formData.tags.split(',').map((t) => t.trim()).filter(Boolean);
      data.append('tags', JSON.stringify(tagsArr));

      if (selectedFile) {
        data.append('coverImage', selectedFile);
      }

      if (editingItem) {
        await api.put(`/prestations/admin/realisations/${editingItem._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('Réalisation mise à jour.', 'success');
      } else {
        await api.post('/prestations/admin/realisations', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('Réalisation ajoutée au portfolio.', 'success');
      }

      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Erreur sauvegarde réalisation:', err);
      showToast(err.response?.data?.message || 'Erreur lors de l’enregistrement.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await api.delete(`/prestations/admin/realisations/${deleteId}`);
      showToast('Réalisation supprimée.', 'success');
      setDeleteId(null);
      fetchData();
    } catch (err) {
      console.error('Erreur suppression:', err);
      showToast('Erreur lors de la suppression.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = realisations.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.clientName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <SEOHelmet title="Gestion des Réalisations - B.C.A. Admin" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <Award className="w-6 h-6 mr-2 text-brand-600" />
            Portfolio & Réalisations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Mettez en avant les projets de communication réalisés pour vos clients locaux.
          </p>
        </div>
        <Button onClick={handleOpenCreate} variant="primary" size="md">
          <Plus className="w-4 h-4 mr-1.5" /> Ajouter une réalisation
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par titre de projet ou nom du client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Chargement des réalisations...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">Aucune réalisation dans le portfolio.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <div
                key={item._id}
                className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex flex-col group"
              >
                <div className="relative aspect-video bg-slate-200 overflow-hidden">
                  {item.coverImage ? (
                    <img
                      src={getImageUrl(item.coverImage)}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                      Sans image
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <StatusBadge status={item.isActive ? 'active' : 'inactive'} />
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{item.title}</h3>
                    {item.clientName && (
                      <p className="text-xs text-brand-600 font-medium flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3" /> {item.clientName}
                      </p>
                    )}
                    {item.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-400">
                    <span>
                      {item.completionDate
                        ? new Date(item.completionDate).toLocaleDateString('fr-FR', {
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Récent'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-brand-600 hover:bg-white transition"
                        title="Modifier"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(item._id)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-white transition"
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

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Modifier la réalisation' : 'Ajouter une réalisation'}
        size="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Titre du projet *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="ex. Identité visuelle & packaging pour la Laiterie du Sersou"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Prestation associée"
              value={formData.prestation}
              onChange={(e) => setFormData({ ...formData, prestation: e.target.value })}
              options={[
                { value: '', label: 'Aucune (Projet général)' },
                ...prestations.map((p) => ({ value: p._id, label: p.title })),
              ]}
            />
            <Input
              label="Nom du client / Entreprise"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              placeholder="ex. Clinique El-Djawhara Tiaret"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Date d'achèvement"
              type="date"
              value={formData.completionDate}
              onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
            />
            <Input
              label="Mots-clés / Tags (séparés par virgules)"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="Logo, Enseigne, Réseaux Sociaux"
            />
          </div>

          <Textarea
            label="Description du projet et résultats obtenus"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            placeholder="Contexte, brief client, solutions apportées..."
          />

          <ImageUploader
            label="Photo principale du projet"
            previewUrl={previewImage}
            onFileSelect={(file) => setSelectedFile(file)}
            onChange={(url) => setPreviewImage(url)}
          />

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-wrap gap-6 text-xs font-semibold text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              Mettre en vedette dans le slider / portfolio
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              Visible publiquement
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button onClick={() => setModalOpen(false)} variant="ghost" size="sm">
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={submitting}>
              {editingItem ? 'Enregistrer' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Supprimer cette réalisation ?"
        message="Êtes-vous sûr de vouloir retirer ce projet du portfolio ?"
      />
    </div>
  );
};

export default RealisationsManager;
