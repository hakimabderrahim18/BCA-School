import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Briefcase,
  Plus,
  Search,
  Edit2,
  Trash2,
  Award,
  Eye,
  Clock,
} from 'lucide-react';

export const PrestationsManager = () => {
  const { showToast } = useToast();

  const [prestations, setPrestations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

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
    category: '',
    shortDescription: '',
    description: '',
    benefits: '',
    steps: '',
    delay: '3 à 7 jours ouvrés',
    startingPrice: '',
    isFeatured: false,
    isActive: true,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('');

  const fetchPrestations = async () => {
    try {
      setLoading(true);
      const [resP, resC] = await Promise.all([
        api.get('/prestations', { params: { limit: 100 } }),
        api.get('/categories', { params: { type: 'prestation' } }),
      ]);
      setPrestations(resP.data.data || []);
      setCategories(resC.data.data || []);
    } catch (err) {
      console.error('Erreur chargement prestations:', err);
      showToast('Impossible de charger les prestations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrestations();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      category: categories[0]?._id || '',
      shortDescription: '',
      description: '',
      benefits: '',
      steps: '',
      delay: '3 à 7 jours ouvrés',
      startingPrice: '',
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
      category: item.category?._id || item.category || categories[0]?._id || '',
      shortDescription: item.summary || item.shortDescription || '',
      description: item.description || item.summary || item.shortDescription || '',
      benefits: Array.isArray(item.benefits) ? item.benefits.join('\n') : item.benefits || '',
      steps: Array.isArray(item.steps)
        ? item.steps.map((s) => (typeof s === 'object' ? `${s.title}: ${s.description || ''}` : s)).join('\n')
        : item.steps || '',
      delay: item.delay || '',
      startingPrice: item.startingPrice ? String(item.startingPrice) : '',
      isFeatured: item.isFeatured ?? false,
      isActive: item.isActive ?? true,
    });
    setSelectedFile(null);
    setPreviewImage(item.image || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.category) {
      showToast('Veuillez renseigner le titre et la catégorie.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('title', formData.title);
      data.append('category', formData.category);

      const summaryText = formData.shortDescription || formData.description || formData.title;
      data.append('summary', summaryText);
      data.append('shortDescription', summaryText);
      data.append('description', formData.description || summaryText);

      data.append('delay', formData.delay);
      if (formData.startingPrice) data.append('startingPrice', formData.startingPrice);
      data.append('isFeatured', formData.isFeatured);
      data.append('isActive', formData.isActive);

      const benefitsArr = formData.benefits.split('\n').filter((l) => l.trim().length > 0);
      data.append('benefits', JSON.stringify(benefitsArr));

      const stepsArr = formData.steps.split('\n').filter((l) => l.trim().length > 0).map((title, idx) => ({
        stepNumber: idx + 1,
        title,
        description: '',
      }));
      data.append('steps', JSON.stringify(stepsArr));

      if (selectedFile) {
        data.append('image', selectedFile);
      }

      if (editingItem) {
        await api.put(`/prestations/${editingItem._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('Prestation modifiée avec succès.', 'success');
      } else {
        await api.post('/prestations', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('Prestation créée avec succès.', 'success');
      }

      setModalOpen(false);
      fetchPrestations();
    } catch (err) {
      console.error('Erreur sauvegarde prestation:', err);
      showToast(err.response?.data?.message || 'Erreur lors de l’enregistrement.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await api.delete(`/prestations/${deleteId}`);
      showToast('Prestation supprimée avec succès.', 'success');
      setDeleteId(null);
      fetchPrestations();
    } catch (err) {
      console.error('Erreur suppression prestation:', err);
      showToast('Erreur lors de la suppression.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = prestations.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const catId = p.category?._id || p.category;
    const matchesCat = categoryFilter ? catId === categoryFilter : true;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      <SEOHelmet title="Gestion des Prestations - B.C.A. Admin" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <Briefcase className="w-6 h-6 mr-2 text-brand-600" />
            Prestations & Services de Communication
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gérez vos offres de services aux entreprises, associations et institutions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button to="/admin/realisations" variant="outline" size="md">
            <Award className="w-4 h-4 mr-1.5 text-amber-500" /> Réalisations
          </Button>
          <Button onClick={handleOpenCreate} variant="primary" size="md">
            <Plus className="w-4 h-4 mr-1.5" /> Ajouter une prestation
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par intitulé..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full sm:w-64 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-500 text-slate-700"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Chargement des prestations...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">Aucune prestation trouvée.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Prestation</th>
                  <th className="px-6 py-3.5">Domaine</th>
                  <th className="px-6 py-3.5">Délai estimé</th>
                  <th className="px-6 py-3.5">Tarif</th>
                  <th className="px-6 py-3.5 text-center">Statut</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {p.image ? (
                          <img
                            src={getImageUrl(p.image)}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
                            P
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-slate-900 block line-clamp-1">
                            {p.title}
                          </span>
                          <span className="text-[11px] text-slate-400 line-clamp-1">
                            {p.summary || p.shortDescription}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 capitalize">
                        {p.category?.name || (typeof p.category === 'string' ? p.category : 'Communication')}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{p.delay || 'Variable'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900" dir="ltr">
                      <bdi>{p.priceDisplay || (p.startingPrice ? `${p.startingPrice.toLocaleString('fr-DZ')} DA` : 'Sur devis')}</bdi>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={p.isActive !== false ? 'active' : 'inactive'} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/prestations/${p.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                          title="Voir sur le site public"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 cursor-pointer"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(p._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
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

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Modifier la prestation' : 'Ajouter une prestation'}
        size="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Intitulé de la prestation *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="ex. Conception de Charte Graphique & Logo"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Catégorie *"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={categories.map((c) => ({ value: c._id, label: c.name }))}
              required
            />
            <Input
              label="Délai moyen d’exécution"
              value={formData.delay}
              onChange={(e) => setFormData({ ...formData, delay: e.target.value })}
              placeholder="ex. 5 à 10 jours ouvrés"
            />
          </div>

          <Input
            label="Tarif indicatif à partir de (DZD)"
            type="number"
            value={formData.startingPrice}
            onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
            placeholder="ex. 25000"
          />

          <Textarea
            label="Résumé court (carte vitrine) *"
            value={formData.shortDescription}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
            rows={2}
            placeholder="Description concise pour les aperçus et catalogues..."
            required
          />

          <Textarea
            label="Description détaillée du service"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            placeholder="Détaillez les bénéfices et ce qui est inclus dans cette prestation..."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Textarea
              label="Points forts & Avantages (1 par ligne)"
              value={formData.benefits}
              onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
              rows={4}
              placeholder="Fichiers vectoriels livrés&#10;Cession totale des droits&#10;3 propositions uniques"
            />
            <Textarea
              label="Étapes clés de réalisation (1 par ligne)"
              value={formData.steps}
              onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
              rows={4}
              placeholder="Briefing & Cahier des charges&#10;Recherches créatives & Pistes&#10;Validation et livraison finale"
            />
          </div>

          <ImageUploader
            label="Image d’illustration ou mockup"
            currentImage={previewImage}
            onFileSelect={(file) => {
              setSelectedFile(file);
              setPreviewImage(URL.createObjectURL(file));
            }}
            onClear={() => {
              setSelectedFile(null);
              setPreviewImage('');
            }}
          />

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              Mettre en avant sur la page d'accueil
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              Prestation active et visible
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {editingItem ? 'Enregistrer les modifications' : 'Créer la prestation'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Supprimer la prestation"
        message="Êtes-vous sûr de vouloir supprimer cette prestation ? Les demandes de devis déjà associées seront conservées."
        confirmText="Supprimer définitivement"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default PrestationsManager;
