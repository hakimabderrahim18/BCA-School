import PreInscription from '../models/PreInscription.js';
import ContactMessage from '../models/ContactMessage.js';
import QuoteRequest from '../models/QuoteRequest.js';
import EventProposal from '../models/EventProposal.js';
import PetiteAnnonce from '../models/PetiteAnnonce.js';
import Formation from '../models/Formation.js';
import Article from '../models/Article.js';
import AdSlot from '../models/AdSlot.js';
import Event from '../models/Event.js';
import Annonceur from '../models/Annonceur.js';
import User from '../models/User.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const dashboardController = {
  /**
   * Récupère l'ensemble des métriques de pilotage pour le tableau de bord d'administration
   * GET /api/dashboard/stats
   */
  async getStats(req, res, next) {
    try {
      const [
        newInscriptions,
        unreadMessages,
        pendingQuotes,
        pendingEvents,
        pendingAnnonces,
        totalFormations,
        totalArticles,
        totalEvents,
        totalAnnonceurs,
        totalUsers,
        activeAds,
        recentInscriptions,
        recentMessages,
        recentQuotes,
      ] = await Promise.all([
        PreInscription.countDocuments({ status: 'nouveau' }),
        ContactMessage.countDocuments({ status: 'nouveau' }),
        QuoteRequest.countDocuments({ status: 'nouveau' }),
        EventProposal.countDocuments({ status: 'pending' }),
        PetiteAnnonce.countDocuments({ status: 'pending' }),
        Formation.countDocuments({ status: 'published' }),
        Article.countDocuments({ status: 'published' }),
        Event.countDocuments({ status: 'published' }),
        Annonceur.countDocuments({ isActive: true }),
        User.countDocuments(),
        AdSlot.countDocuments({ isActive: true }),
        PreInscription.find().sort({ createdAt: -1 }).limit(5).populate('formation', 'title'),
        ContactMessage.find().sort({ createdAt: -1 }).limit(5),
        QuoteRequest.find().sort({ createdAt: -1 }).limit(5),
      ]);

      const counts = {
        formations: totalFormations,
        articles: totalArticles,
        events: totalEvents,
        annonceurs: totalAnnonceurs,
        adSlots: activeAds,
        users: totalUsers,
      };

      const pending = {
        inscriptions: newInscriptions,
        messages: unreadMessages,
        quotes: pendingQuotes,
        proposals: pendingEvents,
        petitesAnnonces: pendingAnnonces,
      };

      const recent = {
        inscriptions: recentInscriptions,
        messages: recentMessages,
        quotes: recentQuotes,
      };

      return sendSuccess(res, 200, 'Statistiques du tableau de bord', {
        counts,
        pending,
        recent,
        counters: {
          newInscriptions,
          unreadMessages,
          pendingQuotes,
          pendingEvents,
          pendingAnnonces,
          totalFormations,
          totalArticles,
          activeAds,
          totalActionRequired:
            newInscriptions + unreadMessages + pendingQuotes + pendingEvents + pendingAnnonces,
        },
        recentActivity: recent,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default dashboardController;
