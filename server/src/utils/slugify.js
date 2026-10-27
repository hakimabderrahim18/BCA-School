import slugifyPackage from 'slugify';

/**
 * Génère un slug URL propre, sans accents ni caractères spéciaux
 * @param {string} text - Le texte source (titre, nom)
 * @returns {string} Le slug formaté
 */
export const createSlug = (text) => {
  if (!text) return '';
  
  return slugifyPackage(text, {
    lower: true,
    strict: true,
    trim: true,
    locale: 'fr',
  });
};

/**
 * Génère un slug unique en ajoutant un suffixe aléatoire si nécessaire
 * @param {string} text - Le texte source
 * @returns {string} Le slug formaté avec suffixe unique
 */
export const createUniqueSlug = (text) => {
  const baseSlug = createSlug(text);
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${baseSlug}-${randomSuffix}`;
};
