import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { SEOHelmet } from '../../components/common/SEOHelmet';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { ImageUploader } from '../../components/admin/ImageUploader';
import { getImageUrl } from '../../utils/imageUrl';
import {
  Handshake,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
} from 'lucide-react';

const PARTNER_CATEGORIES = [
  { value: 'accreditation', label: 'Agrément officiel (MFEP / Ministères)' },
  { value: 'institution', label: 'Institution & Organisme public' },
  { value: 'partner', label: 'Entreprise Partenaire' },
  { value: 'media', label: 'Média & Presse locale' },
];

export const PartnersManager = () => {
  const { showToast } = useToast();

  const [partners, setPartners] = useState([]);
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
    category: 'accreditation',
    website: '',
    order: 0,
    isActive: true,
  });
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [previewLogo, setPreviewLogo] = useState('');

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings/partners/admin');
      setPartners(res.data.data || []);
    } catch (err) {
      console.error('Erreur chargement partenaires:', err);
      showToast('Impossible de charger les partenaires.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'accreditation',
      website: '',
      order: 0,
      isActive: true,
    });
    setSelectedLogo(null);
    setPreviewLogo('');
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      category: item.category || 'accreditation',
      website: item.website || '',
      order: item.order || 0,
      isActive: item.isActive ?? true,
    });
    setSelectedLogo(null);
    setPreviewLogo(item.logo || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      showToast('Le nom du partenaire est obligatoire.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('name', formData.name);
      data.append('category', formData.category);
      data.append('website', formData.website);
      data.append('order', formData.order);
      data.append('isActive', formData.isActive);

      if (selectedLogo) {
        data.append('logo', selectedLogo);
      }

      if (editingItem) {
        await api.put(`/settings/partners/${editingItem._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('Partenaire mis à jour.', 'success');
      } else {
        await api.post('/settings/partners', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('Partenaire ajouté au bandeau.', 'success');
      }

      setModalOpen(false);
      fetchPartners();
    } catch (err) {
      console.error('Erreur sauvegarde partenaire:', err);
      showToast(err.response?.data?.message || 'Erreur lors de l’enregistrement.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await api.delete(`/settings/partners/${deleteId}`);
      showToast('Partenaire supprimé.', 'success');
      setDeleteId(null);
      fetchPartners();
    } catch (err) {
      console.error('Erreur suppression partenaire:', err);
      showToast('Erreur lors de la suppression.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <SEOHelmet title="Gestion des Partenaires & Agréments - B.C.A. Admin" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <Handshake className="w-6 h-6 mr-2 text-brand-600" />
            Partenaires, Agréments & Logos Défilants
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gérez les logos d'accréditation et entreprises partenaires affichés dans le bandeau défilant de l'accueil.
          </p>
        </div>
        <Button onClick={handleOpenCreate} variant="primary" size="md">
          <Plus className="w-4 h-4 mr-1.5" /> Ajouter un partenaire
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Chargement des partenaires...</p>
          </div>
        ) : partners.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Handshake className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">Aucun partenaire enregistré.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Logo & Organisme</th>
                  <th className="px-6 py-3.5">Catégorie</th>
                  <th className="px-6 py-3.5">Site Web</th>
                  <th className="px-6 py-3.5 text-center">Ordre</th>
                  <th className="px-6 py-3.5 text-center">Statut</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {partners.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.logo ? (
                          <img
                            src={getImageUrl(item.logo)}
                            alt=""
                            className="w-12 h-12 rounded-xl object-contain border border-slate-200 p-1.5 bg-white shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 font-bold flex items-center justify-center shrink-0">
                            P
                          </div>
                        )}
                        <span className="font-bold text-slate-900">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 capitalize">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {item.website ? (
                        <a
                          href={item.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand-600 hover:underline inline-flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" /> {item.website}
                        </a>
                      ) : (
                        <span className="text-slate-400">Non renseigné</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center font-mono font-bold text-slate-700">
                      {item.order || 0}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={item.isActive ? 'active' : 'inactive'} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(item._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Modifier le partenaire' : 'Ajouter un partenaire'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nom du partenaire ou de l'agrément *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="ex. Ministère de la Formation et de l'Enseignement Professionnels"
            required
          />

          <Select
            label="Type de partenariat *"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            options={PARTNER_CATEGORIES}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Site officiel (URL)"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://..."
            />
            <Input
              label="Ordre d'affichage"
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
            />
          </div>

          <ImageUploader
            label="Logo (Format PNG transparent ou WebP recommandé)"
            previewUrl={previewLogo}
            onFileSelect={(file) => setSelectedLogo(file)}
            onChange={(url) => setPreviewLogo(url)}
          />

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-6 text-xs font-semibold text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              Actif et affiché dans le carrousel
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button onClick={() => setModalOpen(false)} variant="ghost" size="sm">
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={submitting}>
              {editingItem ? 'Enregistrer' : 'Ajouter'}
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
        title="Supprimer ce partenaire ?"
        message="Êtes-vous sûr de vouloir supprimer ce logo du bandeau partenaire ?"
      />
    </div>
  );
};

export default PartnersManager;
