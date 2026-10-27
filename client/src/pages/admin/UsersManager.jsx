import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { SEOHelmet } from '../../components/common/SEOHelmet';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { StatusBadge } from '../../components/admin/StatusBadge';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Shield,
  ShieldCheck,
  Lock,
} from 'lucide-react';

const ROLES_LIST = [
  { value: 'admin', label: 'Administrateur (Tous les droits d’accès et gestion)' },
  { value: 'editor', label: 'Éditeur (Peut créer, modifier et publier les contenus)' },
  { value: 'writer', label: 'Rédacteur (Crée et soumet des contenus à validation)' },
];

export const UsersManager = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
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
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: 'editor',
    isActive: true,
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data.data || []);
    } catch (err) {
      console.error('Erreur chargement utilisateurs:', err);
      showToast('Impossible de charger la liste des utilisateurs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      role: 'editor',
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    const names = (item.name || '').trim().split(' ');
    setEditingItem(item);
    setFormData({
      firstName: item.firstName || names[0] || '',
      lastName: item.lastName || names.slice(1).join(' ') || '',
      email: item.email || '',
      phone: item.phone || '',
      password: '', // Blank unless changing
      role: item.role || 'editor',
      isActive: item.isActive ?? true,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email) {
      showToast('Le nom, prénom et e-mail sont obligatoires.', 'error');
      return;
    }

    if (!editingItem && !formData.password) {
      showToast('Veuillez définir un mot de passe initial.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
      };
      if (editingItem) {
        if (!payload.password) delete payload.password; // Do not overwrite with blank password
        await api.put(`/users/${editingItem._id}`, payload);
        showToast('Utilisateur mis à jour avec succès.', 'success');
      } else {
        await api.post('/users', payload);
        showToast('Nouvel utilisateur créé.', 'success');
      }

      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error('Erreur sauvegarde utilisateur:', err);
      showToast(err.response?.data?.message || 'Erreur lors de l’enregistrement.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    if (deleteId === currentUser?.id || deleteId === currentUser?._id) {
      showToast('Vous ne pouvez pas supprimer votre propre compte connecté.', 'error');
      setDeleteId(null);
      return;
    }

    try {
      setDeleting(true);
      await api.delete(`/users/${deleteId}`);
      showToast('Compte utilisateur supprimé.', 'success');
      setDeleteId(null);
      fetchUsers();
    } catch (err) {
      console.error('Erreur suppression:', err);
      showToast('Erreur lors de la suppression.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const fullName = (u.name || `${u.firstName || ''} ${u.lastName || ''}`).toLowerCase();
    return (
      fullName.includes(q) ||
      u.firstName?.toLowerCase().includes(q) ||
      u.lastName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <SEOHelmet title="Gestion des Utilisateurs & Permissions - B.C.A. Admin" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <Users className="w-6 h-6 mr-2 text-brand-600" />
            Comptes Utilisateurs & Rôles
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gérez les accès à la plateforme B.C.A. : Administrateurs, Éditeurs et Rédacteurs.
          </p>
        </div>
        <Button onClick={handleOpenCreate} variant="primary" size="md">
          <Plus className="w-4 h-4 mr-1.5" /> Créer un compte
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Chargement des comptes...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">Aucun utilisateur trouvé.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Utilisateur</th>
                  <th className="px-6 py-3.5">Adresse E-mail</th>
                  <th className="px-6 py-3.5">Rôle & Privilèges</th>
                  <th className="px-6 py-3.5 text-center">Statut</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 text-amber-400 font-bold flex items-center justify-center shrink-0">
                          {(item.firstName || item.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">
                            {item.name || `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'Utilisateur'}
                          </span>
                          {item.phone && (
                            <span className="text-[11px] text-slate-400 block font-mono" dir="ltr">
                              <bdi>{item.phone}</bdi>
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-800">{item.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase bg-slate-100 text-slate-800 border border-slate-200">
                        {item.role}
                      </span>
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
                          disabled={item._id === currentUser?.id || item._id === currentUser?._id}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
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
        title={editingItem ? "Modifier l'utilisateur" : 'Créer un compte utilisateur'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Prénom *"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="ex. Karim"
              required
            />
            <Input
              label="Nom de famille *"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="ex. Benmoussa"
              required
            />
          </div>

          <Input
            label="Adresse e-mail (Identifiant de connexion) *"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="karim@bca-tiaret.dz"
            required
          />

          <Input
            label="Numéro de téléphone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="0550 00 00 00"
          />

          <Input
            label={editingItem ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe initial *'}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••••••"
            required={!editingItem}
          />

          <Select
            label="Rôle et niveau d'autorisation *"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            options={ROLES_LIST}
            required
          />

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-6 text-xs font-semibold text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              Compte actif (autorisé à se connecter)
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button onClick={() => setModalOpen(false)} variant="ghost" size="sm">
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={submitting}>
              {editingItem ? 'Enregistrer' : 'Créer le compte'}
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
        title="Supprimer cet utilisateur ?"
        message="Êtes-vous sûr de vouloir supprimer définitivement ce compte administrateur/éditeur ?"
      />
    </div>
  );
};

export default UsersManager;
