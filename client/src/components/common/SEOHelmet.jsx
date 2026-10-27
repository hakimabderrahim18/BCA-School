import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

export const SEOHelmet = ({
  title,
  description,
  image,
  url,
  type = 'website',
  schemaJson = null,
}) => {
  const { i18n } = useTranslation();
  const defaultSiteName = 'B.C.A. - Centre de Formation & Communication Tiaret';
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://bca-tiaret.dz';

  const fullTitle = title ? `${title} | ${defaultSiteName}` : defaultSiteName;
  const fullDescription =
    description ||
    'B.C.A. est le centre de formation professionnelle de référence et agence de communication à Tiaret, Algérie. Formations certifiantes, actualités locales et support publicitaire.';
  const ogImage = image
    ? image.startsWith('http')
      ? image
      : `${siteUrl}${image}`
    : `${siteUrl}/uploads/settings/bca-og-banner.webp`;
  const canonicalUrl = url ? `${siteUrl}${url}` : siteUrl;

  return (
    <Helmet>
      {/* Balises HTML standard */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <link rel="canonical" href={canonicalUrl} />
      <html lang={i18n.language || 'fr'} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'} />

      {/* Balises Open Graph / Facebook / WhatsApp */}
      <meta property="og:site_name" content={defaultSiteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content={i18n.language === 'ar' ? 'ar_DZ' : 'fr_DZ'} />

      {/* Balises Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={ogImage} />

      {/* Données structurées Schema.org JSON-LD */}
      {schemaJson && (
        <script type="application/ld+json">
          {JSON.stringify(schemaJson)}
        </script>
      )}
    </Helmet>
  );
};
