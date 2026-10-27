import rateLimit from 'express-rate-limit';
import { sendError } from '../utils/apiResponse.js';

/**
 * Limiteur général pour l'ensemble des routes de l'API
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limite à 300 requêtes par fenêtre de 15 minutes par IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(
      res,
      429,
      'Trop de requêtes effectuées depuis cette adresse IP. Veuillez patienter 15 minutes.'
    );
  },
});

/**
 * Limiteur strict pour les tentatives d'authentification (protection brute-force)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 10 : 200, // Permissif en développement
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(
      res,
      429,
      'Trop de tentatives de connexion échouées. Par mesure de sécurité, veuillez réessayer dans 15 minutes.'
    );
  },
});

/**
 * Limiteur pour les soumissions de formulaires publics (Contact, Devis, Préinscription)
 */
export const formSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Maximum 15 soumissions par 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(
      res,
      429,
      'Vous avez envoyé un nombre élevé de demandes. Veuillez patienter quelques minutes avant de renouveler votre soumission.'
    );
  },
});
