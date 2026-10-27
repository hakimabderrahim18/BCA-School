/**
 * Utilitaires pour standardiser toutes les réponses API (JSON)
 * Assure un format cohérent : { success, statusCode, message, data, meta }
 */

/**
 * Envoie une réponse de succès (200, 201, etc.)
 */
export const sendSuccess = (res, statusCode = 200, message = 'Opération réussie', data = null, meta = null) => {
  const response = {
    success: true,
    statusCode,
    message,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Envoie une réponse paginée standardisée
 */
export const sendPagination = (res, data, total, page, limit, message = 'Données récupérées avec succès') => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return res.status(200).json({
    success: true,
    statusCode: 200,
    message,
    data,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages,
      hasNextPage,
      hasPrevPage,
    },
  });
};

/**
 * Envoie une réponse d'erreur standardisée
 */
export const sendError = (res, statusCode = 500, message = 'Une erreur interne est survenue', errors = null) => {
  const response = {
    success: false,
    statusCode,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};
