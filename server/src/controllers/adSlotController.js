import AdSlot from '../models/AdSlot.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const adSlotController = {
  // ============================================================================
  // BANNIÈRES PUBLICITAIRES (PUBLIC)
  // ============================================================================

  /**
   * Récupère les bannières actives en fonction de l'emplacement (slotKey)
   * GET /api/ads/active?slotKey=home_banner_top
   */
  async getActiveAds(req, res, next) {
    try {
      const { slotKey } = req.query;
      const now = new Date();

      const query = {
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
      };

      if (slotKey) {
        query.slotKey = slotKey;
      }

      const ads = await AdSlot.find(query).sort({ priority: -1, createdAt: -1 });

      // Incrémentation asynchrone des impressions (vues de la bannière)
      if (ads.length > 0) {
        const adIds = ads.map((a) => a._id);
        AdSlot.updateMany({ _id: { $in: adIds } }, { $inc: { impressionsCount: 1 } }).exec();
      }

      return sendSuccess(res, 200, 'Bannières publicitaires actives', ads);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Enregistre un clic sur une bannière publicitaire
   * POST /api/ads/:id/click
   */
  async recordClick(req, res, next) {
    try {
      const { id } = req.params;
      const ad = await AdSlot.findByIdAndUpdate(id, { $inc: { clicksCount: 1 } }, { new: true });

      if (!ad) {
        return sendError(res, 404, 'Bannière introuvable.');
      }

      return sendSuccess(res, 200, 'Clic enregistré', { targetUrl: ad.targetUrl });
    } catch (error) {
      next(error);
    }
  },

  // ============================================================================
  // GESTION ADMIN (EMPLACEMENTS & BANNIÈRES)
  // ============================================================================

  async getAllAds(req, res, next) {
    try {
      const ads = await AdSlot.find({})
        .populate('advertiser', 'name logo')
        .sort({ slotKey: 1, startDate: -1 });

      return sendSuccess(res, 200, 'Liste des bannières publicitaires', ads);
    } catch (error) {
      next(error);
    }
  },

  async createAd(req, res, next) {
    try {
      const data = { ...req.body };
      if (req.file) {
        data.imageUrl = req.file.path.replace(/\\/g, '/');
      } else if (!data.imageUrl && data.image) {
        data.imageUrl = data.image;
      }

      if (!data.imageUrl) {
        data.imageUrl = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80';
      }

      if (data.targetUrl && !/^https?:\/\//i.test(data.targetUrl)) {
        data.targetUrl = 'https://' + data.targetUrl;
      }

      if (!data.title || !data.slotKey || !data.targetUrl || !data.startDate || !data.endDate) {
        return sendError(res, 400, 'Titre, emplacement, lien et dates sont obligatoires.');
      }

      const ad = await AdSlot.create(data);
      return sendSuccess(res, 201, 'Bannière créée avec succès', ad);
    } catch (error) {
      next(error);
    }
  },

  async updateAd(req, res, next) {
    try {
      const { id } = req.params;
      const data = { ...req.body };
      if (req.file) {
        data.imageUrl = req.file.path.replace(/\\/g, '/');
      } else if (!data.imageUrl && data.image) {
        data.imageUrl = data.image;
      } else if (!data.imageUrl) {
        delete data.imageUrl;
      }

      if (data.targetUrl && !/^https?:\/\//i.test(data.targetUrl)) {
        data.targetUrl = 'https://' + data.targetUrl;
      }

      const ad = await AdSlot.findByIdAndUpdate(id, data, { new: true, runValidators: true });
      if (!ad) return sendError(res, 404, 'Bannière introuvable.');

      return sendSuccess(res, 200, 'Bannière mise à jour', ad);
    } catch (error) {
      next(error);
    }
  },

  async deleteAd(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await AdSlot.findByIdAndDelete(id);
      if (!deleted) return sendError(res, 404, 'Bannière introuvable.');

      return sendSuccess(res, 200, 'Bannière supprimée avec succès.');
    } catch (error) {
      next(error);
    }
  },
};
