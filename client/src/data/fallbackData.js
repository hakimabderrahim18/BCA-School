/**
 * Données par défaut pour un affichage immédiat et résilient (Optimistic Display)
 * Garantit que la plateforme B.C.A. affiche toujours un contenu complet et professionnel
 * même si le serveur backend est en démarrage à froid (Cold Start Render) ou lors du premier déploiement.
 */

export const FALLBACK_COURSES = [
  {
    _id: '6ae079416d7d7a45ba8cb459',
    title: 'Infographie, PAO & Conception Visuelle (Photoshop, Illustrator, InDesign)',
    slug: 'infographie-pao-et-conception-visuelle-photoshop-illustrator-indesign',
    category: { name: 'Design & Multimédia' },
    summary: 'Maîtrisez la suite Adobe pour concevoir des identités visuelles percutantes, affiches professionnelles et supports d’impression haut de gamme.',
    duration: '45 heures (6 semaines)',
    durationHours: 45,
    durationWeeks: 6,
    priceDisplay: '25 000 DZD',
    isCertified: true,
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    _id: '6ae079416d7d7a45ba8cb45b',
    title: 'Développement Web Full-Stack Moderne (React, Node.js, Express & MongoDB)',
    slug: 'developpement-web-full-stack-moderne-react-nodejs-express-et-mongodb',
    category: { name: 'Informatique & Web' },
    summary: 'Devenez autonome dans la création d’applications web modernes et réactives, de la conception des API REST au déploiement cloud.',
    duration: '60 heures (8 semaines)',
    durationHours: 60,
    durationWeeks: 8,
    priceDisplay: '35 000 DZD',
    isCertified: true,
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    _id: '6ae079416d7d7a45ba8cb45d',
    title: 'Comptabilité Pratique des Entreprises & Système SCF Algérien',
    slug: 'comptabilite-pratique-des-entreprises-et-systeme-scf-algerien',
    category: { name: 'Gestion & Comptabilité' },
    summary: 'Maîtrisez les écritures comptables, les déclarations fiscales (G50) et la paie sur PC Compta et logiciels de référence en Algérie.',
    duration: '40 heures (5 semaines)',
    durationHours: 40,
    durationWeeks: 5,
    priceDisplay: '22 000 DZD',
    isCertified: true,
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
  },
];

export const FALLBACK_SERVICES = [
  {
    _id: '6adcd5d95ab88e23e37517ee',
    title: 'Conception d’Identité Visuelle & Création de Supports',
    slug: 'conception-didentite-visuelle-et-creation-de-supports-de-communication',
    summary: 'Logos sur mesure, chartes graphiques complètes, papeterie professionnelle et supports publicitaires percutants.',
    benefits: ['Logotype vectoriel haute définition', 'Charte graphique complète', 'Fichiers prêts pour impression'],
  },
  {
    _id: '6adcd5d95ab88e23e37517f6',
    title: 'Production Audiovisuelle & Spots Publicitaires Professionnels',
    slug: 'production-audiovisuelle-et-spots-publicitaires-professionnels',
    summary: 'Tournage en 4K, réalisation de spots publicitaires, vidéos d’entreprise et couverture événementielle professionnelle.',
    benefits: ['Équipement 4K & éclairage studio', 'Montage dynamique & effets sonores', 'Formats optimisés réseaux sociaux'],
  },
  {
    _id: '6adcd5d95ab88e23e37517f8',
    title: 'Gestion des Réseaux Sociaux & Publicité Sponsorisée (Meta Ads)',
    slug: 'gestion-des-reseaux-sociaux-et-publicite-sponsorisee-meta-ads',
    summary: 'Gestion professionnelle de vos réseaux sociaux Facebook, Instagram et TikTok avec création continue de contenu engageant.',
    benefits: ['Planning éditorial mensuel', 'Animation & modération de communauté', 'Campagnes sponsorisées ciblées à Tiaret'],
  },
];

export const FALLBACK_EVENTS = [
  {
    _id: 'fb-e1',
    title: 'Journée Portes Ouvertes : Découverte des Métiers du Web & Design',
    slug: 'journee-portes-ouvertes-bca',
    summary: 'Venez visiter nos ateliers, échanger avec nos formateurs et assister à des démonstrations en direct.',
    startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    startTime: '09h30',
    endTime: '17h00',
    location: { venue: 'Centre B.C.A., Cité Administrative', commune: 'Tiaret' },
    isFree: true,
    coverImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
  },
  {
    _id: 'fb-e2',
    title: 'Salon Régional de l’Entrepreneuriat & de l’Innovation Numérique',
    slug: 'salon-entrepreneuriat-tiaret',
    summary: 'Deux jours de conférences, d’ateliers de networking et d’expositions pour stimuler l’investissement à Tiaret.',
    startDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    startTime: '09h00',
    endTime: '18h00',
    location: { venue: 'Palais de la Culture, Boulevard de l’Indépendance', commune: 'Tiaret' },
    isFree: true,
    coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
  },
];

export const FALLBACK_ARTICLES = [
  {
    _id: 'fb-a1',
    title: 'Lancement des Nouvelles Sessions de Formation Automne 2026 à Tiaret',
    slug: 'lancement-sessions-formation-automne-2026',
    excerpt: 'Le centre B.C.A. annonce le calendrier de ses nouvelles sessions certifiantes en développement web, infographie et gestion.',
    createdAt: new Date().toISOString(),
    category: { name: 'Formation' },
    coverImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    _id: 'fb-a2',
    title: 'Comment Digitaliser la Communication de Votre Entreprise en Algérie',
    slug: 'digitaliser-communication-entreprise-algerie',
    excerpt: 'Découvrez les clés indispensables pour renforcer la présence en ligne de votre marque et attirer une clientèle locale fidèle.',
    createdAt: new Date().toISOString(),
    category: { name: 'Communication' },
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
  },
];

export const FALLBACK_TESTIMONIALS = [
  {
    _id: 'fb-t1',
    authorName: 'Karim Mebarki',
    roleOrCompany: 'Stagiaire en Développement Web Full-Stack',
    content: 'Une formation exceptionnelle 100% pratique à Tiaret. Grâce à l’accompagnement des formateurs, j’ai pu lancer mon activité en freelance dès la fin de ma formation.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  },
  {
    _id: 'fb-t2',
    authorName: 'Amina Benali',
    roleOrCompany: 'Diplômée en Infographie & Design Graphique',
    content: 'Le centre B.C.A. dispose d’équipements modernes et de logiciels récents. Les ateliers pratiques m’ont permis de créer un portfolio professionnel complet.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  },
];

export const FALLBACK_PARTNERS = [
  { _id: 'fb-p1', name: 'Chambre de Commerce et d’Industrie (CCI Sersou)', logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=300&q=80' },
  { _id: 'fb-p2', name: 'Université Ibn Khaldoun de Tiaret', logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=300&q=80' },
  { _id: 'fb-p3', name: 'Direction de la Formation Professionnelle (DFEP)', logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=300&q=80' },
];
