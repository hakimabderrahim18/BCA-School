import { sendError } from '../utils/apiResponse.js';

/**
 * Middleware de contrôle d'accès basé sur les rôles (RBAC)
 * @param  {...string} allowedRoles - Liste des rôles autorisés ('admin', 'editor', 'writer')
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentification requise pour cette ressource.');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Accès refusé : le rôle [${req.user.role}] n'a pas les privilèges requis pour exécuter cette action.`
      );
    }

    next();
  };
};
