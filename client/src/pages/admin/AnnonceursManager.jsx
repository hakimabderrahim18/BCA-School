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
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  MapPin,
  Phone,
  Tag,
} from 'lucide-react';

export const AnnonceursManager = () => {
  const { showToast } = useToast();

  const [annonceurs, setAnnonceurs] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');

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
    sector: '',
    shortDescription: '',
    description: '',
    phone: '',
    whatsapp: '',
    email: '',
    website: '',
    address: 'Centre-ville, Tiaret',
    commune: 'Tiaret',
    openingHours: 'Du Samedi au Jeudi : 08h30 - 17h00',
    facebook: '',
    instagram: '',
    isVerified: true,
    isFeatured: false,
    status: 'active',
  });
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [previewLogo, setPreviewLogo] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resA, resS] = await Promise.all([
        api.get('/annonceurs', { params: { limit: 100 } }),
        api.get('/categories', { params: { type: 'annonceur' } }),
      ]);
      setAnnonceurs(resA.data.data || []);
      let sectorList = resS.data.data || [];
      if (sectorList.length === 0) {
        const resAll = await api.get('/categories');
        sectorList = resAll.data.data || [];
      }
      setSectors(sectorList);
    } catch (err) {
      console.error('Erreur chargement annonceurs:', err);
      showToast('Impossible de charger les annonceurs.', 'error');
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
      name: '',
      sector: sectors[0]?._id || '',
      shortDescription: '',
      description: '',
      phone: '0550 00 00 00',
      whatsapp: '',
      email: '',
      website: '',
      address: 'Centre-ville, Tiaret',
      commune: 'Tiaret',
      openingHours: 'Du Samedi au Jeudi : 08h30 - 17h00',
      facebook: '',
      instagram: '',
      isVerified: true,
      isFeatured: false,
      status: 'active',
    });
    setSelectedLogo(null);
    setPreviewLogo('');
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      sector: item.sector?._id || item.sector || sectors[0]?._id || '',
      shortDescription: item.shortDescription || '',
      description: item.fullDescription || item.description || '',
      phone: item.phone || '',
      whatsapp: item.whatsapp || '',
      email: item.email || '',
      website: item.website || '',
      address: item.address || '',
      commune: item.commune || 'Tiaret',
      openingHours: item.openingHours || '',
      facebook: item.socialLinks?.facebook || '',
      instagram: item.socialLinks?.instagram || '',
      isVerified: item.isVerified ?? true,
      isFeatured: item.isFeatured ?? false,
      status: item.status || 'active',
    });
    setSelectedLogo(null);
    setPreviewLogo(item.logo || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      showToast('Le nom de l’entreprise est obligatoire.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('name', formData.name);

      const chosenSector = formData.sector || sectors[0]?._id || '';
      if (chosenSector) data.append('sector', chosenSector);

      const shortDesc = formData.shortDescription || formData.description || formData.name;
      const fullDesc = formData.description || formData.shortDescription || formData.name;
      data.append('shortDescription', shortDesc);
      data.append('description', fullDesc);
      data.append('fullDescription', fullDesc);

      data.append('phone', formData.phone || '0550 00 00 00');
      data.append('whatsapp', formData.whatsapp);
      data.append('email', formData.email);
      data.append('website', formData.website);
      data.append('address', formData.address || 'Centre-ville, Tiaret');
      data.append('commune', formData.commune || 'Tiaret');
      data.append('openingHours', formData.openingHours || 'Du Samedi au Jeudi : 08h30 - 17h00');
      data.append('isVerified', formData.isVerified);
      data.append('isFeatured', formData.isFeatured);
      data.append('status', formData.status || 'active');

      const socialObj = {
        facebook: formData.facebook,
        instagram: formData.instagram,
      };
      data.append('socialLinks', JSON.stringify(socialObj));

      if (selectedLogo) {
        data.append('logo', selectedLogo);
      } else if (editingItem?.logo) {
        data.append('logo', editingItem.logo);
      }

      if (editingItem) {
        await api.put(`/annonceurs/${editingItem._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('Fiche annonceur mise à jour.', 'success');
      } else {
        await api.post('/annonceurs', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('Nouvel annonceur ajouté à l’annuaire.', 'success');
      }

      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Erreur sauvegarde annonceur:', err);
      showToast(err.response?.data?.message || 'Erreur lors de l’enregistrement.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await api.delete(`/annonceurs/${deleteId}`);
      showToast('Annonceur supprimé de l’annuaire.', 'success');
      setDeleteId(null);
      fetchData();
    } catch (err) {
      console.error('Erreur suppression annonceur:', err);
      showToast('Erreur lors de la suppression.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = annonceurs.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.commune?.toLowerCase().includes(search.toLowerCase());
    const secId = a.sector?._id || a.sector;
    const matchesSec = sectorFilter ? secId === sectorFilter : true;
    return matchesSearch && matchesSec;
  });

  return (
    <div className="space-y-6">
      <SEOHelmet title="Gestion des Annonceurs - B.C.A. Admin" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <Building2 className="w-6 h-6 mr-2 text-brand-600" />
            Annuaire des Annonceurs & Partenaires
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gérez les fiches vitrines des commerces, cabinets et entreprises de la région de Tiaret.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button to="/admin/petites-annonces" variant="outline" size="md">
            <Tag className="w-4 h-4 mr-1.5 text-amber-500" /> Petites annonces
          </Button>
          <Button onClick={handleOpenCreate} variant="primary" size="md">
            <Plus className="w-4 h-4 mr-1.5" /> Ajouter un annonceur
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom d'entreprise ou commune..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-500"
          />
        </div>

        <select
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="w-full sm:w-64 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-500 text-slate-700"
        >
          <option value="">Tous les secteurs d'activité</option>
          {sectors.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Chargement de l’annuaire...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">Aucun annonceur répertorié.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Établissement</th>
                  <th className="px-6 py-3.5">Secteur</th>
                  <th className="px-6 py-3.5">Contact</th>
                  <th className="px-6 py-3.5">Commune</th>
                  <th className="px-6 py-3.5 text-center">Vérifié</th>
                  <th className="px-6 py-3.5 text-center">Statut</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.logo ? (
                          <img
                            src={getImageUrl(item.logo)}
                            alt=""
                            className="w-10 h-10 rounded-xl object-contain border border-slate-200 p-1 shrink-0 bg-white"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold shrink-0">
                            {item.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-slate-900 block line-clamp-1">
                            {item.name}
                          </span>
                          <span className="text-[11px] text-slate-400 line-clamp-1">
                            {item.shortDescription}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {item.sector?.name || 'Commerce'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-700" dir="ltr">
                      <bdi>{item.phone || 'N/A'}</bdi>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{item.commune || 'Tiaret'}</td>
                    <td className="px-6 py-4 text-center">
                      {item.isVerified ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" />
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/annonces-publicite/${item.slug}`}
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
        title={editingItem ? "Modifier l'annonceur" : 'Ajouter un annonceur'}
        size="3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Raison sociale / Nom de l'établissement *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="ex. Agence Immobilière Le Rostomien"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Secteur d'activité *"
              value={formData.sector}
              onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
              options={sectors.map((s) => ({ value: s._id, label: s.name }))}
            />
            <Input
              label="Commune (Wilaya de Tiaret)"
              value={formData.commune}
              onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
              placeholder="Tiaret, Sougueur, Frenda..."
            />
          </div>

          <Textarea
            label="Présentation courte (carte annuaire)"
            value={formData.shortDescription}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
            rows={2}
            placeholder="Bref résumé des activités de l'entreprise..."
          />

          <Textarea
            label="Description détaillée (page dédiée)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            placeholder="Historique, services, points forts..."
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Téléphone principal"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="0550 00 00 00"
            />
            <Input
              label="Numéro WhatsApp"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              placeholder="213550000000"
            />
            <Input
              label="Adresse e-mail"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contact@entreprise.dz"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Adresse physique complète"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Boulevard Pasteur, Centre-ville, Tiaret"
            />
            <Input
              label="Site web ou URL"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://www.exemple.dz"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Lien Facebook"
              value={formData.facebook}
              onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
              placeholder="https://facebook.com/..."
            />
            <Input
              label="Lien Instagram"
              value={formData.instagram}
              onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              placeholder="https://instagram.com/..."
            />
          </div>

          <ImageUploader
            label="Logo officiel"
            previewUrl={previewLogo}
            onFileSelect={(file) => setSelectedLogo(file)}
            onChange={(url) => setPreviewLogo(url)}
          />

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-wrap gap-6 text-xs font-semibold text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isVerified}
                onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              Badge "Établissement vérifié"
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
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button onClick={() => setModalOpen(false)} variant="ghost" size="sm">
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={submitting}>
              {editingItem ? 'Enregistrer' : 'Créer la fiche'}
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
        title="Supprimer cet annonceur ?"
        message="Êtes-vous sûr de vouloir supprimer cet établissement de l'annuaire ?"
      />
    </div>
  );
};

export default AnnonceursManager;
