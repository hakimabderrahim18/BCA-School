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
  Calendar,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckSquare,
  Eye,
  MapPin,
  Clock,
  Users,
} from 'lucide-react';

const EVENT_CATEGORIES = [
  { value: 'culture', label: 'Culture & Arts' },
  { value: 'salon', label: 'Salons & Foires' },
  { value: 'conference', label: 'Conférences & Séminaires' },
  { value: 'sport', label: 'Sport & Jeunesse' },
  { value: 'portes_ouvertes', label: 'Portes Ouvertes B.C.A.' },
  { value: 'commerce', label: 'Commerce & Entrepreneuriat' },
  { value: 'autre', label: 'Autre événement' },
];

export const EventsManager = () => {
  const { showToast } = useToast();

  const [events, setEvents] = useState([]);
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
    category: 'culture',
    date: '',
    time: '14:00',
    location: 'Maison de la Culture Ali Maachi, Tiaret',
    commune: 'Tiaret',
    description: '',
    organizerName: '',
    contactPhone: '',
    isFree: true,
    price: '',
    isFeatured: false,
    status: 'published',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events', { params: { limit: 100 } });
      setEvents(res.data.data || []);
    } catch (err) {
      console.error('Erreur chargement événements:', err);
      showToast('Impossible de charger les événements.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      category: 'culture',
      date: '',
      time: '14:00',
      location: 'Tiaret Centre',
      commune: 'Tiaret',
      description: '',
      organizerName: 'B.C.A. Tiaret',
      contactPhone: '0550 00 00 00',
      isFree: true,
      price: '',
      isFeatured: false,
      status: 'published',
    });
    setSelectedFile(null);
    setPreviewImage('');
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      category: item.category?._id || item.category || 'culture',
      date: item.startDate ? item.startDate.split('T')[0] : (item.date ? item.date.split('T')[0] : ''),
      time: item.startTime || item.time || '14:00',
      location: typeof item.location === 'object' ? item.location?.venue : (item.location || ''),
      commune: typeof item.location === 'object' ? item.location?.commune : (item.commune || 'Tiaret'),
      description: item.description || '',
      organizerName: typeof item.organizer === 'object' ? item.organizer?.name : (item.organizerName || ''),
      contactPhone: typeof item.organizer === 'object' ? item.organizer?.phone : (item.contactPhone || ''),
      isFree: item.isFree ?? true,
      price: item.price ? String(item.price) : '',
      isFeatured: item.isFeatured ?? false,
      status: item.status || 'published',
    });
    setSelectedFile(null);
    setPreviewImage(item.coverImage || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date) {
      showToast('Le titre et la date sont obligatoires.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('title', formData.title);
      data.append('category', formData.category);
      data.append('startDate', formData.date);
      data.append('date', formData.date);
      data.append('startTime', formData.time);
      data.append('time', formData.time);
      data.append('description', formData.description);
      data.append('isFree', formData.isFree);
      if (formData.price) data.append('price', formData.price);
      data.append('isFeatured', formData.isFeatured);
      data.append('status', formData.status);

      data.append(
        'location',
        JSON.stringify({
          venue: formData.location || 'Tiaret Centre',
          commune: formData.commune || 'Tiaret',
          wilaya: 'Tiaret (14)',
        })
      );

      data.append(
        'organizer',
        JSON.stringify({
          name: formData.organizerName || 'B.C.A. Tiaret',
          phone: formData.contactPhone || '',
        })
      );

      if (selectedFile) {
        data.append('coverImage', selectedFile);
      }

      if (editingItem) {
        await api.put(`/events/${editingItem._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('Événement mis à jour avec succès.', 'success');
      } else {
        await api.post('/events', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('Événement publié dans l’agenda.', 'success');
      }

      setModalOpen(false);
      fetchEvents();
    } catch (err) {
      console.error('Erreur sauvegarde événement:', err);
      showToast(err.response?.data?.message || 'Erreur lors de l’enregistrement.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await api.delete(`/events/${deleteId}`);
      showToast('Événement supprimé.', 'success');
      setDeleteId(null);
      fetchEvents();
    } catch (err) {
      console.error('Erreur suppression événement:', err);
      showToast('Erreur lors de la suppression.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const safeFormatDate = (dateVal) => {
    if (!dateVal) return 'Date non précisée';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    try {
      return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return String(dateVal);
    }
  };

  const filtered = (events || []).filter((ev) => {
    const title = (ev?.title || '').toLowerCase();
    const matchesSearch = title.includes((search || '').toLowerCase());
    const catId = typeof ev?.category === 'object' ? (ev?.category?._id || ev?.category?.slug) : ev?.category;
    const matchesCat = categoryFilter ? (catId === categoryFilter || ev?.category === categoryFilter) : true;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      <SEOHelmet title="Gestion de l'Agenda & Événements - B.C.A. Admin" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <Calendar className="w-6 h-6 mr-2 text-brand-600" />
            Agenda & Événements Locaux
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gérez les manifestations, salons, conférences et journées portes ouvertes de Tiaret.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button to="/admin/evenements-propositions" variant="outline" size="md">
            <CheckSquare className="w-4 h-4 mr-1.5 text-purple-600" /> Modération propositions
          </Button>
          <Button onClick={handleOpenCreate} variant="primary" size="md">
            <Plus className="w-4 h-4 mr-1.5" /> Créer un événement
          </Button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par titre d'événement..."
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
          <option value="">Tous les types d'événements</option>
          {EVENT_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Chargement des événements...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">Aucun événement répertorié.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Événement</th>
                  <th className="px-6 py-3.5">Date & Heure</th>
                  <th className="px-6 py-3.5">Lieu & Commune</th>
                  <th className="px-6 py-3.5">Tarif</th>
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
                          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0">
                            E
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-slate-900 block line-clamp-1">
                            {item.title}
                          </span>
                          <span className="text-[11px] text-slate-400 block">
                            Organisé par {item.organizer?.name || 'B.C.A.'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-800 block">
                        {safeFormatDate(item.startDate || item.date)}
                      </span>
                      <span className="text-[11px] text-slate-400 block">{item.startTime || item.time || 'Non précisé'}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="block truncate max-w-xs">{typeof item.location === 'object' ? item.location?.venue : (item.location || 'Tiaret')}</span>
                      <span className="text-[11px] text-brand-600 block">{typeof item.location === 'object' ? item.location?.commune : (item.commune || 'Tiaret')}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      {item.isFree ? 'Gratuit' : item.price ? `${item.price} DA` : 'Payant'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/evenements/${item.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                          title="Voir sur le site public"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
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
        title={editingItem ? "Modifier l'événement" : 'Ajouter un événement'}
        size="3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Titre de l'événement *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="ex. Salon Régional de l'Emploi et de l'Innovation - Tiaret 2026"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Catégorie *"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={EVENT_CATEGORIES}
              required
            />
            <Input
              label="Date de l'événement *"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
            <Input
              label="Heure de début"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Lieu physique précis *"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="ex. Maison de la Culture Ali Maachi"
              required
            />
            <Input
              label="Commune (Wilaya de Tiaret)"
              value={formData.commune}
              onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
              placeholder="Tiaret, Sougueur, Frenda, Mahdia..."
            />
          </div>

          <Textarea
            label="Description détaillée du programme"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            placeholder="Programme, intervenants, conditions d'accès..."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nom de l'organisateur"
              value={formData.organizerName}
              onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
              placeholder="ex. B.C.A. ou Association El-Amel"
            />
            <Input
              label="Numéro de contact public"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              placeholder="0550 00 00 00"
            />
          </div>

          <ImageUploader
            label="Affiche / Visuel de l'événement"
            previewUrl={previewImage}
            onFileSelect={(file) => setSelectedFile(file)}
            onChange={(url) => setPreviewImage(url)}
          />

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-wrap gap-6 text-xs font-semibold text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFree}
                onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              Entrée libre & gratuite
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              Mettre en avant dans l'accueil
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button onClick={() => setModalOpen(false)} variant="ghost" size="sm">
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={submitting}>
              {editingItem ? 'Enregistrer' : 'Créer l’événement'}
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
        title="Supprimer cet événement ?"
        message="Êtes-vous sûr de vouloir supprimer cet événement de l'agenda ?"
      />
    </div>
  );
};

export default EventsManager;
