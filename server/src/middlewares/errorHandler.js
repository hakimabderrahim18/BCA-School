import { sendError } from '../utils/apiResponse.js';

/**
 * Middleware centralisé de gestion de toutes les erreurs de l'application
 */
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log de l'erreur dans la console (avec stack trace en développement)
  if (process.env.NODE_ENV !== 'production') {
    console.error('--- [ERROR LOG] ---');
    console.error(err);
    console.error('-------------------');
  } else {
    console.error(`[Error] ${err.name}: ${err.message}`);
  }

  // 1. Erreur Mongoose : ID de ressource mal formé (CastError)
  if (err.name === 'CastError') {
    const message = `Ressource non trouvée avec l'identifiant : ${err.value}`;
    return sendError(res, 404, message);
  }

  // 2. Erreur Mongoose : Clé dupliquée (Code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'champ';
    const value = err.keyValue ? err.keyValue[field] : '';
    const message = `La valeur '${value}' pour le champ '${field}' est déjà utilisée.`;
    return sendError(res, 409, message);
  }

  // 3. Erreur Mongoose : Échec de validation de schéma (ValidationError)
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message,
    }));
    const userMessage = details.map((d) => d.message).filter(Boolean).join(' | ');
    return sendError(res, 400, userMessage || 'Erreur de validation des données fournies.', details);
  }

  // 4. Erreur JWT : Signature invalide ou token expiré
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Jeton d’authentification invalide.');
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Jeton d’authentification expiré.');
  }

  // 5. Erreurs Multer (Upload de fichiers)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, 400, 'Le fichier téléversé dépasse la taille maximale autorisée (10 Mo).');
    }
    return sendError(res, 400, `Erreur lors du téléversement du fichier : ${err.message}`);
  }

  // 6. Réponse générique pour toute autre erreur non interceptée
  const statusCode = error.statusCode || err.status || 500;
  const message = error.message || 'Une erreur interne inattendue est survenue sur le serveur.';

  return sendError(
    res,
    statusCode,
    message,
    process.env.NODE_ENV === 'development' ? { stack: err.stack } : null
  );
};

/**
 * Middleware pour capturer les routes inexistantes (404 Not Found)
 */
export const notFoundHandler = (req, res, next) => {
  return sendError(res, 404, `Route introuvable sur le serveur B.C.A. : [${req.method}] ${req.originalUrl}`);
};
