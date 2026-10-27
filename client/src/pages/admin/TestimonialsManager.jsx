import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { SEOHelmet } from '../../components/common/SEOHelmet';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { ImageUploader } from '../../components/admin/ImageUploader';
import { getImageUrl } from '../../utils/imageUrl';
import {
  MessageSquareQuote,
  Plus,
  Edit2,
  Trash2,
  Star,
} from 'lucide-react';

export const TestimonialsManager = () => {
  const { showToast } = useToast();

  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    content: '',
    rating: 5,
    isFeatured: true,
    isActive: true,
  });
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState('');

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings/testimonials/admin');
      setTestimonials(res.data.data || []);
    } catch (err) {
      console.error('Erreur chargement avis:', err);
      showToast('Impossible de charger les témoignages.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      role: 'Ancien stagiaire en Infographie & Design',
      content: '',
      rating: 5,
      isFeatured: true,
      isActive: true,
    });
    setSelectedAvatar(null);
    setPreviewAvatar('');
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.authorName || item.name || '',
      role: item.roleOrCompany || item.role || '',
      content: item.content || '',
      rating: item.rating || 5,
      isFeatured: item.isFeatured ?? true,
      isActive: item.isActive ?? true,
    });
    setSelectedAvatar(null);
    setPreviewAvatar(item.avatar || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.content) {
      showToast('Le nom et le texte du témoignage sont obligatoires.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('authorName', formData.name);
      data.append('name', formData.name);
      data.append('roleOrCompany', formData.role || 'Stagiaire B.C.A.');
      data.append('role', formData.role || 'Stagiaire B.C.A.');
      data.append('content', formData.content);
      data.append('rating', formData.rating);
      data.append('isFeatured', formData.isFeatured);
      data.append('isActive', formData.isActive);

      if (selectedAvatar) {
        data.append('avatar', selectedAvatar);
      }

      if (editingItem) {
        await api.put(`/settings/testimonials/${editingItem._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('Témoignage mis à jour.', 'success');
      } else {
        await api.post('/settings/testimonials', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('Témoignage ajouté.', 'success');
      }

      setModalOpen(false);
      fetchTestimonials();
    } catch (err) {
      console.error('Erreur sauvegarde témoignage:', err);
      showToast(err.response?.data?.message || 'Erreur lors de l’enregistrement.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await api.delete(`/settings/testimonials/${deleteId}`);
      showToast('Témoignage supprimé.', 'success');
      setDeleteId(null);
      fetchTestimonials();
    } catch (err) {
      console.error('Erreur suppression avis:', err);
      showToast('Erreur lors de la suppression.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <SEOHelmet title="Gestion des Témoignages - B.C.A. Admin" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <MessageSquareQuote className="w-6 h-6 mr-2 text-brand-600" />
            Témoignages Stagiaires & Avis Clients
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gérez les retours d'expérience affichés sur la page d'accueil et la section À propos.
          </p>
        </div>
        <Button onClick={handleOpenCreate} variant="primary" size="md">
          <Plus className="w-4 h-4 mr-1.5" /> Ajouter un témoignage
        </Button>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Chargement des avis...</p>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <MessageSquareQuote className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">Aucun témoignage enregistré.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((item) => (
              <div
                key={item._id}
                className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(item.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <StatusBadge status={item.isActive ? 'active' : 'inactive'} />
                  </div>
                  <p className="text-xs text-slate-600 italic leading-relaxed line-clamp-4">
                    "{item.content}"
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {item.avatar ? (
                      <img
                        src={getImageUrl(item.avatar)}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs">
                        {(item.authorName || item.name || 'A').charAt(0)}
                      </div>
                    )}
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">{item.authorName || item.name}</span>
                      <span className="text-[10px] text-slate-400 block line-clamp-1">{item.roleOrCompany || item.role}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-white"
                      title="Modifier"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteId(item._id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-white"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
        title={editingItem ? 'Modifier le témoignage' : 'Ajouter un avis'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nom & Prénom de l'apprenant ou du client *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="ex. Amina Khelifi"
            required
          />

          <Input
            label="Rôle, Formation suivie ou Entreprise *"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            placeholder="ex. Stagiaire en PAO & Design Graphique - Promotion 2025"
            required
          />

          <Textarea
            label="Témoignage / Commentaire *"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={4}
            placeholder="Retour d'expérience sur la formation ou la prestation..."
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Note (étoiles sur 5)"
              type="number"
              min="1"
              max="5"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
            />
          </div>

          <ImageUploader
            label="Photo de profil / Avatar"
            previewUrl={previewAvatar}
            onFileSelect={(file) => setSelectedAvatar(file)}
            onChange={(url) => setPreviewAvatar(url)}
          />

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-wrap gap-6 text-xs font-semibold text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              Mettre en avant sur la page d'accueil
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              Actif et visible
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button onClick={() => setModalOpen(false)} variant="ghost" size="sm">
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={submitting}>
              {editingItem ? 'Enregistrer' : 'Ajouter le témoignage'}
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
        title="Supprimer ce témoignage ?"
        message="Êtes-vous sûr de vouloir supprimer cet avis ?"
      />
    </div>
  );
};

export default TestimonialsManager;
