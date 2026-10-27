import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
import { RichTextEditor } from '../../components/admin/RichTextEditor';
import {
  Newspaper,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  Layers,
} from 'lucide-react';

export const ArticlesManager = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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
    excerpt: '',
    content: '',
    videoUrl: '',
    tags: '',
    isFeatured: false,
    status: 'published',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resA, resC] = await Promise.all([
        api.get('/articles/admin/all', { params: { limit: 100 } }),
        api.get('/categories', { params: { type: 'article' } }),
      ]);
      setArticles(resA.data.data || []);
      setCategories(resC.data.data || []);
    } catch (err) {
      console.error('Erreur chargement articles:', err);
      showToast('Impossible de charger les articles.', 'error');
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
      category: categories[0]?._id || '',
      excerpt: '',
      content: '<p>Rédigez votre article d\'actualité ici...</p>',
      videoUrl: '',
      tags: 'Tiaret, Actualités, B.C.A.',
      isFeatured: false,
      status: user?.role === 'writer' ? 'pending' : 'published',
    });
    setSelectedFile(null);
    setPreviewImage('');
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      category: item.category?._id || item.category || '',
      excerpt: item.excerpt || '',
      content: item.content || '',
      videoUrl: item.videoUrl || '',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : item.tags || '',
      isFeatured: item.isFeatured ?? false,
      status: item.status || 'published',
    });
    setSelectedFile(null);
    setPreviewImage(item.coverImage || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      showToast('Le titre de l’article est obligatoire.', 'error');
      return;
    }

    const categoryId = formData.category || categories[0]?._id || '';
    if (!categoryId) {
      showToast('Veuillez sélectionner une catégorie.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('title', formData.title);
      data.append('category', categoryId);

      const summaryText = formData.excerpt || formData.title;
      data.append('summary', summaryText);
      data.append('excerpt', summaryText);
      data.append('content', formData.content || summaryText);
      if (formData.videoUrl) data.append('videoUrl', formData.videoUrl);
      data.append('isFeatured', formData.isFeatured);
      data.append('status', formData.status || 'published');

      const tagsArr = (formData.tags || '').split(',').map((t) => t.trim()).filter(Boolean);
      data.append('tags', JSON.stringify(tagsArr));

      if (selectedFile) {
        data.append('coverImage', selectedFile);
      } else if (editingItem?.coverImage) {
        data.append('coverImage', editingItem.coverImage);
      }

      if (editingItem) {
        await api.put(`/articles/${editingItem._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('Article mis à jour avec succès.', 'success');
      } else {
        await api.post('/articles', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('Article créé avec succès.', 'success');
      }

      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Erreur sauvegarde article:', err);
      showToast(err.response?.data?.message || 'Erreur lors de l’enregistrement.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await api.delete(`/articles/${deleteId}`);
      showToast('Article supprimé avec succès.', 'success');
      setDeleteId(null);
      fetchData();
    } catch (err) {
      console.error('Erreur suppression article:', err);
      showToast('Erreur lors de la suppression.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = articles.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const catId = a.category?._id || a.category;
    const matchesCat = categoryFilter ? catId === categoryFilter : true;
    const matchesStatus = statusFilter ? a.status === statusFilter : true;
    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <SEOHelmet title="Gestion des Articles & News - B.C.A. Admin" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <Newspaper className="w-6 h-6 mr-2 text-brand-600" />
            Articles & Actualités Locales
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Rédigez et publiez les actualités du centre et les reportages de la région de Tiaret.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button to="/admin/categories?type=article" variant="outline" size="md">
            <Layers className="w-4 h-4 mr-1.5 text-brand-600" /> Catégories
          </Button>
          <Button onClick={handleOpenCreate} variant="primary" size="md">
            <Plus className="w-4 h-4 mr-1.5" /> Rédiger un article
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par titre d'article..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-500 text-slate-700"
        >
          <option value="">Toutes les rubriques</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-500 text-slate-700"
        >
          <option value="">Tous les statuts</option>
          <option value="published">Publié</option>
          <option value="draft">Brouillon</option>
          <option value="pending">En attente de relecture</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Chargement des articles...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Newspaper className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">Aucun article trouvé.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Article</th>
                  <th className="px-6 py-3.5">Rubrique</th>
                  <th className="px-6 py-3.5">Auteur</th>
                  <th className="px-6 py-3.5">Date Publication</th>
                  <th className="px-6 py-3.5 text-center">Statut</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.coverImage ? (
                          <img
                            src={getImageUrl(item.coverImage)}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
                            A
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-slate-900 block line-clamp-1">
                            {item.title}
                          </span>
                          <span className="text-[11px] text-slate-400 line-clamp-1">
                            {item.excerpt}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {item.category?.name || 'Général'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600">
                      {item.author?.firstName ? `${item.author.firstName} ${item.author.lastName}` : 'Rédaction B.C.A.'}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {item.publishedAt
                        ? new Date(item.publishedAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : new Date(item.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.status === 'published' && (
                          <Link
                            to={`/actualites/${item.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            title="Voir sur le site public"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        )}
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

      {/* Editor Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? "Modifier l'article" : 'Rédiger un article'}
        size="4xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Titre de l'article *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="ex. Ouverture des inscriptions pour la session de printemps à Tiaret"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Rubrique / Catégorie *"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={categories.map((c) => ({ value: c._id, label: c.name }))}
              required
            />
            <Select
              label="Statut de publication *"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'published', label: 'Publié en ligne' },
                { value: 'draft', label: 'Brouillon privé' },
                { value: 'pending', label: 'En attente de relecture éditoriale' },
              ]}
              required
            />
          </div>

          <Textarea
            label="Résumé d'accroche (Chapeau)"
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            rows={2}
            placeholder="Bref résumé affiché sur les cartes d'actualités et moteurs de recherche..."
          />

          {/* TipTap Rich Text Editor */}
          <RichTextEditor
            label="Contenu complet de l'article *"
            value={formData.content}
            onChange={(html) => setFormData({ ...formData, content: html })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Lien vidéo optionnel (YouTube, Vimeo ou Facebook)"
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <Input
              label="Mots-clés / Tags (séparés par virgules)"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="Formation, Tiaret, Emploi, Certificat"
            />
          </div>

          <ImageUploader
            label="Photo de couverture (Bannière)"
            previewUrl={previewImage}
            onFileSelect={(file) => setSelectedFile(file)}
            onChange={(url) => setPreviewImage(url)}
          />

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-6 text-xs font-semibold text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              Mettre en Une sur la page d'accueil (Bandeau principal)
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button onClick={() => setModalOpen(false)} variant="ghost" size="sm">
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={submitting}>
              {editingItem ? 'Enregistrer les modifications' : "Publier l'article"}
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
        title="Supprimer cet article ?"
        message="Êtes-vous sûr de vouloir supprimer définitivement cet article ?"
      />
    </div>
  );
};

export default ArticlesManager;
