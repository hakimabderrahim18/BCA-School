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
  Megaphone,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Calendar,
  MousePointerClick,
  Eye,
  CheckCircle,
} from 'lucide-react';

const SLOT_KEYS = [
  { value: 'home_banner_top', label: 'Accueil - Bannière Haute (Header)' },
  { value: 'home_banner_middle', label: 'Accueil - Grand Encart Central' },
  { value: 'home_sidebar', label: 'Accueil - Colonne Latérale' },
  { value: 'article_inline', label: 'Articles - Encart intra-texte' },
  { value: 'event_sidebar', label: 'Événements - Colonne Latérale' },
  { value: 'annonces_top', label: 'Annonces & Publicité - En-tête' },
];

export const AdSlotsManager = () => {
  const { showToast } = useToast();

  const [adSlots, setAdSlots] = useState([]);
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
    title: '',
    slotKey: 'home_banner_top',
    advertiserName: '',
    targetUrl: '',
    startDate: '',
    endDate: '',
    pricePaid: '',
    isActive: true,
  });
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [previewBanner, setPreviewBanner] = useState('');

  const fetchAdSlots = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ads');
      setAdSlots(res.data.data || []);
    } catch (err) {
      console.error('Erreur chargement bannières:', err);
      showToast('Impossible de charger les emplacements publicitaires.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdSlots();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      slotKey: 'home_banner_top',
      advertiserName: '',
      targetUrl: 'https://',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      pricePaid: '15000',
      isActive: true,
    });
    setSelectedBanner(null);
    setPreviewBanner('');
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      slotKey: item.slotKey || 'home_banner_top',
      advertiserName: item.advertiserName || '',
      targetUrl: item.targetUrl || '',
      startDate: item.startDate ? item.startDate.split('T')[0] : '',
      endDate: item.endDate ? item.endDate.split('T')[0] : '',
      pricePaid: item.pricePaid ? String(item.pricePaid) : '',
      isActive: item.isActive ?? true,
    });
    setSelectedBanner(null);
    setPreviewBanner(item.imageUrl || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.targetUrl || !formData.startDate || !formData.endDate) {
      showToast('Veuillez renseigner les champs obligatoires.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('title', formData.title);
      data.append('slotKey', formData.slotKey);
      data.append('advertiserName', formData.advertiserName);
      let targetUrl = formData.targetUrl.trim();
      if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = 'https://' + targetUrl;
      }
      data.append('targetUrl', targetUrl);
      data.append('startDate', formData.startDate);
      data.append('endDate', formData.endDate);
      if (formData.pricePaid) data.append('pricePaid', formData.pricePaid);
      data.append('isActive', formData.isActive);

      if (selectedBanner) {
        data.append('image', selectedBanner);
        data.append('imageUrl', selectedBanner);
      } else if (previewBanner) {
        data.append('imageUrl', previewBanner);
      } else if (editingItem?.imageUrl) {
        data.append('imageUrl', editingItem.imageUrl);
      }

      if (editingItem) {
        await api.put(`/ads/${editingItem._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('Campagne publicitaire mise à jour.', 'success');
      } else {
        await api.post('/ads', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('Nouvelle bannière publicitaire créée.', 'success');
      }

      setModalOpen(false);
      fetchAdSlots();
    } catch (err) {
      console.error('Erreur sauvegarde pub:', err);
      showToast(err.response?.data?.message || 'Erreur lors de l’enregistrement.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (slot) => {
    try {
      const data = new FormData();
      data.append('isActive', !slot.isActive);
      await api.put(`/ads/${slot._id}`, data);
      showToast(slot.isActive ? 'Bannière mise en pause.' : 'Bannière activée !', 'success');
      fetchAdSlots();
    } catch (err) {
      console.error('Erreur bascule statut pub:', err);
      showToast('Erreur lors de la modification du statut.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await api.delete(`/ads/${deleteId}`);
      showToast('Emplacement publicitaire supprimé.', 'success');
      setDeleteId(null);
      fetchAdSlots();
    } catch (err) {
      console.error('Erreur suppression pub:', err);
      showToast('Erreur lors de la suppression.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <SEOHelmet title="Gestion des Bannières Publicitaires - B.C.A. Admin" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <Megaphone className="w-6 h-6 mr-2 text-brand-600" />
            Régie Publicitaire & Bannières
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gérez la diffusion des annonces payantes, dates de validité et bannières sponsors.
          </p>
        </div>
        <Button onClick={handleOpenCreate} variant="primary" size="md">
          <Plus className="w-4 h-4 mr-1.5" /> Nouvelle bannière pub
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Chargement des espaces publicitaires...</p>
          </div>
        ) : adSlots.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Megaphone className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">Aucun emplacement publicitaire configuré.</p>
            <Button onClick={handleOpenCreate} variant="outline" size="sm" className="mt-4">
              Créer la première bannière
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Campagne & Visuel</th>
                  <th className="px-6 py-3.5">Emplacement</th>
                  <th className="px-6 py-3.5">Annonceur</th>
                  <th className="px-6 py-3.5">Période de Diffusion</th>
                  <th className="px-6 py-3.5 text-center">Clics</th>
                  <th className="px-6 py-3.5 text-center">État</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {adSlots.map((slot) => {
                  const now = new Date();
                  const isExpired = slot.endDate && new Date(slot.endDate) < now;

                  return (
                    <tr key={slot._id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {slot.imageUrl ? (
                            <img
                              src={getImageUrl(slot.imageUrl)}
                              alt={slot.title}
                              className="w-16 h-8 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=400&q=80';
                              }}
                            />
                          ) : (
                            <div className="w-16 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                              PUB
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-slate-900 block line-clamp-1">
                              {slot.title}
                            </span>
                            <a
                              href={slot.targetUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-brand-600 hover:underline flex items-center gap-1 line-clamp-1"
                            >
                              <ExternalLink className="w-3 h-3" /> {slot.targetUrl}
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {SLOT_KEYS.find((s) => s.value === slot.slotKey)?.label || slot.slotKey}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {slot.advertiserName || 'Client direct'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="block text-slate-800">
                          Du {new Date(slot.startDate).toLocaleDateString('fr-FR')}
                        </span>
                        <span
                          className={`block text-[11px] ${
                            isExpired ? 'text-red-500 font-bold' : 'text-slate-400'
                          }`}
                        >
                          au {new Date(slot.endDate).toLocaleDateString('fr-FR')}{' '}
                          {isExpired && '(Expiré)'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-900">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-[11px]">
                          <MousePointerClick className="w-3 h-3 text-brand-600" />
                          {slot.clicks || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(slot)}
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border transition ${
                            slot.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {slot.isActive ? 'Actif' : 'En pause'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(slot)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(slot._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Modifier la bannière' : 'Programmer une bannière publicitaire'}
        size="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Intitulé de la campagne *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="ex. Campagne Promotionnelle Hôtel Rostom - Tiaret"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Emplacement d'affichage sur le site *"
              value={formData.slotKey}
              onChange={(e) => setFormData({ ...formData, slotKey: e.target.value })}
              options={SLOT_KEYS}
              required
            />
            <Input
              label="Nom de l'annonceur / Client"
              value={formData.advertiserName}
              onChange={(e) => setFormData({ ...formData, advertiserName: e.target.value })}
              placeholder="ex. Hôtel Rostom Tiaret"
            />
          </div>

          <Input
            label="Lien de redirection (URL de destination ou lien WhatsApp) *"
            value={formData.targetUrl}
            onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
            placeholder="https://wa.me/213550000000 ou https://site-client.dz"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Date de début d'affichage *"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            <Input
              label="Date de fin d'affichage *"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
            <Input
              label="Tarif facturé (DZD)"
              type="number"
              value={formData.pricePaid}
              onChange={(e) => setFormData({ ...formData, pricePaid: e.target.value })}
              placeholder="15000"
            />
          </div>

          <ImageUploader
            label="Visuel de la bannière (Bannière horizontale ou pavé carré)"
            previewUrl={previewBanner}
            onFileSelect={(file) => setSelectedBanner(file)}
            onChange={(url) => setPreviewBanner(url)}
          />

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-6 text-xs font-semibold text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              Bannière activée et diffusée en ligne
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button onClick={() => setModalOpen(false)} variant="ghost" size="sm">
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={submitting}>
              {editingItem ? 'Enregistrer' : 'Lancer la diffusion'}
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
        title="Supprimer cette bannière publicitaire ?"
        message="Êtes-vous sûr de vouloir supprimer cet encart publicitaire ?"
      />
    </div>
  );
};

export default AdSlotsManager;
