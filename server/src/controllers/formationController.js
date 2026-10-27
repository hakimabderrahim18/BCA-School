import mongoose from 'mongoose';
import Formation from '../models/Formation.js';
import Session from '../models/Session.js';
import PreInscription from '../models/PreInscription.js';
import Category from '../models/Category.js';
import { sendSuccess, sendError, sendPagination } from '../utils/apiResponse.js';
import { emailService } from '../services/emailService.js';
import { exportToCSV } from '../services/csvExportService.js';

export const formationController = {
  // ============================================================================
  // FORMATIONS (PUBLIC)
  // ============================================================================

  /**
   * Liste des formations publiques avec recherche et filtrage par catégorie
   * GET /api/formations
   */
  async getFormations(req, res, next) {
    try {
      const { category, search, page = 1, limit = 12, sort = 'order' } = req.query;
      const query = { status: 'published' };

      if (category) {
        query.category = category;
      }

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { summary: { $regex: search, $options: 'i' } },
        ];
      }

      const sortOptions = sort === 'recent' ? { createdAt: -1 } : { order: 1, createdAt: -1 };

      const total = await Formation.countDocuments(query);
      const formations = await Formation.find(query)
        .populate('category', 'name slug color icon')
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(Number(limit));

      return sendPagination(res, formations, total, page, limit, 'Catalogue des formations');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Formations mises en avant pour la page d'accueil
   * GET /api/formations/featured
   */
  async getFeaturedFormations(req, res, next) {
    try {
      const formations = await Formation.find({ status: 'published', isFeatured: true })
        .populate('category', 'name slug color icon')
        .sort({ order: 1 })
        .limit(6);

      return sendSuccess(res, 200, 'Formations en vedette', formations);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Détails complets d'une formation par son slug (avec sessions actives)
   * GET /api/formations/:slug
   */
  async getFormationBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const isId = mongoose.Types.ObjectId.isValid(slug);
      const query = isId ? { $or: [{ _id: slug }, { slug }] } : { slug };

      const formation = await Formation.findOne(query)
        .populate('category', 'name slug color icon')
        .populate({
          path: 'sessions',
          options: { sort: { startDate: 1 } },
        });

      if (!formation) {
        return sendError(res, 404, 'Formation introuvable.');
      }

      return sendSuccess(res, 200, 'Détails de la formation', formation);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Soumission d'une préinscription en ligne
   * POST /api/formations/:id/pre-inscrire
   */
  async preInscrire(req, res, next) {
    try {
      const { id } = req.params;
      const { fullName, email, phone, wilaya, commune, currentStatus, motivation, sessionId } = req.body;

      if (!fullName || !email || !phone) {
        return sendError(res, 400, 'Le nom, email et téléphone sont obligatoires.');
      }

      const formation = await Formation.findById(id);
      if (!formation) {
        return sendError(res, 404, 'Formation introuvable.');
      }

      let session = null;
      if (sessionId) {
        session = await Session.findById(sessionId);
      }

      const preInscription = await PreInscription.create({
        formation: formation._id,
        session: session ? session._id : null,
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        wilaya: wilaya || 'Tiaret (14)',
        commune: commune || 'Tiaret',
        currentStatus: currentStatus || 'professionnel',
        motivation: motivation || '',
      });

      // Si une session est spécifiée, incrémenter le nombre d'inscrits
      if (session) {
        session.enrolledCount += 1;
        await session.save();
      }

      // Envoi des emails en tâche asynchrone non-bloquante
      emailService.sendNewPreInscriptionNotification({
        formationTitle: formation.title,
        applicantName: fullName,
        email,
        phone,
        wilaya: wilaya || 'Tiaret',
      });

      emailService.sendPreInscriptionConfirmationToApplicant({
        applicantName: fullName,
        email,
        formationTitle: formation.title,
      });

      return sendSuccess(
        res,
        201,
        'Votre préinscription a été enregistrée avec succès. Notre équipe vous contactera sous peu.',
        preInscription
      );
    } catch (error) {
      next(error);
    }
  },

  // ============================================================================
  // GESTION ADMIN (FORMATIONS)
  // ============================================================================

  /**
   * Création d'une nouvelle formation (Admin / Éditeur)
   * POST /api/formations
   */
  async createFormation(req, res, next) {
    try {
      const data = { ...req.body };

      // Normalisation de l'image uploadée
      if (req.file) {
        data.image = req.file.path.replace(/\\/g, '/');
      }

      // Résolution de la catégorie
      if (data.category && !mongoose.Types.ObjectId.isValid(data.category)) {
        const cat = await Category.findOne({
          $or: [
            { slug: data.category },
            { name: { $regex: new RegExp(`^${data.category}$`, 'i') } },
          ],
        });
        if (cat) {
          data.category = cat._id;
        } else {
          const defaultCat = await Category.findOne({ type: 'formation' });
          if (defaultCat) data.category = defaultCat._id;
        }
      }

      // Normalisation des champs requis (summary & description)
      data.summary = data.summary || data.shortDescription || data.description || data.title;
      data.description = data.description || data.summary || data.shortDescription || data.title;

      // Statut de publication
      if (data.isActive !== undefined && !data.status) {
        data.status = data.isActive === 'false' || data.isActive === false ? 'draft' : 'published';
      }

      // Durée
      if (data.duration) {
        const matchHours = String(data.duration).match(/\d+/);
        if (matchHours) {
          data.durationHours = Number(matchHours[0]);
        }
      }

      // Prix & affichage
      if (data.duration) {
        const matchHours = String(data.duration).match(/\d+/);
        if (matchHours) {
          data.durationHours = Number(matchHours[0]);
        }
      }

      if (data.price !== undefined && data.price !== '') {
        const numPrice = Number(data.price);
        if (!isNaN(numPrice)) {
          data.price = numPrice;
          if (!data.priceDisplay || data.priceDisplay === 'Nous consulter') {
            data.priceDisplay = `${numPrice.toLocaleString('fr-DZ')} DZD`;
          }
        }
      }

      // Désérialisation sécurisée des champs JSON imbriqués si envoyés en FormData
      if (typeof data.program === 'string') {
        try {
          data.program = JSON.parse(data.program);
        } catch {
          data.program = data.program.split('\n').filter(Boolean).map((t, idx) => ({
            moduleNumber: idx + 1,
            title: t.trim(),
            description: '',
          }));
        }
      }

      if (typeof data.objectives === 'string') {
        try {
          data.objectives = JSON.parse(data.objectives);
        } catch {
          data.objectives = data.objectives.split('\n').map((o) => o.trim()).filter(Boolean);
        }
      }

      if (typeof data.targetAudience === 'string') {
        try {
          data.targetAudience = JSON.parse(data.targetAudience);
        } catch {
          data.targetAudience = data.targetAudience.split(',').map((t) => t.trim()).filter(Boolean);
        }
      }

      if (typeof data.prerequisites === 'string') {
        try {
          data.prerequisites = JSON.parse(data.prerequisites);
        } catch {
          data.prerequisites = data.prerequisites.split(',').map((p) => p.trim()).filter(Boolean);
        }
      }

      if (typeof data.trainer === 'string') {
        try {
          data.trainer = JSON.parse(data.trainer);
        } catch {
          data.trainer = { name: data.trainer };
        }
      } else if (data.instructor) {
        try {
          data.trainer = JSON.parse(data.instructor);
        } catch {
          data.trainer = { name: data.instructor };
        }
      } else if (data.instructorName) {
        data.trainer = { name: data.instructorName };
      }

      const formation = await Formation.create(data);
      return sendSuccess(res, 201, 'Formation créée avec succès', formation);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Modification d'une formation existante
   * PUT /api/formations/:id
   */
  async updateFormation(req, res, next) {
    try {
      const { id } = req.params;
      const data = { ...req.body };

      if (req.file) {
        data.image = req.file.path.replace(/\\/g, '/');
      }

      if (data.category && !mongoose.Types.ObjectId.isValid(data.category)) {
        const cat = await Category.findOne({
          $or: [
            { slug: data.category },
            { name: { $regex: new RegExp(`^${data.category}$`, 'i') } },
          ],
        });
        if (cat) {
          data.category = cat._id;
        } else {
          delete data.category;
        }
      }

      // Normalisation des champs
      if (data.shortDescription && !data.summary) {
        data.summary = data.shortDescription;
      }
      if (!data.description && data.summary) {
        data.description = data.summary;
      }

      if (data.isActive !== undefined && !data.status) {
        data.status = data.isActive === 'false' || data.isActive === false ? 'draft' : 'published';
      }

      if (data.duration) {
        const matchHours = String(data.duration).match(/\d+/);
        if (matchHours) {
          data.durationHours = Number(matchHours[0]);
        }
      }

      if (data.price !== undefined && data.price !== '') {
        const numPrice = Number(data.price);
        if (!isNaN(numPrice)) {
          data.price = numPrice;
          data.priceDisplay = `${numPrice.toLocaleString('fr-DZ')} DZD`;
        }
      }

      if (typeof data.program === 'string') {
        try {
          data.program = JSON.parse(data.program);
        } catch {
          data.program = data.program.split('\n').filter(Boolean).map((t, idx) => ({
            moduleNumber: idx + 1,
            title: t.trim(),
            description: '',
          }));
        }
      }

      if (typeof data.objectives === 'string') {
        try {
          data.objectives = JSON.parse(data.objectives);
        } catch {
          data.objectives = data.objectives.split('\n').map((o) => o.trim()).filter(Boolean);
        }
      }

      if (typeof data.targetAudience === 'string') {
        try {
          data.targetAudience = JSON.parse(data.targetAudience);
        } catch {
          data.targetAudience = data.targetAudience.split(',').map((t) => t.trim()).filter(Boolean);
        }
      }

      if (typeof data.prerequisites === 'string') {
        try {
          data.prerequisites = JSON.parse(data.prerequisites);
        } catch {
          data.prerequisites = data.prerequisites.split(',').map((p) => p.trim()).filter(Boolean);
        }
      }

      if (typeof data.trainer === 'string') {
        try {
          data.trainer = JSON.parse(data.trainer);
        } catch {
          data.trainer = { name: data.trainer };
        }
      } else if (data.instructor) {
        try {
          data.trainer = JSON.parse(data.instructor);
        } catch {
          data.trainer = { name: data.instructor };
        }
      } else if (data.instructorName) {
        data.trainer = { name: data.instructorName };
      }

      const formation = await Formation.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      });

      if (!formation) {
        return sendError(res, 404, 'Formation introuvable.');
      }

      return sendSuccess(res, 200, 'Formation mise à jour avec succès', formation);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Suppression d'une formation (Admin only)
   * DELETE /api/formations/:id
   */
  async deleteFormation(req, res, next) {
    try {
      const { id } = req.params;
      const formation = await Formation.findByIdAndDelete(id);

      if (!formation) {
        return sendError(res, 404, 'Formation introuvable.');
      }

      // Supprimer également les sessions rattachées
      await Session.deleteMany({ formation: id });

      return sendSuccess(res, 200, 'Formation et sessions associées supprimées avec succès.');
    } catch (error) {
      next(error);
    }
  },

  // ============================================================================
  // GESTION DES SESSIONS
  // ============================================================================

  /**
   * Ajoute une session à une formation
   * POST /api/formations/:id/sessions
   */
  async createSession(req, res, next) {
    try {
      const { id } = req.params;
      const formation = await Formation.findById(id);

      if (!formation) {
        return sendError(res, 404, 'Formation introuvable.');
      }

      const data = { ...req.body, formation: id };

      // Normalisation du statut
      const statusMap = {
        ouvert: 'planned',
        planifie: 'planned',
        planned: 'planned',
        en_cours: 'ongoing',
        ongoing: 'ongoing',
        termine: 'completed',
        completed: 'completed',
        annule: 'cancelled',
        cancelled: 'cancelled',
      };
      if (data.status) {
        data.status = statusMap[data.status] || 'planned';
      }

      // Normalisation des places
      data.maxSeats = data.maxSeats || data.maxParticipants || 15;

      // Normalisation date de fin
      if (!data.endDate && data.startDate) {
        data.endDate = new Date(new Date(data.startDate).getTime() + 30 * 24 * 60 * 60 * 1000);
      }

      const session = await Session.create(data);
      return sendSuccess(res, 201, 'Session de formation programmée', session);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Met à jour une session
   * PUT /api/sessions/:sessionId
   */
  async updateSession(req, res, next) {
    try {
      const { sessionId } = req.params;
      const data = { ...req.body };

      const statusMap = {
        ouvert: 'planned',
        planifie: 'planned',
        planned: 'planned',
        en_cours: 'ongoing',
        ongoing: 'ongoing',
        termine: 'completed',
        completed: 'completed',
        annule: 'cancelled',
        cancelled: 'cancelled',
      };
      if (data.status) {
        data.status = statusMap[data.status] || data.status;
      }

      if (data.maxParticipants) {
        data.maxSeats = data.maxParticipants;
      }

      const session = await Session.findByIdAndUpdate(sessionId, data, {
        new: true,
        runValidators: true,
      });

      if (!session) {
        return sendError(res, 404, 'Session introuvable.');
      }

      return sendSuccess(res, 200, 'Session mise à jour avec succès', session);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Supprime une session
   * DELETE /api/sessions/:sessionId
   */
  async deleteSession(req, res, next) {
    try {
      const { sessionId } = req.params;
      const session = await Session.findByIdAndDelete(sessionId);

      if (!session) {
        return sendError(res, 404, 'Session introuvable.');
      }

      return sendSuccess(res, 200, 'Session supprimée.');
    } catch (error) {
      next(error);
    }
  },

  // ============================================================================
  // GESTION DES PRÉINSCRIPTIONS (ADMIN)
  // ============================================================================

  /**
   * Liste des préinscriptions avec filtres et pagination
   * GET /api/inscriptions
   */
  async getInscriptions(req, res, next) {
    try {
      const { formation, status, search, page = 1, limit = 15 } = req.query;
      const query = {};

      if (formation) query.formation = formation;
      if (status) query.status = status;
      if (search) {
        query.$or = [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ];
      }

      const total = await PreInscription.countDocuments(query);
      const inscriptions = await PreInscription.find(query)
        .populate('formation', 'title category priceDisplay')
        .populate('session', 'startDate schedule location')
        .populate('processedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

      return sendPagination(res, inscriptions, total, page, limit, 'Liste des préinscriptions');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Met à jour le statut d'une préinscription (nouveau, en_cours, confirme, annule)
   * PATCH /api/inscriptions/:id/status
   */
  async updateInscriptionStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, internalNotes } = req.body;

      const inscription = await PreInscription.findById(id);
      if (!inscription) {
        return sendError(res, 404, 'Préinscription introuvable.');
      }

      if (status) inscription.status = status;
      if (internalNotes !== undefined) inscription.internalNotes = internalNotes;
      inscription.processedBy = req.user._id;
      inscription.processedAt = new Date();

      await inscription.save();

      return sendSuccess(res, 200, 'Statut de préinscription mis à jour', inscription);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Exporte la liste des préinscriptions au format CSV
   * GET /api/inscriptions/export/csv
   */
  async exportInscriptionsCSV(req, res, next) {
    try {
      const inscriptions = await PreInscription.find({})
        .populate('formation', 'title')
        .populate('session', 'startDate schedule')
        .sort({ createdAt: -1 });

      const fields = [
        { label: 'Date inscription', key: 'createdAt' },
        { label: 'Nom & Prénom', key: 'fullName' },
        { label: 'Téléphone', key: 'phone' },
        { label: 'Email', key: 'email' },
        { label: 'Wilaya', key: 'wilaya' },
        { label: 'Statut Pro', key: 'currentStatus' },
        { label: 'Formation', key: 'formation.title' },
        { label: 'Statut Dossier', key: 'status' },
        { label: 'Notes internes', key: 'internalNotes' },
      ];

      return exportToCSV(inscriptions, fields, res, `preinscriptions_bca_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Supprime une préinscription
   * DELETE /api/inscriptions/:id
   */
  async deleteInscription(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await PreInscription.findByIdAndDelete(id);

      if (!deleted) {
        return sendError(res, 404, 'Préinscription introuvable.');
      }

      return sendSuccess(res, 200, 'Préinscription supprimée.');
    } catch (error) {
      next(error);
    }
  },
};
