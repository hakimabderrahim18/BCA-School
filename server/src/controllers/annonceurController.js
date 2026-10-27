import mongoose from 'mongoose';
import Annonceur from '../models/Annonceur.js';
import PetiteAnnonce from '../models/PetiteAnnonce.js';
import Category from '../models/Category.js';
import { sendSuccess, sendError, sendPagination } from '../utils/apiResponse.js';

export const annonceurController = {
  // ============================================================================
  // ANNUAIRE DES ANNONCEURS (PUBLIC)
  // ============================================================================

  /**
   * Annuaire des annonceurs avec filtres par secteur d'activité et commune
   * GET /api/annonceurs
   */
  async getAnnonceurs(req, res, next) {
    try {
      const { sector, commune, search, page = 1, limit = 12 } = req.query;
      const query = { status: 'active' };

      if (sector) query.sector = sector;
      if (commune) query.commune = { $regex: commune, $options: 'i' };

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { shortDescription: { $regex: search, $options: 'i' } },
          { address: { $regex: search, $options: 'i' } },
        ];
      }

      const total = await Annonceur.countDocuments(query);
      const annonceurs = await Annonceur.find(query)
        .populate('sector', 'name slug color icon')
        .sort({ isFeatured: -1, name: 1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

      return sendPagination(res, annonceurs, total, page, limit, 'Annuaire des annonceurs');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Annonceurs partenaires pour la mise en avant accueil (logos défilants)
   * GET /api/annonceurs/featured
   */
  async getFeaturedAnnonceurs(req, res, next) {
    try {
      const annonceurs = await Annonceur.find({ status: 'active', isFeatured: true })
        .populate('sector', 'name slug')
        .limit(10);

      return sendSuccess(res, 200, 'Annonceurs en vedette', annonceurs);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Fiche détaillée dédiée d'un annonceur
   * GET /api/annonceurs/:slug
   */
  async getAnnonceurBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const annonceur = await Annonceur.findOne({ slug, status: 'active' }).populate(
        'sector',
        'name slug color icon'
      );

      if (!annonceur) {
        return sendError(res, 404, 'Annonceur introuvable.');
      }

      return sendSuccess(res, 200, 'Fiche annonceur', annonceur);
    } catch (error) {
      next(error);
    }
  },

  // ============================================================================
  // PETITES ANNONCES LOCALES (PUBLIC)
  // ============================================================================

  /**
   * Liste des petites annonces validées et non expirées
   * GET /api/petites-annonces
   */
  async getPetitesAnnonces(req, res, next) {
    try {
      const { category, type, commune, search, page = 1, limit = 12 } = req.query;
      const now = new Date();
      const query = { status: 'published', expiresAt: { $gte: now } };

      if (category) query.category = category;
      if (type) query.type = type;
      if (commune) query.commune = { $regex: commune, $options: 'i' };

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      const total = await PetiteAnnonce.countDocuments(query);
      const annonces = await PetiteAnnonce.find(query)
        .populate('category', 'name slug icon color')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

      return sendPagination(res, annonces, total, page, limit, 'Petites annonces locales');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Déposer une petite annonce (soumise à modération)
   * POST /api/petites-annonces
   */
  async createPetiteAnnonce(req, res, next) {
    try {
      const data = { ...req.body };
      if (req.file) data.images = [req.file.path];

      if (!data.title || !data.category || !data.description || !data.contactName || !data.contactPhone) {
        return sendError(res, 400, 'Titre, catégorie, description et coordonnées de contact sont obligatoires.');
      }

      const annonce = await PetiteAnnonce.create({
        ...data,
        status: 'pending', // En attente de validation par l'administrateur
      });

      return sendSuccess(
        res,
        201,
        'Votre petite annonce a été enregistrée. Elle sera visible publiquement dès validation par nos équipes.',
        annonce
      );
    } catch (error) {
      next(error);
    }
  },

  // ============================================================================
  // GESTION ADMIN (ANNONCEURS & MODÉRATION PETITES ANNONCES)
  // ============================================================================

  async createAnnonceur(req, res, next) {
    try {
      const data = { ...req.body };
      if (req.file) {
        data.logo = req.file.path.replace(/\\/g, '/');
      }

      // Normalisation des descriptions
      data.fullDescription = data.fullDescription || data.description || data.shortDescription || data.name;
      data.shortDescription = data.shortDescription || data.description || data.fullDescription || data.name;
      data.address = data.address || 'Centre-ville, Tiaret';
      data.phone = data.phone || '0550000000';
      data.logo = data.logo || '/uploads/partners/default-banner.webp';

      // Résolution du secteur / catégorie
      if (!data.sector || !mongoose.Types.ObjectId.isValid(data.sector)) {
        const cat = await Category.findOne({ type: 'annonceur' }) || await Category.findOne({});
        if (cat) data.sector = cat._id;
      }

      if (typeof data.socialLinks === 'string') {
        try {
          data.socialLinks = JSON.parse(data.socialLinks);
        } catch {}
      }
      if (typeof data.coordinates === 'string') {
        try {
          data.coordinates = JSON.parse(data.coordinates);
        } catch {}
      }

      const annonceur = await Annonceur.create(data);
      return sendSuccess(res, 201, 'Annonceur ajouté à l’annuaire', annonceur);
    } catch (error) {
      next(error);
    }
  },

  async updateAnnonceur(req, res, next) {
    try {
      const { id } = req.params;
      const data = { ...req.body };
      if (req.file) {
        data.logo = req.file.path.replace(/\\/g, '/');
      }

      if (data.description && !data.fullDescription) {
        data.fullDescription = data.description;
      }
      if (data.description && !data.shortDescription) {
        data.shortDescription = data.description;
      }

      if (data.sector && !mongoose.Types.ObjectId.isValid(data.sector)) {
        delete data.sector;
      }
      if (!data.logo) {
        delete data.logo;
      }

      if (typeof data.socialLinks === 'string') {
        try {
          data.socialLinks = JSON.parse(data.socialLinks);
        } catch {}
      }
      if (typeof data.coordinates === 'string') {
        try {
          data.coordinates = JSON.parse(data.coordinates);
        } catch {}
      }

      const annonceur = await Annonceur.findByIdAndUpdate(id, data, { new: true, runValidators: true });
      if (!annonceur) return sendError(res, 404, 'Annonceur introuvable.');

      return sendSuccess(res, 200, 'Fiche annonceur mise à jour', annonceur);
    } catch (error) {
      next(error);
    }
  },

  async deleteAnnonceur(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await Annonceur.findByIdAndDelete(id);
      if (!deleted) return sendError(res, 404, 'Annonceur introuvable.');

      return sendSuccess(res, 200, 'Annonceur supprimé.');
    } catch (error) {
      next(error);
    }
  },

  async getAdminPetitesAnnonces(req, res, next) {
    try {
      const { status, page = 1, limit = 15 } = req.query;
      const query = {};
      if (status) query.status = status;

      const total = await PetiteAnnonce.countDocuments(query);
      const annonces = await PetiteAnnonce.find(query)
        .populate('category', 'name slug')
        .populate('moderatedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

      return sendPagination(res, annonces, total, page, limit, 'Modération des petites annonces');
    } catch (error) {
      next(error);
    }
  },

  async moderatePetiteAnnonce(req, res, next) {
    try {
      const { id } = req.params;
      const { status, moderationNote } = req.body;

      const annonce = await PetiteAnnonce.findById(id);
      if (!annonce) return sendError(res, 404, 'Petite annonce introuvable.');

      annonce.status = status;
      if (moderationNote !== undefined) annonce.moderationNote = moderationNote;
      annonce.moderatedBy = req.user._id;

      await annonce.save();
      return sendSuccess(res, 200, `Petite annonce mise à jour (statut : ${status})`, annonce);
    } catch (error) {
      next(error);
    }
  },

  async deletePetiteAnnonce(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await PetiteAnnonce.findByIdAndDelete(id);
      if (!deleted) return sendError(res, 404, 'Petite annonce introuvable.');

      return sendSuccess(res, 200, 'Petite annonce supprimée.');
    } catch (error) {
      next(error);
    }
  },
};
