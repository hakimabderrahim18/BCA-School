import { validationResult } from 'express-validator';
import { sendError } from '../utils/apiResponse.js';

/**
 * Middleware qui intercepte les résultats d'express-validator
 * et renvoie une réponse JSON d'erreur 400 formatée si des champs sont invalides
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    return sendError(res, 400, 'Données de formulaire invalides.', formattedErrors);
  }

  next();
};
