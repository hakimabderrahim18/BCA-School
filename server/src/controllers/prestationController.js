import mongoose from 'mongoose';
import Prestation from '../models/Prestation.js';
import Realisation from '../models/Realisation.js';
import QuoteRequest from '../models/QuoteRequest.js';
import Category from '../models/Category.js';
import { sendSuccess, sendError, sendPagination } from '../utils/apiResponse.js';
import { emailService } from '../services/emailService.js';
import { exportToCSV } from '../services/csvExportService.js';

export const prestationController = {
  // ============================================================================
  // PRESTATIONS (SERVICES) - PUBLIC
  // ============================================================================

  /**
   * Liste des prestations publiques classées par catégorie
   * GET /api/prestations
   */
  async getPrestations(req, res, next) {
    try {
      const { category } = req.query;
      const query = { status: 'published' };

      if (category) query.category = category;

      const prestations = await Prestation.find(query)
        .populate('category', 'name slug icon color')
        .sort({ order: 1, createdAt: -1 });

      return sendSuccess(res, 200, 'Catalogue des prestations', prestations);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Prestations mises en avant
   * GET /api/prestations/featured
   */
  async getFeaturedPrestations(req, res, next) {
    try {
      const prestations = await Prestation.find({ status: 'published', isFeatured: true })
        .populate('category', 'name slug icon color')
        .sort({ order: 1 })
        .limit(6);

      return sendSuccess(res, 200, 'Prestations en vedette', prestations);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Détail d'une prestation avec ses réalisations associées
   * GET /api/prestations/:slug
   */
  async getPrestationBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const prestation = await Prestation.findOne({ slug })
        .populate('category', 'name slug icon color')
        .populate({
          path: 'realisations',
          options: { sort: { date: -1 } },
        });

      if (!prestation) {
        return sendError(res, 404, 'Prestation introuvable.');
      }

      return sendSuccess(res, 200, 'Détail de la prestation', prestation);
    } catch (error) {
      next(error);
    }
  },

  // ============================================================================
  // RÉALISATIONS (PORTFOLIO) - PUBLIC
  // ============================================================================

  /**
   * Liste des réalisations (portfolio projets réalisés à Tiaret)
   * GET /api/realisations
   */
  async getRealisations(req, res, next) {
    try {
      const { prestation, page = 1, limit = 12 } = req.query;
      const query = {};

      if (prestation) query.prestation = prestation;

      const total = await Realisation.countDocuments(query);
      const realisations = await Realisation.find(query)
        .populate('prestation', 'title slug')
        .sort({ isFeatured: -1, date: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

      return sendPagination(res, realisations, total, page, limit, 'Nos réalisations');
    } catch (error) {
      next(error);
    }
  },

  // ============================================================================
  // DEMANDES DE DEVIS (PUBLIC)
  // ============================================================================

  /**
   * Soumission d'une demande de devis en ligne
   * POST /api/quotes
   */
  async requestQuote(req, res, next) {
    try {
      const { fullName, company, email, phone, prestationId, budget, deadline, projectDescription, type, adSlotInterest } = req.body;

      if (!fullName || !email || !phone || !projectDescription) {
        return sendError(res, 400, 'Nom, email, téléphone et description du besoin sont obligatoires.');
      }

      let prestation = null;
      if (prestationId) {
        prestation = await Prestation.findById(prestationId);
      }

      const quote = await QuoteRequest.create({
        fullName: fullName.trim(),
        company: company ? company.trim() : '',
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        prestation: prestation ? prestation._id : null,
        budget: budget || 'Non précisé',
        deadline: deadline || 'Dès que possible',
        projectDescription: projectDescription.trim(),
        type: type || 'prestation',
        adSlotInterest: adSlotInterest || '',
      });

      // Notification email asynchrone
      emailService.sendQuoteRequestNotification({
        fullName,
        company,
        email,
        phone,
        type: type || 'prestation',
        projectDescription,
      });

      return sendSuccess(res, 201, 'Votre demande de devis a été transmise à notre équipe commerciale.', quote);
    } catch (error) {
      next(error);
    }
  },

  // ============================================================================
  // GESTION ADMIN (PRESTATIONS & RÉALISATIONS)
  // ============================================================================

  async createPrestation(req, res, next) {
    try {
      const data = { ...req.body };
      if (req.file) data.image = req.file.path.replace(/\\/g, '/');

      // Normalisation description et résumé
      data.summary = data.summary || data.shortDescription || data.description || data.title;
      data.description = data.description || data.summary || data.shortDescription || data.title;

      // Résolution sécurisée de la catégorie (ObjectId)
      if (data.category && !mongoose.Types.ObjectId.isValid(data.category)) {
        let cat = await Category.findOne({
          $or: [{ slug: data.category }, { name: new RegExp(data.category, 'i') }],
          type: 'prestation',
        });
        if (!cat) {
          cat = await Category.findOne({ type: 'prestation' });
        }
        if (cat) {
          data.category = cat._id;
        }
      }

      if (data.startingPrice) {
        data.priceDisplay = `À partir de ${Number(data.startingPrice).toLocaleString('fr-DZ')} DZD`;
      }

      if (typeof data.benefits === 'string') {
        try {
          data.benefits = JSON.parse(data.benefits);
        } catch {
          data.benefits = data.benefits.split('\n').map((b) => b.trim()).filter(Boolean);
        }
      }
      if (typeof data.examples === 'string') {
        try {
          data.examples = JSON.parse(data.examples);
        } catch {
          data.examples = data.examples.split('\n').map((e) => e.trim()).filter(Boolean);
        }
      }
      if (typeof data.steps === 'string') {
        try {
          data.steps = JSON.parse(data.steps);
        } catch {
          data.steps = data.steps.split('\n').filter(Boolean).map((t, idx) => ({
            stepNumber: idx + 1,
            title: t.trim(),
            description: '',
          }));
        }
      }

      const prestation = await Prestation.create(data);
      return sendSuccess(res, 201, 'Prestation créée avec succès', prestation);
    } catch (error) {
      next(error);
    }
  },

  async updatePrestation(req, res, next) {
    try {
      const { id } = req.params;
      const data = { ...req.body };
      if (req.file) data.image = req.file.path.replace(/\\/g, '/');

      if (data.shortDescription && !data.summary) {
        data.summary = data.shortDescription;
      }
      if (!data.description && data.summary) {
        data.description = data.summary;
      }

      if (data.category && !mongoose.Types.ObjectId.isValid(data.category)) {
        let cat = await Category.findOne({
          $or: [{ slug: data.category }, { name: new RegExp(data.category, 'i') }],
          type: 'prestation',
        });
        if (!cat) {
          cat = await Category.findOne({ type: 'prestation' });
        }
        if (cat) {
          data.category = cat._id;
        }
      }

      if (data.startingPrice) {
        data.priceDisplay = `À partir de ${Number(data.startingPrice).toLocaleString('fr-DZ')} DZD`;
      }

      if (typeof data.benefits === 'string') {
        try {
          data.benefits = JSON.parse(data.benefits);
        } catch {
          data.benefits = data.benefits.split('\n').map((b) => b.trim()).filter(Boolean);
        }
      }
      if (typeof data.examples === 'string') {
        try {
          data.examples = JSON.parse(data.examples);
        } catch {
          data.examples = data.examples.split('\n').map((e) => e.trim()).filter(Boolean);
        }
      }
      if (typeof data.steps === 'string') {
        try {
          data.steps = JSON.parse(data.steps);
        } catch {
          data.steps = data.steps.split('\n').filter(Boolean).map((t, idx) => ({
            stepNumber: idx + 1,
            title: t.trim(),
            description: '',
          }));
        }
      }

      const prestation = await Prestation.findByIdAndUpdate(id, data, { new: true, runValidators: true });
      if (!prestation) return sendError(res, 404, 'Prestation introuvable.');

      return sendSuccess(res, 200, 'Prestation mise à jour', prestation);
    } catch (error) {
      next(error);
    }
  },

  async deletePrestation(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await Prestation.findByIdAndDelete(id);
      if (!deleted) return sendError(res, 404, 'Prestation introuvable.');

      return sendSuccess(res, 200, 'Prestation supprimée avec succès.');
    } catch (error) {
      next(error);
    }
  },

  async createRealisation(req, res, next) {
    try {
      const data = { ...req.body };
      if (req.file) data.coverImage = req.file.path;

      const realisation = await Realisation.create(data);
      return sendSuccess(res, 201, 'Réalisation ajoutée avec succès', realisation);
    } catch (error) {
      next(error);
    }
  },

  async updateRealisation(req, res, next) {
    try {
      const { id } = req.params;
      const data = { ...req.body };
      if (req.file) data.coverImage = req.file.path;

      const realisation = await Realisation.findByIdAndUpdate(id, data, { new: true, runValidators: true });
      if (!realisation) return sendError(res, 404, 'Réalisation introuvable.');

      return sendSuccess(res, 200, 'Réalisation mise à jour', realisation);
    } catch (error) {
      next(error);
    }
  },

  async deleteRealisation(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await Realisation.findByIdAndDelete(id);
      if (!deleted) return sendError(res, 404, 'Réalisation introuvable.');

      return sendSuccess(res, 200, 'Réalisation supprimée.');
    } catch (error) {
      next(error);
    }
  },

  // ============================================================================
  // GESTION ADMIN (DEMANDES DE DEVIS)
  // ============================================================================

  async getQuotes(req, res, next) {
    try {
      const { status, type, search, page = 1, limit = 15 } = req.query;
      const query = {};

      if (status) query.status = status;
      if (type) query.type = type;
      if (search) {
        query.$or = [
          { fullName: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ];
      }

      const total = await QuoteRequest.countDocuments(query);
      const quotes = await QuoteRequest.find(query)
        .populate('prestation', 'title')
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

      return sendPagination(res, quotes, total, page, limit, 'Demandes de devis');
    } catch (error) {
      next(error);
    }
  },

  async updateQuoteStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, internalNotes, estimatedAmount } = req.body;

      const quote = await QuoteRequest.findById(id);
      if (!quote) return sendError(res, 404, 'Demande de devis introuvable.');

      if (status) quote.status = status;
      if (internalNotes !== undefined) quote.internalNotes = internalNotes;
      if (estimatedAmount !== undefined) quote.estimatedAmount = estimatedAmount;
      quote.assignedTo = req.user._id;

      await quote.save();
      return sendSuccess(res, 200, 'Devis mis à jour', quote);
    } catch (error) {
      next(error);
    }
  },

  async exportQuotesCSV(req, res, next) {
    try {
      const quotes = await QuoteRequest.find({})
        .populate('prestation', 'title')
        .sort({ createdAt: -1 });

      const fields = [
        { label: 'Date', key: 'createdAt' },
        { label: 'Client', key: 'fullName' },
        { label: 'Entreprise', key: 'company' },
        { label: 'Téléphone', key: 'phone' },
        { label: 'Email', key: 'email' },
        { label: 'Type', key: 'type' },
        { label: 'Prestation', key: 'prestation.title' },
        { label: 'Budget', key: 'budget' },
        { label: 'Statut', key: 'status' },
        { label: 'Montant Estimé', key: 'estimatedAmount' },
      ];

      return exportToCSV(quotes, fields, res, `devis_bca_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      next(error);
    }
  },

  async deleteQuote(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await QuoteRequest.findByIdAndDelete(id);
      if (!deleted) return sendError(res, 404, 'Demande de devis introuvable.');

      return sendSuccess(res, 200, 'Demande de devis supprimée.');
    } catch (error) {
      next(error);
    }
  },
};
