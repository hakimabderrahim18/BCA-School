/**
 * Définition des rôles utilisateurs et des niveaux de privilèges
 * - admin   : accès absolu (gestion utilisateurs, paramètres, suppressions, devis)
 * - editor  : gestion et publication des contenus (formations, articles, annonces)
 * - writer  : création et soumission de contenus soumis à validation
 */
export const ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  WRITER: 'writer',
};

export const ALL_ROLES = [ROLES.ADMIN, ROLES.EDITOR, ROLES.WRITER];

/**
 * Hiérarchie des rôles pour vérification d'autorisation
 */
export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: [ROLES.ADMIN, ROLES.EDITOR, ROLES.WRITER],
  [ROLES.EDITOR]: [ROLES.EDITOR, ROLES.WRITER],
  [ROLES.WRITER]: [ROLES.WRITER],
};

/**
 * Vérifie si un rôle possède un niveau de privilège suffisant
 * @param {string} userRole - Rôle actuel de l'utilisateur
 * @param {string} requiredRole - Rôle minimal requis
 * @returns {boolean}
 */
export const hasMinimumRole = (userRole, requiredRole) => {
  const allowed = ROLE_HIERARCHY[userRole] || [];
  return allowed.includes(requiredRole);
};
