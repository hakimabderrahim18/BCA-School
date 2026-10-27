import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  Tag,
} from 'lucide-react';

const CATEGORY_TYPES = [
  { value: 'article', label: 'Actualités & Presse' },
  { value: 'formation', label: 'Catalogue Formations' },
  { value: 'prestation', label: 'Services & Prestations' },
  { value: 'annonce', label: 'Petites Annonces & Annuaire' },
];

export const CategoriesManager = () => {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialType = searchParams.get('type') || '';

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(initialType);
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
    name: '',
    type: 'article',
    description: '',
    color: '#082849',
    icon: 'Layers',
    order: 0,
    isActive: true,
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedType) params.type = selectedType;

      const res = await api.get('/categories', { params });
      setCategories(res.data.data || []);
    } catch (err) {
      console.error('Erreur chargement catégories:', err);
      showToast('Impossible de charger les catégories.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [selectedType]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      type: selectedType || 'article',
      description: '',
      color: '#082849',
      icon: 'Layers',
      order: 0,
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      type: item.type || 'article',
      description: item.description || '',
      color: item.color || '#082849',
      icon: item.icon || 'Layers',
      order: item.order || 0,
      isActive: item.isActive ?? true,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.type) {
      showToast('Le nom et le type sont obligatoires.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      if (editingItem) {
        await api.put(`/categories/${editingItem._id}`, formData);
        showToast('Catégorie mise à jour.', 'success');
      } else {
        await api.post('/categories', formData);
        showToast('Nouvelle catégorie créée.', 'success');
      }

      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      console.error('Erreur sauvegarde catégorie:', err);
      showToast(err.response?.data?.message || 'Erreur lors de l’enregistrement.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await api.delete(`/categories/${deleteId}`);
      showToast('Catégorie supprimée.', 'success');
      setDeleteId(null);
      fetchCategories();
    } catch (err) {
      console.error('Erreur suppression:', err);
      showToast('Erreur lors de la suppression.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <SEOHelmet title="Gestion des Catégories - B.C.A. Admin" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <Layers className="w-6 h-6 mr-2 text-brand-600" />
            Catégories & Rubriques
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Structurez et organisez vos formations, articles, prestations et annonces locales.
          </p>
        </div>
        <Button onClick={handleOpenCreate} variant="primary" size="md">
          <Plus className="w-4 h-4 mr-1.5" /> Nouvelle catégorie
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher une catégorie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-500"
          />
        </div>

        <select
          value={selectedType}
          onChange={(e) => {
            setSelectedType(e.target.value);
            setSearchParams(e.target.value ? { type: e.target.value } : {});
          }}
          className="w-full sm:w-64 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-500 text-slate-700"
        >
          <option value="">Tous les types</option>
          {CATEGORY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Chargement des catégories...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Layers className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">Aucune catégorie répertoriée.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Catégorie</th>
                  <th className="px-6 py-3.5">Type d'usage</th>
                  <th className="px-6 py-3.5">Slug URL</th>
                  <th className="px-6 py-3.5 text-center">Couleur</th>
                  <th className="px-6 py-3.5 text-center">Statut</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-bold text-slate-900 block">{item.name}</span>
                        {item.description && (
                          <span className="text-[11px] text-slate-400 block line-clamp-1">
                            {item.description}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 uppercase tracking-wider">
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-500">
                      {item.slug}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <span
                          className="w-4 h-4 rounded-full border border-slate-200 inline-block"
                          style={{ backgroundColor: item.color || '#082849' }}
                        />
                        <span className="text-[10px] font-mono text-slate-500">{item.color}</span>
                      </div>
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
        title={editingItem ? 'Modifier la catégorie' : 'Créer une catégorie'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nom de la catégorie *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="ex. Informatique & Bureautique"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Type d'application *"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={CATEGORY_TYPES}
              required
            />
            <Input
              label="Code Couleur Hex"
              type="text"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="#082849"
            />
          </div>

          <Textarea
            label="Description optionnelle"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
            placeholder="Courte explication du domaine..."
          />

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-6 text-xs font-semibold text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              Catégorie active
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button onClick={() => setModalOpen(false)} variant="ghost" size="sm">
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={submitting}>
              {editingItem ? 'Enregistrer' : 'Créer la catégorie'}
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
        title="Supprimer cette catégorie ?"
        message="Êtes-vous sûr de vouloir supprimer cette catégorie ? Les éléments rattachés perdront leur affectation de rubrique."
      />
    </div>
  );
};

export default CategoriesManager;
