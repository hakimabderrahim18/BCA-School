import mongoose from 'mongoose';
import Event from '../models/Event.js';
import EventProposal from '../models/EventProposal.js';
import Category from '../models/Category.js';
import { sendSuccess, sendError, sendPagination } from '../utils/apiResponse.js';

export const eventController = {
  // ============================================================================
  // ÉVÉNEMENTS (AGENDA) - PUBLIC
  // ============================================================================

  /**
   * Récupère les événements publiés avec filtres (vue liste ou vue calendrier)
   * GET /api/events
   */
  async getEvents(req, res, next) {
    try {
      const { category, commune, month, year, search, page = 1, limit = 12 } = req.query;
      const query = { status: 'published' };

      if (category) query.category = category;
      if (commune) query['location.commune'] = { $regex: commune, $options: 'i' };

      // Filtrage par mois et année pour la vue calendrier
      if (year && month) {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);
        query.startDate = { $gte: start, $lte: end };
      }

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { 'location.venue': { $regex: search, $options: 'i' } },
        ];
      }

      const total = await Event.countDocuments(query);
      const events = await Event.find(query)
        .populate('category', 'name slug color icon')
        .sort({ startDate: 1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

      return sendPagination(res, events, total, page, limit, 'Agenda des événements');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Prochains événements à venir pour l'accueil
   * GET /api/events/upcoming
   */
  async getUpcomingEvents(req, res, next) {
    try {
      const now = new Date();
      const events = await Event.find({ status: 'published', startDate: { $gte: now } })
        .populate('category', 'name slug color')
        .sort({ startDate: 1 })
        .limit(4);

      return sendSuccess(res, 200, 'Prochains événements', events);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Détail d'un événement par son slug
   * GET /api/events/:slug
   */
  async getEventBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const event = await Event.findOne({ slug, status: 'published' }).populate(
        'category',
        'name slug color icon'
      );

      if (!event) {
        return sendError(res, 404, 'Événement introuvable.');
      }

      return sendSuccess(res, 200, 'Fiche événement', event);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Proposer un événement (formulaire public citoyen / association)
   * POST /api/events/propose
   */
  async proposeEvent(req, res, next) {
    try {
      const data = { ...req.body };
      if (req.file) data.flyerImage = req.file.path.replace(/\\/g, '/');

      // Résolution automatique de la catégorie
      if (data.category && !mongoose.Types.ObjectId.isValid(data.category)) {
        let cat = await Category.findOne({
          $or: [{ slug: data.category }, { name: new RegExp(data.category, 'i') }],
          type: 'event',
        });
        if (!cat) cat = await Category.findOne({ type: 'event' });
        if (cat) data.category = cat._id;
      } else if (!data.category) {
        let cat = await Category.findOne({ type: 'event' });
        if (cat) data.category = cat._id;
      }

      if (!data.description) {
        data.description = data.title || 'Événement proposé';
      }
      if (!data.organizerEmail) {
        data.organizerEmail = 'contact@bca-tiaret.dz';
      }
      if (!data.commune) {
        data.commune = 'Tiaret';
      }

      if (!data.title || !data.category || !data.startDate || !data.venue || !data.organizerName || !data.organizerPhone) {
        return sendError(res, 400, 'Les informations principales de l’événement et de contact sont requises.');
      }

      const proposal = await EventProposal.create(data);
      return sendSuccess(
        res,
        201,
        'Votre événement a été soumis à notre comité de validation. Il apparaîtra dans l’agenda après vérification.',
        proposal
      );
    } catch (error) {
      next(error);
    }
  },

  // ============================================================================
  // GESTION ADMIN (ÉVÉNEMENTS & PROPOSITIONS)
  // ============================================================================

  async createEvent(req, res, next) {
    try {
      const data = { ...req.body };
      if (req.file) data.coverImage = req.file.path.replace(/\\/g, '/');

      // Date de début
      if (data.date && !data.startDate) {
        data.startDate = data.date;
      }
      if (data.time && !data.startTime) {
        data.startTime = data.time;
      }

      // Catégorie
      if (data.category && !mongoose.Types.ObjectId.isValid(data.category)) {
        let cat = await Category.findOne({
          $or: [{ slug: data.category }, { name: new RegExp(data.category, 'i') }],
          type: 'event',
        });
        if (!cat) cat = await Category.findOne({ type: 'event' });
        if (cat) data.category = cat._id;
      }

      // Localisation
      if (typeof data.location === 'string') {
        try {
          data.location = JSON.parse(data.location);
        } catch {
          data.location = {
            venue: data.location || 'Tiaret Centre',
            commune: data.commune || 'Tiaret',
            wilaya: 'Tiaret (14)',
          };
        }
      }

      // Organisateur
      if (typeof data.organizer === 'string') {
        try {
          data.organizer = JSON.parse(data.organizer);
        } catch {
          data.organizer = { name: data.organizer };
        }
      } else if (data.organizerName) {
        data.organizer = {
          name: data.organizerName,
          phone: data.contactPhone || '',
        };
      }

      const event = await Event.create(data);
      return sendSuccess(res, 201, 'Événement programmé avec succès', event);
    } catch (error) {
      next(error);
    }
  },

  async updateEvent(req, res, next) {
    try {
      const { id } = req.params;
      const data = { ...req.body };
      if (req.file) data.coverImage = req.file.path.replace(/\\/g, '/');

      if (data.date && !data.startDate) {
        data.startDate = data.date;
      }
      if (data.time && !data.startTime) {
        data.startTime = data.time;
      }

      if (data.category && !mongoose.Types.ObjectId.isValid(data.category)) {
        let cat = await Category.findOne({
          $or: [{ slug: data.category }, { name: new RegExp(data.category, 'i') }],
          type: 'event',
        });
        if (!cat) cat = await Category.findOne({ type: 'event' });
        if (cat) data.category = cat._id;
      }

      if (typeof data.location === 'string') {
        try {
          data.location = JSON.parse(data.location);
        } catch {
          data.location = {
            venue: data.location || 'Tiaret Centre',
            commune: data.commune || 'Tiaret',
            wilaya: 'Tiaret (14)',
          };
        }
      }

      if (typeof data.organizer === 'string') {
        try {
          data.organizer = JSON.parse(data.organizer);
        } catch {
          data.organizer = { name: data.organizer };
        }
      } else if (data.organizerName) {
        data.organizer = {
          name: data.organizerName,
          phone: data.contactPhone || '',
        };
      }

      const event = await Event.findByIdAndUpdate(id, data, { new: true, runValidators: true });
      if (!event) return sendError(res, 404, 'Événement introuvable.');

      return sendSuccess(res, 200, 'Événement mis à jour', event);
    } catch (error) {
      next(error);
    }
  },

  async deleteEvent(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await Event.findByIdAndDelete(id);
      if (!deleted) return sendError(res, 404, 'Événement introuvable.');

      return sendSuccess(res, 200, 'Événement supprimé avec succès.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Liste des événements proposés par les utilisateurs
   * GET /api/events/admin/proposals
   */
  async getProposals(req, res, next) {
    try {
      const { status = 'pending', page = 1, limit = 15 } = req.query;
      const query = {};
      if (status) query.status = status;

      const total = await EventProposal.countDocuments(query);
      const proposals = await EventProposal.find(query)
        .populate('category', 'name slug')
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

      return sendPagination(res, proposals, total, page, limit, 'Propositions d’événements');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Modération d'une proposition (Approuver -> création auto de l'événement / Rejeter)
   * PATCH /api/events/admin/proposals/:id/moderate
   */
  async moderateProposal(req, res, next) {
    try {
      const { id } = req.params;
      const { status, reviewNote } = req.body;

      const proposal = await EventProposal.findById(id);
      if (!proposal) return sendError(res, 404, 'Proposition introuvable.');

      if (status === 'approved' && !proposal.approvedEventId) {
        // Création automatique de l'événement officiel
        const newEvent = await Event.create({
          title: proposal.title,
          category: proposal.category,
          description: proposal.description,
          startDate: proposal.startDate,
          endDate: proposal.endDate,
          startTime: proposal.startTime,
          endTime: proposal.endTime,
          location: {
            venue: proposal.venue,
            commune: proposal.commune || 'Tiaret',
            wilaya: 'Tiaret (14)',
          },
          organizer: {
            name: proposal.organizerName,
            phone: proposal.organizerPhone,
            email: proposal.organizerEmail,
            website: proposal.website,
          },
          coverImage: proposal.flyerImage || '/uploads/events/default-event.webp',
          status: 'published',
        });

        proposal.approvedEventId = newEvent._id;
      }

      proposal.status = status;
      proposal.reviewNote = reviewNote || '';
      proposal.reviewedBy = req.user._id;
      await proposal.save();

      return sendSuccess(res, 200, `Proposition ${status === 'approved' ? 'approuvée et publiée' : 'rejetée'}.`, proposal);
    } catch (error) {
      next(error);
    }
  },
};
