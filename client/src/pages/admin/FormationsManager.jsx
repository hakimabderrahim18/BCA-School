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
  GraduationCap,
  Plus,
  Search,
  Edit2,
  Trash2,
  CalendarRange,
  CheckCircle,
  XCircle,
  Eye,
} from 'lucide-react';

export const FormationsManager = () => {
  const { showToast } = useToast();

  const [formations, setFormations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

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
    duration: '',
    price: '',
    targetAudience: '',
    prerequisites: '',
    objectives: '',
    program: '',
    instructorName: '',
    isCertified: true,
    isFeatured: false,
    isActive: true,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('');

  const fetchFormations = async () => {
    try {
      setLoading(true);
      const [resF, resC] = await Promise.all([
        api.get('/formations', { params: { limit: 100 } }),
        api.get('/categories', { params: { type: 'formation' } }),
      ]);
      setFormations(resF.data.data || []);
      setCategories(resC.data.data || []);
    } catch (err) {
      console.error('Erreur chargement formations:', err);
      showToast('Impossible de charger les formations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormations();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      category: categories[0]?._id || '',
      shortDescription: '',
      description: '',
      duration: '30 heures (1 mois)',
      price: '',
      targetAudience: 'Étudiants, professionnels et demandeurs d’emploi',
      prerequisites: 'Aucun prérequis particulier',
      objectives: '',
      program: '',
      instructorName: '',
      isCertified: true,
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
      category: item.category?._id || item.category || '',
      shortDescription: item.summary || item.shortDescription || '',
      description: item.description || item.summary || item.shortDescription || '',
      duration: item.duration || (item.durationHours ? `${item.durationHours} heures` : ''),
      price: item.price ? String(item.price) : '',
      targetAudience: Array.isArray(item.targetAudience) ? item.targetAudience.join(', ') : item.targetAudience || '',
      prerequisites: Array.isArray(item.prerequisites) ? item.prerequisites.join(', ') : item.prerequisites || '',
      objectives: Array.isArray(item.objectives) ? item.objectives.join('\n') : item.objectives || '',
      program: Array.isArray(item.program)
        ? item.program.map((p) => (typeof p === 'object' ? `${p.title}${p.description ? ': ' + p.description : ''}` : p)).join('\n')
        : item.program || '',
      instructorName: item.trainer?.name || item.instructor?.name || '',
      isCertified: item.isCertified ?? true,
      isFeatured: item.isFeatured ?? false,
      isActive: item.status ? item.status === 'published' : (item.isActive ?? true),
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

      data.append('duration', formData.duration);
      if (formData.price) data.append('price', formData.price);
      data.append('targetAudience', formData.targetAudience);
      data.append('prerequisites', formData.prerequisites);
      data.append('isCertified', formData.isCertified);
      data.append('isFeatured', formData.isFeatured);
      data.append('status', formData.isActive ? 'published' : 'draft');
      data.append('isActive', formData.isActive);

      // Convert line breaks to array for objectives & program
      const objectivesArr = formData.objectives.split('\n').filter((l) => l.trim().length > 0);
      data.append('objectives', JSON.stringify(objectivesArr));

      const programArr = formData.program.split('\n').filter((l) => l.trim().length > 0).map((title, idx) => ({
        moduleNumber: idx + 1,
        title,
        description: '',
      }));
      data.append('program', JSON.stringify(programArr));

      if (formData.instructorName) {
        data.append('trainer', JSON.stringify({ name: formData.instructorName }));
        data.append('instructor', JSON.stringify({ name: formData.instructorName }));
      }

      if (selectedFile) {
        data.append('image', selectedFile);
      }

      if (editingItem) {
        await api.put(`/formations/${editingItem._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('Formation modifiée avec succès.', 'success');
      } else {
        await api.post('/formations', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('Formation créée avec succès.', 'success');
      }

      setModalOpen(false);
      fetchFormations();
    } catch (err) {
      console.error('Erreur sauvegarde formation:', err);
      showToast(err.response?.data?.message || 'Erreur lors de l’enregistrement.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await api.delete(`/formations/${deleteId}`);
      showToast('Formation supprimée avec succès.', 'success');
      setDeleteId(null);
      fetchFormations();
    } catch (err) {
      console.error('Erreur suppression formation:', err);
      showToast('Erreur lors de la suppression.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filteredFormations = formations.filter((f) => {
    const matchesSearch = f.title.toLowerCase().includes(search.toLowerCase());
    const catId = f.category?._id || f.category;
    const matchesCat = selectedCategory ? catId === selectedCategory : true;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      <SEOHelmet title="Gestion des Formations - B.C.A. Admin" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <GraduationCap className="w-6 h-6 mr-2 text-brand-600" />
            Catalogue des Formations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gérez vos offres de formation certifiante et qualifiante pour le centre B.C.A. Tiaret.
          </p>
        </div>
        <Button onClick={handleOpenCreate} variant="primary" size="md">
          <Plus className="w-4 h-4 mr-1.5" /> Ajouter une formation
        </Button>
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
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
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

      {/* Formations Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Chargement des formations...</p>
          </div>
        ) : filteredFormations.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <GraduationCap className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">Aucune formation trouvée.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Formation</th>
                  <th className="px-6 py-3.5">Catégorie</th>
                  <th className="px-6 py-3.5">Durée</th>
                  <th className="px-6 py-3.5">Tarif (DZD)</th>
                  <th className="px-6 py-3.5 text-center">Statut</th>
                  <th className="px-6 py-3.5 text-center">Sessions</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredFormations.map((f) => (
                  <tr key={f._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {f.image ? (
                          <img
                            src={getImageUrl(f.image)}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold shrink-0">
                            F
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-slate-900 block line-clamp-1">
                            {f.title}
                          </span>
                          <span className="text-[11px] text-slate-400 line-clamp-1">
                            {f.summary || f.shortDescription}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {f.category?.name || 'Général'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600">{f.duration || (f.durationHours ? `${f.durationHours}h` : 'N/A')}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {f.price ? `${f.price.toLocaleString('fr-DZ')} DA` : (f.priceDisplay || 'Sur devis')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={f.status === 'published' || f.isActive ? 'active' : 'inactive'} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        to={`/admin/sessions?formation=${f._id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-brand-600 hover:bg-brand-100 font-semibold text-[11px]"
                      >
                        <CalendarRange className="w-3.5 h-3.5" />
                        Gérer sessions
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/formations/${f.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                          title="Voir sur le site public"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(f)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(f._id)}
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

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Modifier la formation' : 'Ajouter une formation'}
        size="3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Intitulé de la formation *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="ex. Infographie & PAO : Photoshop, Illustrator, InDesign"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Catégorie *"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={categories.map((c) => ({ value: c._id, label: c.name }))}
              required
            />
            <Input
              label="Durée estimée"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="ex. 40 heures (2 mois)"
            />
            <Input
              label="Tarif indicatif (DZD)"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="ex. 18000"
            />
          </div>

          <Textarea
            label="Description courte (résumé vitrine)"
            value={formData.shortDescription}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
            rows={2}
            placeholder="Présentation générale de la formation..."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Public visé"
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              placeholder="ex. Débutants, professionnels du design, étudiants"
            />
            <Input
              label="Prérequis"
              value={formData.prerequisites}
              onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
              placeholder="ex. Maîtrise de base de Windows"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Textarea
              label="Objectifs pédagogiques (1 par ligne)"
              value={formData.objectives}
              onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
              rows={4}
              placeholder="Maîtriser les bases du logiciel&#10;Concevoir des identités visuelles&#10;Préparer les fichiers pour l'imprimerie"
            />
            <Textarea
              label="Programme indicatif (1 module par ligne)"
              value={formData.program}
              onChange={(e) => setFormData({ ...formData, program: e.target.value })}
              rows={4}
              placeholder="Module 1 : Interface et outils essentiels&#10;Module 2 : Retouche photo avancée&#10;Module 3 : Projet pratique d'application"
            />
          </div>

          <Input
            label="Formateur référent"
            value={formData.instructorName}
            onChange={(e) => setFormData({ ...formData, instructorName: e.target.value })}
            placeholder="ex. Formateur certifié Adobe - B.C.A."
          />

          <ImageUploader
            label="Image d'illustration"
            previewUrl={previewImage}
            onFileSelect={(file) => setSelectedFile(file)}
            onChange={(url) => setPreviewImage(url)}
          />

          {/* Options Switches */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-wrap gap-6 text-xs font-semibold text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isCertified}
                onChange={(e) => setFormData({ ...formData, isCertified: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              Formation avec attestation / certificat agréé
            </label>

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
              Visible sur le catalogue public
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button onClick={() => setModalOpen(false)} variant="ghost" size="sm">
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={submitting}>
              {editingItem ? 'Enregistrer les modifications' : 'Créer la formation'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Supprimer cette formation ?"
        message="Êtes-vous sûr de vouloir supprimer cette formation ? Les sessions associées seront également supprimées."
      />
    </div>
  );
};

export default FormationsManager;
