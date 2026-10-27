/**
 * Générateurs de données structurées Schema.org JSON-LD conformes aux exigences Google Rich Snippets
 */

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://bca-tiaret.dz';

/**
 * Schéma Organisation (Établissement B.C.A.)
 */
export const getOrganizationSchema = (settings = {}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'B.C.A. - Centre de Formation & Communication',
    alternateName: 'Bureau de Communication & d’Apprentissage',
    url: SITE_URL,
    logo: `${SITE_URL}/uploads/settings/logo-bca.webp`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: settings.contact?.phone1 || '+213-550-00-00-00',
      contactType: 'customer service',
      areaServed: 'DZ',
      availableLanguage: ['French', 'Arabic'],
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.contact?.address || 'Cité Administrative, Boulevard Principal',
      addressLocality: 'Tiaret',
      addressRegion: 'Tiaret',
      postalCode: '14000',
      addressCountry: 'DZ',
    },
    sameAs: [
      settings.socialLinks?.facebook || 'https://facebook.com/bca.tiaret',
      settings.socialLinks?.instagram || 'https://instagram.com/bca.tiaret',
      settings.socialLinks?.linkedin || 'https://linkedin.com/company/bca-tiaret',
    ].filter(Boolean),
  };
};

/**
 * Schéma Formation (Course)
 */
export const getCourseSchema = (formation) => {
  if (!formation) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: formation.title,
    description: formation.shortDescription || formation.title,
    provider: {
      '@type': 'EducationalOrganization',
      name: 'B.C.A. Tiaret',
      sameAs: SITE_URL,
    },
    educationalCredentialAwarded: formation.isCertified
      ? 'Certificat de qualification / Attestation agréée'
      : 'Attestation de suivi de formation',
    timeRequired: formation.duration || 'P1M',
    offers: {
      '@type': 'Offer',
      category: 'Paid',
      price: formation.price || 0,
      priceCurrency: 'DZD',
      availability: 'https://schema.org/InStock',
    },
  };
};

/**
 * Schéma Événement (Event)
 */
export const getEventSchema = (event) => {
  if (!event) return null;

  const startDate = event.date ? new Date(event.date).toISOString() : new Date().toISOString();

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description || event.title,
    image: event.coverImage ? [event.coverImage] : [`${SITE_URL}/uploads/settings/bca-og-banner.webp`],
    startDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.location || 'Centre B.C.A. Tiaret',
      address: {
        '@type': 'PostalAddress',
        addressLocality: event.commune || 'Tiaret',
        addressRegion: 'Tiaret',
        addressCountry: 'DZ',
      },
    },
    organizer: {
      '@type': 'Organization',
      name: event.organizer?.name || 'B.C.A. Tiaret',
      url: SITE_URL,
    },
    isAccessibleForFree: event.isFree ?? true,
    offers: {
      '@type': 'Offer',
      price: event.price || 0,
      priceCurrency: 'DZD',
      availability: 'https://schema.org/InStock',
    },
  };
};

/**
 * Schéma Article d'actualité (NewsArticle)
 */
export const getArticleSchema = (article) => {
  if (!article) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt || article.title,
    image: article.coverImage ? [article.coverImage] : [`${SITE_URL}/uploads/settings/bca-og-banner.webp`],
    datePublished: article.publishedAt || article.createdAt,
    dateModified: article.updatedAt || article.createdAt,
    author: {
      '@type': 'Person',
      name: article.author?.firstName
        ? `${article.author.firstName} ${article.author.lastName}`
        : 'Rédaction B.C.A.',
    },
    publisher: {
      '@type': 'Organization',
      name: 'B.C.A. Tiaret',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/uploads/settings/logo-bca.webp`,
      },
    },
  };
};

/**
 * Schéma Entreprise Locale / Annonceur (LocalBusiness)
 */
export const getLocalBusinessSchema = (annonceur) => {
  if (!annonceur) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: annonceur.name,
    description: annonceur.shortDescription || annonceur.name,
    image: annonceur.logo || `${SITE_URL}/uploads/settings/logo-bca.webp`,
    telephone: annonceur.phone,
    email: annonceur.email,
    url: annonceur.website || SITE_URL,
    address: {
      '@type': 'PostalAddress',
      streetAddress: annonceur.address || 'Tiaret Centre',
      addressLocality: annonceur.commune || 'Tiaret',
      addressRegion: 'Tiaret',
      addressCountry: 'DZ',
    },
  };
};
