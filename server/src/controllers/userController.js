import User from '../models/User.js';
import { sendSuccess, sendError, sendPagination } from '../utils/apiResponse.js';

export const userController = {
  /**
   * Liste paginée des utilisateurs du système (Admin only)
   * GET /api/users
   */
  async getUsers(req, res, next) {
    try {
      const { page = 1, limit = 10, search = '', role = '', status = '' } = req.query;
      const query = {};

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      if (role) query.role = role;
      if (status !== '') query.isActive = status === 'true';

      const total = await User.countDocuments(query);
      const users = await User.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

      return sendPagination(res, users, total, page, limit, 'Liste des utilisateurs');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Création d'un nouvel utilisateur par un administrateur
   * POST /api/users
   */
  async createUser(req, res, next) {
    try {
      let name = req.body.name;
      if (!name && (req.body.firstName || req.body.lastName)) {
        name = `${req.body.firstName || ''} ${req.body.lastName || ''}`.trim();
      }
      const { email, password, role, phone } = req.body;

      if (!name || !email || !password || !role) {
        return sendError(res, 400, 'Nom, email, mot de passe et rôle sont obligatoires.');
      }

      const existing = await User.findOne({ email: email.toLowerCase().trim() });
      if (existing) {
        return sendError(res, 409, 'Un compte existe déjà avec cette adresse e-mail.');
      }

      const newUser = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        role,
        phone: phone ? phone.trim() : '',
      });

      return sendSuccess(res, 201, 'Utilisateur créé avec succès.', {
        user: newUser.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Modification d'un utilisateur existant (rôle, statut actif/inactif, mot de passe)
   * PUT /api/users/:id
   */
  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      let name = req.body.name;
      if (!name && (req.body.firstName || req.body.lastName)) {
        name = `${req.body.firstName || ''} ${req.body.lastName || ''}`.trim();
      }
      const { role, isActive, phone, password } = req.body;

      const user = await User.findById(id).select('+password');
      if (!user) {
        return sendError(res, 404, 'Utilisateur introuvable.');
      }

      // Empêcher l'administrateur de désactiver ou rétrograder son propre compte
      if (req.user._id.toString() === id && isActive === false) {
        return sendError(res, 400, 'Vous ne pouvez pas désactiver votre propre compte administrateur.');
      }

      if (name) user.name = name.trim();
      if (role) user.role = role;
      if (isActive !== undefined) user.isActive = isActive;
      if (phone !== undefined) user.phone = phone.trim();
      if (password) user.password = password;

      await user.save();

      return sendSuccess(res, 200, 'Utilisateur mis à jour avec succès.', {
        user: user.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Suppression d'un utilisateur (Admin only)
   * DELETE /api/users/:id
   */
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      if (req.user._id.toString() === id) {
        return sendError(res, 400, 'Vous ne pouvez pas supprimer votre propre compte.');
      }

      const deleted = await User.findByIdAndDelete(id);
      if (!deleted) {
        return sendError(res, 404, 'Utilisateur introuvable.');
      }

      return sendSuccess(res, 200, 'Utilisateur supprimé avec succès.');
    } catch (error) {
      next(error);
    }
  },
};
