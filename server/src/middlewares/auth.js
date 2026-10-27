import jwt from 'jsonwebtoken';
import { sendError } from '../utils/apiResponse.js';
import User from '../models/User.js';

/**
 * Middleware d'authentification par JWT
 * Vérifie le Bearer Token présent dans l'en-tête Authorization ou dans les cookies
 */
export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // 1. Récupération depuis l'en-tête Authorization
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    // 2. Ou récupération alternative depuis les cookies signés/non-signés
    else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return sendError(res, 401, 'Accès non autorisé : aucun jeton de session fourni.');
    }

    // 3. Vérification du JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || 'bca_default_access_secret_key_3847298374'
    );

    // 4. Recherche de l'utilisateur en base de données
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return sendError(res, 401, 'Utilisateur introuvable ou compte supprimé.');
    }

    if (!user.isActive) {
      return sendError(res, 403, 'Ce compte a été suspendu par un administrateur.');
    }

    // 5. Injection de l'utilisateur dans l'objet de requête Express
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Votre session a expiré. Veuillez renouveler votre jeton.');
    }
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 401, 'Jeton d’authentification invalide.');
    }
    return sendError(res, 500, 'Erreur lors de la vérification de session.', error.message);
  }
};
