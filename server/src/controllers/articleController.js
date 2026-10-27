import mongoose from 'mongoose';
import Article from '../models/Article.js';
import Category from '../models/Category.js';
import { sendSuccess, sendError, sendPagination } from '../utils/apiResponse.js';
import { ROLES } from '../config/roles.js';

export const articleController = {
  // ============================================================================
  // ARTICLES - PUBLIC
  // ============================================================================

  /**
   * Récupère la liste des articles publiés avec recherche et filtres
   * GET /api/articles
   */
  async getArticles(req, res, next) {
    try {
      const { category, tag, search, page = 1, limit = 9 } = req.query;
      const query = { status: 'published' };

      if (category) query.category = category;
      if (tag) query.tags = { $in: [tag] };

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { summary: { $regex: search, $options: 'i' } },
        ];
      }

      const total = await Article.countDocuments(query);
      const articles = await Article.find(query)
        .populate('category', 'name slug color icon')
        .populate('author', 'name avatar')
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

      return sendPagination(res, articles, total, page, limit, 'Liste des actualités');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Articles en vedette pour la page d'accueil
   * GET /api/articles/featured
   */
  async getFeaturedArticles(req, res, next) {
    try {
      const articles = await Article.find({ status: 'published', isFeatured: true })
        .populate('category', 'name slug color')
        .populate('author', 'name')
        .sort({ publishedAt: -1 })
        .limit(4);

      return sendSuccess(res, 200, 'Actualités à la une', articles);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Derniers articles publiés
   * GET /api/articles/latest
   */
  async getLatestArticles(req, res, next) {
    try {
      const articles = await Article.find({ status: 'published' })
        .populate('category', 'name slug color')
        .sort({ publishedAt: -1 })
        .limit(5);

      return sendSuccess(res, 200, 'Dernières actualités', articles);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Détail d'un article par son slug et incrément des vues
   * GET /api/articles/:slug
   */
  async getArticleBySlug(req, res, next) {
    try {
      const { slug } = req.params;

      const article = await Article.findOneAndUpdate(
        { slug, status: 'published' },
        { $inc: { viewsCount: 1 } },
        { new: true }
      )
        .populate('category', 'name slug color icon')
        .populate('author', 'name avatar role');

      if (!article) {
        return sendError(res, 404, 'Article introuvable.');
      }

      // Articles similaires dans la même catégorie
      const related = await Article.find({
        category: article.category._id,
        _id: { $ne: article._id },
        status: 'published',
      })
        .select('title slug coverImage publishedAt')
        .limit(3);

      return sendSuccess(res, 200, 'Détail de l’article', {
        article,
        related,
      });
    } catch (error) {
      next(error);
    }
  },

  // ============================================================================
  // GESTION ADMIN (ARTICLES)
  // ============================================================================

  /**
   * Récupère tous les articles pour le back-office (avec filtres de statut)
   * GET /api/articles/admin/all
   */
  async getAdminArticles(req, res, next) {
    try {
      const { status, category, search, page = 1, limit = 15 } = req.query;
      const query = {};

      if (status) query.status = status;
      if (category) query.category = category;

      // Un rédacteur ne visualise que ses propres articles
      if (req.user.role === ROLES.WRITER) {
        query.author = req.user._id;
      }

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { summary: { $regex: search, $options: 'i' } },
        ];
      }

      const total = await Article.countDocuments(query);
      const articles = await Article.find(query)
        .populate('category', 'name slug')
        .populate('author', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

      return sendPagination(res, articles, total, page, limit, 'Gestion des articles');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Création d'un article
   * POST /api/articles
   */
  async createArticle(req, res, next) {
    try {
      const data = { ...req.body };
      data.author = req.user._id;

      if (req.file) {
        data.coverImage = req.file.path.replace(/\\/g, '/');
      }

      // Normalisation du résumé (summary) & contenu
      data.summary = data.summary || data.excerpt || data.title;
      data.content = data.content || data.summary || '<p>Contenu en cours de rédaction...</p>';
      data.coverImage = data.coverImage || (req.file ? req.file.path.replace(/\\/g, '/') : '/uploads/articles/default-article.webp');

      // Résolution de la catégorie
      if (!data.category || !mongoose.Types.ObjectId.isValid(data.category)) {
        const cat = await Category.findOne({ type: 'article' }) || await Category.findOne({});
        if (cat) data.category = cat._id;
      }

      // Normalisation des tags (JSON array ou string à virgule)
      if (typeof data.tags === 'string') {
        try {
          const parsed = JSON.parse(data.tags);
          data.tags = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          data.tags = data.tags.split(',').map((t) => t.trim()).filter(Boolean);
        }
      }

      // Si le rôle est "writer", il ne peut pas publier directement : statut 'pending' ou 'draft'
      if (req.user.role === ROLES.WRITER && data.status === 'published') {
        data.status = 'pending';
      }

      if (data.status === 'published' && !data.publishedAt) {
        data.publishedAt = new Date();
      }

      const article = await Article.create(data);
      return sendSuccess(res, 201, 'Article créé avec succès', article);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mise à jour d'un article
   * PUT /api/articles/:id
   */
  async updateArticle(req, res, next) {
    try {
      const { id } = req.params;
      const article = await Article.findById(id);

      if (!article) {
        return sendError(res, 404, 'Article introuvable.');
      }

      // Si rédacteur, vérifier qu'il est bien l'auteur et qu'il n'est pas déjà publié
      if (req.user.role === ROLES.WRITER) {
        if (article.author.toString() !== req.user._id.toString()) {
          return sendError(res, 403, 'Vous ne pouvez modifier que vos propres articles.');
        }
        if (article.status === 'published') {
          return sendError(res, 403, 'Un article publié ne peut être modifié que par un éditeur ou administrateur.');
        }
      }

      const data = { ...req.body };
      if (req.file) {
        data.coverImage = req.file.path.replace(/\\/g, '/');
      } else if (!data.coverImage) {
        delete data.coverImage;
      }

      if (data.excerpt && !data.summary) {
        data.summary = data.excerpt;
      }

      if (data.category && !mongoose.Types.ObjectId.isValid(data.category)) {
        delete data.category;
      }

      if (typeof data.tags === 'string') {
        try {
          const parsed = JSON.parse(data.tags);
          data.tags = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          data.tags = data.tags.split(',').map((t) => t.trim()).filter(Boolean);
        }
      }

      if (req.user.role === ROLES.WRITER && data.status === 'published') {
        data.status = 'pending';
      }

      if (data.status === 'published' && !article.publishedAt) {
        data.publishedAt = new Date();
      }

      const updated = await Article.findByIdAndUpdate(id, data, { new: true, runValidators: true });
      return sendSuccess(res, 200, 'Article mis à jour', updated);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Suppression d'un article
   * DELETE /api/articles/:id
   */
  async deleteArticle(req, res, next) {
    try {
      const { id } = req.params;
      const article = await Article.findById(id);

      if (!article) {
        return sendError(res, 404, 'Article introuvable.');
      }

      if (req.user.role === ROLES.WRITER && article.author.toString() !== req.user._id.toString()) {
        return sendError(res, 403, 'Vous ne pouvez supprimer que vos propres articles.');
      }

      await Article.findByIdAndDelete(id);
      return sendSuccess(res, 200, 'Article supprimé avec succès.');
    } catch (error) {
      next(error);
    }
  },
};
