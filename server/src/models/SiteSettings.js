import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      default: 'B.C.A. - Centre de Formation & Communication',
      trim: true,
    },
    tagline: {
      type: String,
      default: 'L’excellence en formation et communication professionnelle à Tiaret',
      trim: true,
    },
    logo: {
      type: String,
      default: '/uploads/settings/logo-bca.webp',
    },
    logoWhite: {
      type: String,
      default: '/uploads/settings/logo-bca-white.webp',
    },
    favicon: {
      type: String,
      default: '/favicon.ico',
    },
    contact: {
      address: { type: String, default: 'Cité Administrative, Boulevard Principal, Tiaret' },
      commune: { type: String, default: 'Tiaret' },
      wilaya: { type: String, default: 'Tiaret (14)' },
      phone1: { type: String, default: '0550 00 00 00' },
      phone2: { type: String, default: '046 00 00 00' },
      email: { type: String, default: 'contact@bca-tiaret.dz' },
      whatsappNumber: { type: String, default: '213550000000' },
      openingHours: { type: String, default: 'Du Samedi au Jeudi : 08h30 - 17h00' },
      mapCoordinates: {
        lat: { type: Number, default: 35.371 },
        lng: { type: Number, default: 1.317 },
      },
      mapEmbedUrl: {
        type: String,
        default: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d104500!2d1.3!3d35.37',
      },
    },
    socialLinks: {
      facebook: { type: String, default: 'https://facebook.com/bca.tiaret' },
      instagram: { type: String, default: 'https://instagram.com/bca.tiaret' },
      linkedin: { type: String, default: 'https://linkedin.com/company/bca-tiaret' },
      youtube: { type: String, default: '' },
      tiktok: { type: String, default: '' },
    },
    about: {
      presentation: {
        type: String,
        default: 'B.C.A. est un pôle d’excellence dédié à la formation professionnelle continue et aux solutions de communication globales pour les entreprises, associations et particuliers de la région de Tiaret.',
      },
      history: {
        type: String,
        default: 'Fondé pour répondre aux besoins grandissants de compétences numériques, linguistiques et managériales, le centre B.C.A. s’est imposé comme un acteur clé du développement économique et pédagogique local.',
      },
      mission: {
        type: String,
        default: 'Donner à chacun les clés de la réussite à travers des formations pratiques certifiantes et accompagner les organisations dans leur rayonnement local et national.',
      },
      values: {
        type: [String],
        default: ['Excellence pédagogique', 'Innovation & Pratique', 'Engagement local', 'Accompagnement personnalisé'],
      },
      team: [
        {
          name: { type: String, required: true },
          role: { type: String, required: true },
          photo: { type: String, default: '' },
          bio: { type: String, default: '' },
        },
      ],
      facilities: [
        {
          title: { type: String, required: true },
          description: { type: String, default: '' },
          photo: { type: String, default: '' },
        },
      ],
    },
    advertisingRates: [
      {
        title: { type: String, default: 'Bannière En-Tête Accueil' },
        description: { type: String, default: 'Visibilité maximale en haut de la page d’accueil' },
        price: { type: String, default: '20 000 DZD / mois' },
        duration: { type: String, default: '30 jours' },
      },
      {
        title: { type: String, default: 'Fiche Annuaire Pro Dédiée' },
        description: { type: String, default: 'Page complète avec photos, coordonnées, horaires et réseaux' },
        price: { type: String, default: '15 000 DZD / an' },
        duration: { type: String, default: '1 an' },
      },
      {
        title: { type: String, default: 'Article Sponsorisé & Réseaux' },
        description: { type: String, default: 'Rédaction d’un article vitrine avec relai Facebook/Instagram' },
        price: { type: String, default: '10 000 DZD' },
        duration: { type: String, default: 'Permanent' },
      },
    ],
    seo: {
      defaultMetaTitle: {
        type: String,
        default: 'B.C.A. | Centre de Formation, Communication & Portail Local à Tiaret',
      },
      defaultMetaDescription: {
        type: String,
        default: 'Formations professionnelles agréées, agence de communication, actualités régionales et annonces à Tiaret, Algérie.',
      },
      keywords: {
        type: [String],
        default: ['formation tiaret', 'centre formation tiaret', 'communication tiaret', 'actualites tiaret', 'annonces tiaret'],
      },
      defaultOgImage: {
        type: String,
        default: '/uploads/settings/bca-og-banner.webp',
      },
      googleAnalyticsId: {
        type: String,
        default: '',
      },
    },
    colors: {
      primary: { type: String, default: '#082849' },
      accent: { type: String, default: '#f59e0b' },
    },
    homePhotos: {
      heroSlide1: {
        type: String,
        default: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1920&q=80',
      },
      heroSlide2: {
        type: String,
        default: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1920&q=80',
      },
      heroSlide3: {
        type: String,
        default: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1920&q=80',
      },
      ctaBanner: {
        type: String,
        default: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80',
      },
    },
    adPricing: {
      bannerHomeTop: { type: String, default: '25 000 DA / mois' },
      bannerHomeMiddle: { type: String, default: '18 000 DA / mois' },
      sponsoredArticle: { type: String, default: '12 000 DA' },
      advertiserPageAnnual: { type: String, default: '35 000 DA / an' },
    },
    legalMentions: {
      type: String,
      default: 'Éditeur du site : Centre B.C.A. Tiaret - Algérie. Agrément n°...',
    },
    privacyPolicy: {
      type: String,
      default: 'Conformément aux lois algériennes relatives à la protection des données à caractère personnel (Loi 18-07)...',
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);
export default SiteSettings;
