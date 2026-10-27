import Category from '../models/Category.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const categoryController = {
  /**
   * Récupère la liste des catégories (filtrable par type)
   * GET /api/categories?type=formation
   */
  async getCategories(req, res, next) {
    try {
      const { type, all } = req.query;
      const filter = {};

      if (type) {
        filter.type = type;
      }

      // Par défaut, ne renvoie que les catégories actives pour le public
      if (!all || all !== 'true') {
        filter.isActive = true;
      }

      const categories = await Category.find(filter).sort({ order: 1, name: 1 });
      return sendSuccess(res, 200, 'Catégories récupérées', categories);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Crée une nouvelle catégorie (Admin / Éditeur)
   * POST /api/categories
   */
  async createCategory(req, res, next) {
    try {
      const { name, type, description, icon, color, order } = req.body;

      if (!name || !type) {
        return sendError(res, 400, 'Le nom et le type de catégorie sont obligatoires.');
      }

      const category = await Category.create({
        name,
        type,
        description: description || '',
        icon: icon || 'Folder',
        color: color || '#0e8ce8',
        order: order || 0,
      });

      return sendSuccess(res, 201, 'Catégorie créée avec succès', category);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Met à jour une catégorie existante
   * PUT /api/categories/:id
   */
  async updateCategory(req, res, next) {
    try {
      const { id } = req.params;
      const { name, description, icon, color, order, isActive } = req.body;

      const category = await Category.findById(id);
      if (!category) {
        return sendError(res, 404, 'Catégorie introuvable.');
      }

      if (name) category.name = name;
      if (description !== undefined) category.description = description;
      if (icon) category.icon = icon;
      if (color) category.color = color;
      if (order !== undefined) category.order = order;
      if (isActive !== undefined) category.isActive = isActive;

      await category.save();

      return sendSuccess(res, 200, 'Catégorie mise à jour avec succès', category);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Supprime une catégorie (Admin only)
   * DELETE /api/categories/:id
   */
  async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await Category.findByIdAndDelete(id);

      if (!deleted) {
        return sendError(res, 404, 'Catégorie introuvable.');
      }

      return sendSuccess(res, 200, 'Catégorie supprimée avec succès.');
    } catch (error) {
      next(error);
    }
  },
};
