import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { ROLES } from '../config/roles.js';

// Import de tous les modèles
import User from '../models/User.js';
import Category from '../models/Category.js';
import Formation from '../models/Formation.js';
import Session from '../models/Session.js';
import PreInscription from '../models/PreInscription.js';
import Prestation from '../models/Prestation.js';
import Realisation from '../models/Realisation.js';
import Article from '../models/Article.js';
import Event from '../models/Event.js';
import EventProposal from '../models/EventProposal.js';
import Annonceur from '../models/Annonceur.js';
import PetiteAnnonce from '../models/PetiteAnnonce.js';
import AdSlot from '../models/AdSlot.js';
import Album from '../models/Album.js';
import MediaItem from '../models/MediaItem.js';
import Testimonial from '../models/Testimonial.js';
import Partner from '../models/Partner.js';
import ContactMessage from '../models/ContactMessage.js';
import QuoteRequest from '../models/QuoteRequest.js';
import SiteSettings from '../models/SiteSettings.js';

const seedDatabase = async () => {
  try {
    console.log('--- Démarrage de l’initialisation des données de démonstration (Seed) ---');
    await connectDB();

    // 1. Nettoyage de la base de données
    console.log('[Seed] Nettoyage des collections existantes...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Formation.deleteMany({}),
      Session.deleteMany({}),
      PreInscription.deleteMany({}),
      Prestation.deleteMany({}),
      Realisation.deleteMany({}),
      Article.deleteMany({}),
      Event.deleteMany({}),
      EventProposal.deleteMany({}),
      Annonceur.deleteMany({}),
      PetiteAnnonce.deleteMany({}),
      AdSlot.deleteMany({}),
      Album.deleteMany({}),
      MediaItem.deleteMany({}),
      Testimonial.deleteMany({}),
      Partner.deleteMany({}),
      ContactMessage.deleteMany({}),
      QuoteRequest.deleteMany({}),
      SiteSettings.deleteMany({}),
    ]);

    // 2. Création des utilisateurs initiaux (Admin, Éditeur, Rédacteur)
    console.log('[Seed] Création des comptes utilisateurs...');
    const superAdmin = await User.create({
      name: process.env.INITIAL_ADMIN_NAME || 'Directeur Général B.C.A.',
      email: process.env.INITIAL_ADMIN_EMAIL || 'admin@bca-tiaret.dz',
      password: process.env.INITIAL_ADMIN_PASSWORD || 'AdminSecurePass2026!',
      role: ROLES.ADMIN,
      phone: process.env.INITIAL_ADMIN_PHONE || '0550123456',
      isActive: true,
    });

    const editor = await User.create({
      name: 'Yacine Mansouri (Responsable Pédagogique)',
      email: 'editeur@bca-tiaret.dz',
      password: 'EditorPassword2026!',
      role: ROLES.EDITOR,
      phone: '0551234567',
      isActive: true,
    });

    const writer = await User.create({
      name: 'Amel Belkacem (Chargée de Communication)',
      email: 'redactrice@bca-tiaret.dz',
      password: 'WriterPassword2026!',
      role: ROLES.WRITER,
      phone: '0552345678',
      isActive: true,
    });

    // 3. Création des Catégories
    console.log('[Seed] Création des catégories de contenus...');
    const catFormCom = await Category.create({ name: 'Communication & Médias', type: 'formation', icon: 'Megaphone', color: '#0e8ce8', order: 1 });
    const catFormInfo = await Category.create({ name: 'Informatique & Web', type: 'formation', icon: 'Code', color: '#10b981', order: 2 });
    const catFormLang = await Category.create({ name: 'Langues Étrangères', type: 'formation', icon: 'Languages', color: '#f59e0b', order: 3 });
    const catFormGest = await Category.create({ name: 'Gestion & Comptabilité', type: 'formation', icon: 'BarChart', color: '#8b5cf6', order: 4 });

    const catPrestGraph = await Category.create({ name: 'Identité Visuelle & Graphisme', type: 'prestation', icon: 'Palette', color: '#ec4899', order: 1 });
    const catPrestVideo = await Category.create({ name: 'Production Vidéo & Spot Pub', type: 'prestation', icon: 'Video', color: '#f43f5e', order: 2 });
    const catPrestDigital = await Category.create({ name: 'Stratégie Digitale & Réseaux', type: 'prestation', icon: 'Share2', color: '#06b6d4', order: 3 });

    const catArtCentre = await Category.create({ name: 'Vie du Centre', type: 'article', icon: 'Building', color: '#0e8ce8', order: 1 });
    const catArtLocal = await Category.create({ name: 'Actualité Locale Tiaret', type: 'article', icon: 'MapPin', color: '#10b981', order: 2 });
    const catArtEco = await Category.create({ name: 'Économie & Entrepreneuriat', type: 'article', icon: 'TrendingUp', color: '#f59e0b', order: 3 });

    const catEventPro = await Category.create({ name: 'Salons & Conférences', type: 'event', icon: 'Users', color: '#6366f1', order: 1 });
    const catEventCulture = await Category.create({ name: 'Culture & Portes Ouvertes', type: 'event', icon: 'Calendar', color: '#d97706', order: 2 });

    const catAnnSante = await Category.create({ name: 'Santé & Bien-être', type: 'annonceur', icon: 'Heart', color: '#ef4444', order: 1 });
    const catAnnBTP = await Category.create({ name: 'BTP & Immobilier', type: 'annonceur', icon: 'Home', color: '#84cc16', order: 2 });
    const catAnnResto = await Category.create({ name: 'Commerce & Restauration', type: 'annonceur', icon: 'ShoppingBag', color: '#f97316', order: 3 });

    const catPetiteEmploi = await Category.create({ name: 'Offres d’Emploi', type: 'petite_annonce', icon: 'Briefcase', color: '#0284c7', order: 1 });
    const catPetiteMateriel = await Category.create({ name: 'Matériel & Informatique', type: 'petite_annonce', icon: 'Monitor', color: '#14b8a6', order: 2 });

    // 4. Création des Formations & Sessions
    console.log('[Seed] Création des formations et sessions d’apprentissage...');
    const f1 = await Formation.create({
      title: 'Infographie, PAO & Conception Visuelle (Photoshop, Illustrator, InDesign)',
      category: catFormCom._id,
      subtitle: 'Maîtrisez la création graphique professionnelle de A à Z',
      summary: 'Une formation 100% pratique pour maîtriser les logiciels phares de la suite Adobe, créer des identités visuelles percutantes et préparer des fichiers pour l’impression.',
      description: `
        <h3>Devenez un graphiste qualifié et opérationnel</h3>
        <p>Cette formation s'adresse aux passionnés d'arts visuels, aux chargés de communication et aux professionnels souhaitant acquérir une autonomie complète sur les logiciels incontournables du graphisme moderne.</p>
        <h4>Au programme :</h4>
        <ul>
          <li><strong>Adobe Photoshop :</strong> Retouche photo avancée, photomontage, composition graphique, optimisation web et réseaux sociaux.</li>
          <li><strong>Adobe Illustrator :</strong> Dessin vectoriel, création de logos mémorables, typographie, chartes graphiques et illustrations vectorielles.</li>
          <li><strong>Adobe InDesign :</strong> Mise en page éditoriale, catalogues, brochures commerciales, dépliants et préparation professionnelle pour l’imprimerie.</li>
        </ul>
      `,
      objectives: [
        'Concevoir une identité visuelle complète et son guide de style',
        'Créer des supports de communication percutants (affiches, flyers, bannières web)',
        'Maîtriser les normes techniques d’impression et colorimétrie (CMJN / RVB)',
        'Construire un portfolio professionnel attrayant',
      ],
      targetAudience: ['Étudiants et diplômés', 'Chargés de communication', 'Créateurs d’entreprises', 'Passionnés de design'],
      durationHours: 45,
      durationWeeks: 6,
      price: 25000,
      priceDisplay: '25 000 DZD',
      certification: 'Attestation de formation qualifiante agréée par le centre B.C.A.',
      trainer: {
        name: 'M. Sofiane Cherif',
        title: 'Directeur Artistique & Formateur Senior (12 ans d’expérience)',
        bio: 'Diplômé en Beaux-Arts et infographie, ayant réalisé l’identité visuelle de nombreuses marques régionales et nationales.',
      },
      image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1200&q=80',
      isFeatured: true,
      status: 'published',
      order: 1,
    });

    await Session.create({
      formation: f1._id,
      sessionCode: 'INFO-2026-01',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      schedule: 'Samedis et Mardis de 09h00 à 12h00',
      location: 'Laboratoire Multimédia 1 - Siège B.C.A. Tiaret',
      modality: 'presentiel',
      maxSeats: 12,
      enrolledCount: 5,
      status: 'planned',
    });

    const f2 = await Formation.create({
      title: 'Développement Web Full Stack MERN (MongoDB, Express, React, Node.js)',
      category: catFormInfo._id,
      subtitle: 'Concevez et déployez des applications web dynamiques et scalables',
      summary: 'Parcours intensif pour apprendre à programmer des applications web modernes, depuis la base de données MongoDB jusqu’aux interfaces réactives en React.',
      description: `
        <h3>Apprenez le développement web moderne</h3>
        <p>Le stack MERN est aujourd’hui l’un des plus demandés sur le marché du travail national et international. Vous développerez des projets réels tout au long de la formation.</p>
      `,
      objectives: [
        'Créer des API RESTful robustes et sécurisées avec Node.js et Express',
        'Manipuler des bases de données NoSQL avec MongoDB et Mongoose',
        'Construire des interfaces utilisateurs fluides avec React et Tailwind CSS',
        'Déployer des applications sur un serveur Linux en production',
      ],
      durationHours: 60,
      durationWeeks: 8,
      price: 35000,
      priceDisplay: '35 000 DZD',
      trainer: {
        name: 'Ing. Walid Benali',
        title: 'Lead Développeur Full Stack',
        bio: 'Ingénieur en informatique avec plus de 8 années d’expérience en architecture logicielle.',
      },
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
      isFeatured: true,
      status: 'published',
      order: 2,
    });

    await Session.create({
      formation: f2._id,
      sessionCode: 'MERN-2026-01',
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 65 * 24 * 60 * 60 * 1000),
      schedule: 'Dimanches et Mercredis de 13h30 à 16h30',
      location: 'Salle Informatique 2 - Centre B.C.A.',
      maxSeats: 10,
      enrolledCount: 4,
      status: 'planned',
    });

    const f3 = await Formation.create({
      title: 'Anglais Professionnel des Affaires & Communication Internationale',
      category: catFormLang._id,
      subtitle: 'Développez votre aisance à l’oral et rédigez des échanges professionnels impeccables',
      summary: 'Formation orientée pratique pour réussir vos entretiens, animer des réunions en anglais et interagir avec des partenaires internationaux.',
      description: '<p>Ateliers de simulation, jeux de rôles en immersion et perfectionnement de la grammaire appliquée au monde professionnel.</p>',
      durationHours: 36,
      durationWeeks: 6,
      price: 18000,
      priceDisplay: '18 000 DZD',
      trainer: {
        name: 'Mme. Sarah Toumi',
        title: 'Formatrice Certifiée CELTA / Cambridge',
      },
      image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1200&q=80',
      isFeatured: true,
      status: 'published',
      order: 3,
    });

    const f4 = await Formation.create({
      title: 'Comptabilité Pratique sur Logiciels Spécialisés (PC Compta / DLG)',
      category: catFormGest._id,
      subtitle: 'Maîtrisez la tenue des comptes, déclarations fiscales et bilans financiers',
      summary: 'Acquérez une compétence directement opérationnelle sur les logiciels comptables les plus utilisés dans les cabinets et entreprises en Algérie.',
      description: '<p>Cas pratiques concrets : saisie des écritures, rapprochements bancaires, déclarations G50, amortissements et clôture d’exercice.</p>',
      durationHours: 40,
      durationWeeks: 5,
      price: 22000,
      priceDisplay: '22 000 DZD',
      trainer: {
        name: 'M. Ahmed Belhadj',
        title: 'Expert-Comptable Commissaire aux Comptes',
      },
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
      isFeatured: false,
      status: 'published',
      order: 4,
    });

    // 5. Création des Prestations & Réalisations
    console.log('[Seed] Création des prestations d’agence et réalisations...');
    const p1 = await Prestation.create({
      title: 'Conception d’Identité Visuelle & Création de Supports de Communication',
      category: catPrestGraph._id,
      summary: 'Donnez à votre entreprise une image forte, mémorable et professionnelle adaptée au marché algérien.',
      description: `
        <p>Nous concevons l’ensemble de votre univers visuel : du logo à la charte graphique complète, en passant par les enseignes, cartes de visite, roll-ups, plaquettes commerciales et flocage de véhicules.</p>
      `,
      benefits: [
        'Image de marque distinctive et valorisante',
        'Déclinaison harmonieuse sur tous vos supports physiques et digitaux',
        'Fichiers sources vectoriels haute définition livrés clés en main',
      ],
      steps: [
        { stepNumber: 1, title: 'Briefing & Analyse', description: 'Étude de vos objectifs, cible et concurrence locale.' },
        { stepNumber: 2, title: 'Propositions créatives', description: 'Présentation de 3 concepts de logos uniques.' },
        { stepNumber: 3, title: 'Affinement & Finalisation', description: 'Ajustements jusqu’à validation complète.' },
        { stepNumber: 4, title: 'Livraison & Impression', description: 'Remise des fichiers sources et accompagnement print.' },
      ],
      delay: '7 à 12 jours ouvrés',
      priceDisplay: 'À partir de 30 000 DZD',
      image: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?auto=format&fit=crop&w=1200&q=80',
      isFeatured: true,
      status: 'published',
      order: 1,
    });

    await Realisation.create({
      prestation: p1._id,
      title: 'Refonte de l’identité visuelle complète de la SARL Sersou Agro',
      clientName: 'SARL Sersou Agro - Tiaret',
      description: 'Création du logotype, de la charte graphique, du packaging des produits du terroir et des dépliants commerciaux pour foires nationales.',
      coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
      isFeatured: true,
    });

    const p2 = await Prestation.create({
      title: 'Production Audiovisuelle & Spots Publicitaires Professionnels',
      category: catPrestVideo._id,
      summary: 'Valorisez vos locaux, vos équipes et vos produits avec des vidéos percutantes au rendu cinématographique.',
      description: '<p>Tournage 4K, captation par drone agréée, montage dynamique, voix off bilingue (arabe/français) et étalonnage professionnel.</p>',
      delay: '10 à 15 jours ouvrés',
      priceDisplay: 'Sur devis personnalisé',
      image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
      isFeatured: true,
      status: 'published',
      order: 2,
    });

    const p3 = await Prestation.create({
      title: 'Gestion des Réseaux Sociaux & Publicité Sponsorisée (Meta Ads)',
      category: catPrestDigital._id,
      summary: 'Attirez de nouveaux clients locaux et développez votre notoriété sur Facebook et Instagram.',
      description: '<p>Création de contenu engageant, gestion de communauté, modération des messages et pilotage de campagnes publicitaires ciblées sur la wilaya de Tiaret et ses environs.</p>',
      delay: 'Abonnement mensuel',
      priceDisplay: 'À partir de 25 000 DZD / mois',
      image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1200&q=80',
      isFeatured: true,
      status: 'published',
      order: 3,
    });

    // 6. Création des Articles d'Actualité
    console.log('[Seed] Création des articles de presse et d’information locale...');
    await Article.create({
      title: 'B.C.A. lance de nouveaux cycles de formation certifiants aux métiers du digital à Tiaret',
      category: catArtCentre._id,
      author: editor._id,
      summary: 'Pour répondre aux besoins croissants des entreprises régionales en profils qualifiés, le centre B.C.A. annonce le lancement de nouveaux programmes orientés compétences pratiques.',
      content: `
        <p>Le centre de formation et de communication B.C.A. franchit une nouvelle étape dans son développement avec l'ouverture de cursus spécialisés en infographie, développement d'applications web et marketing de contenu.</p>
        <p>Équipé de laboratoires modernes avec des postes de travail performants, le centre met l'accent sur l'apprentissage par projet, garantissant à chaque stagiaire un suivi individualisé.</p>
        <blockquote>« Notre vocation est d'offrir à la jeunesse et aux professionnels de Tiaret un cadre d'excellence technique identique aux meilleurs standards nationaux. »</blockquote>
        <p>Les inscriptions pour la prochaine session sont dès à présent ouvertes via le formulaire en ligne de la plateforme.</p>
      `,
      coverImage: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
      tags: ['BCA', 'Formation', 'Tiaret', 'Digital', 'Emploi'],
      isFeatured: true,
      status: 'published',
      publishedAt: new Date(),
    });

    await Article.create({
      title: 'Dynamisme économique à Tiaret : l’essor remarquable des start-ups et artisans locaux',
      category: catArtEco._id,
      author: writer._id,
      summary: 'La région de Tiaret connaît un regain d’intérêt notable pour l’entrepreneuriat des jeunes, porté par les dispositifs d’accompagnement et la transformation numérique.',
      content: `
        <p>De l'agroalimentaire aux services technologiques, les porteurs de projets dans la wilaya de Tiaret multiplient les initiatives novatrices. L'accès à une communication visuelle de qualité devient un levier incontournable de différenciation.</p>
      `,
      coverImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
      tags: ['Tiaret', 'Économie', 'Entrepreneuriat', 'PME'],
      isFeatured: true,
      status: 'published',
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    });

    // 7. Création des Événements
    console.log('[Seed] Création des événements de l’agenda local...');
    await Event.create({
      title: 'Salon Régional de la Formation, des Métiers et de l’Entrepreneuriat - Tiaret 2026',
      category: catEventPro._id,
      description: 'Le rendez-vous incontournable des étudiants, chercheurs d’emploi, porteurs de projets et chefs d’entreprises de la région du Sersou. Conférences gratuites, ateliers pratiques et espaces de recrutement.',
      startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000),
      startTime: '09:00',
      endTime: '17:30',
      location: {
        venue: 'Maison de la Culture Ali Maachi',
        address: 'Boulevard de l’Indépendance',
        commune: 'Tiaret',
        wilaya: 'Tiaret (14)',
      },
      organizer: {
        name: 'Centre B.C.A. & Collectif d’Initiatives Locales',
        phone: '0550 00 00 00',
        email: 'events@bca-tiaret.dz',
      },
      coverImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
      isFree: true,
      isFeatured: true,
      status: 'published',
    });

    await Event.create({
      title: 'Journée Portes Ouvertes : Découverte des Métiers du Graphisme et du Web',
      category: catEventCulture._id,
      description: 'Venez tester gratuitement nos équipements informatiques, échanger avec nos formateurs experts et assister à des démonstrations en direct.',
      startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      startTime: '10:00',
      endTime: '16:00',
      location: {
        venue: 'Siège du Centre B.C.A.',
        address: 'Cité Administrative, Tiaret',
        commune: 'Tiaret',
      },
      organizer: {
        name: 'Direction Pédagogique B.C.A.',
        phone: '0550 12 34 56',
        email: 'contact@bca-tiaret.dz',
      },
      coverImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
      isFree: true,
      isFeatured: false,
      status: 'published',
    });

    // 8. Création des Annonceurs de l’Annuaire
    console.log('[Seed] Création des fiches annonceurs partenaires...');
    await Annonceur.create({
      name: 'Clinique Dentaire & d’Implantologie El-Amel',
      sector: catAnnSante._id,
      logo: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80',
      coverImage: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=80',
      shortDescription: 'Soins dentaires complets, blanchiment au laser, implantologie et orthodontie adulte/enfant à Tiaret.',
      fullDescription: 'La clinique El-Amel met à votre disposition une équipe de chirurgiens-dentistes chevronnés et des équipements d’imagerie 3D de dernière génération.',
      address: '12 Rue Capitaine Si Zoubir, en face de la Grande Poste',
      commune: 'Tiaret',
      phone: '046 45 12 89',
      secondaryPhone: '0555 45 67 89',
      email: 'contact@clinique-elamel-tiaret.dz',
      openingHours: 'Samedi au Jeudi : 08h30 - 18h30',
      isFeatured: true,
      status: 'active',
    });

    await Annonceur.create({
      name: 'Café & Restaurant Traditionnel "L’Olivier"',
      sector: catAnnResto._id,
      logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
      coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
      shortDescription: 'Cuisine traditionnelle algérienne raffinée, grillades au feu de bois et pâtisseries faites maison.',
      fullDescription: 'Un cadre chaleureux et familial au cœur de Tiaret pour vos déjeuners d’affaires, réunions de famille et moments de détente.',
      address: 'Boulevard de la Liberté, Tiaret',
      commune: 'Tiaret',
      phone: '0552 98 76 54',
      openingHours: '7j/7 : 07h00 - 23h00',
      isFeatured: true,
      status: 'active',
    });

    // 9. Création des Emplacements Publicitaires (Bannières)
    console.log('[Seed] Création des bannières publicitaires actives...');
    await AdSlot.create({
      title: 'Campagne Rentrée Formations B.C.A. 2026',
      slotKey: 'home_banner_top',
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80',
      targetUrl: '/formations',
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      isActive: true,
      priority: 1,
    });

    await AdSlot.create({
      title: 'Espace Publicitaire Dédié aux Annonceurs Locaux',
      slotKey: 'home_banner_middle',
      imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1400&q=80',
      targetUrl: '/annonces-publicite',
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      isActive: true,
      priority: 1,
    });

    // 10. Albums Galerie Photo
    console.log('[Seed] Création de la galerie...');
    const alb1 = await Album.create({
      title: 'Remise des attestations de réussite - Promotion 2025',
      theme: 'formations',
      description: 'Cérémonie conviviale de clôture des cycles de formation professionnelle au centre B.C.A.',
      coverImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
      isFeatured: true,
    });

    await MediaItem.create({
      album: alb1._id,
      title: 'Groupe des stagiaires en infographie',
      type: 'photo',
      url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
      caption: 'Félicitations aux 15 diplômés en conception visuelle !',
    });

    // 11. Témoignages
    console.log('[Seed] Création des avis et témoignages...');
    await Testimonial.create({
      authorName: 'Karim Mansour',
      roleOrCompany: 'Stagiaire Session Infographie & Web (2025)',
      type: 'stagiaire',
      formation: f1._id,
      content: 'Une formation exceptionnelle avec des formateurs à l’écoute et très compétents. Grâce aux projets pratiques réalisés pendant les cours, j’ai pu monter mon agence freelance à Tiaret dès l’obtention de mon attestation.',
      rating: 5,
      isFeatured: true,
      isActive: true,
    });

    await Testimonial.create({
      authorName: 'Rachid Belkacem',
      roleOrCompany: 'Gérant de société agroalimentaire',
      type: 'client',
      prestation: p1._id,
      content: 'L’équipe B.C.A. a pris en charge toute la communication visuelle de notre nouvelle gamme de produits. Réactivité, professionnalisme et respect strict des délais. Je recommande vivement leurs prestations.',
      rating: 5,
      isFeatured: true,
      isActive: true,
    });

    // 12. Partenaires / Logos
    console.log('[Seed] Création des logos partenaires...');
    await Partner.create({
      name: 'Chambre de Commerce et d’Industrie du Sersou',
      logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=300&q=80',
      type: 'partenaire',
      order: 1,
      isActive: true,
    });

    await Partner.create({
      name: 'Club des Entrepreneurs & PME de Tiaret',
      logo: 'https://images.unsplash.com/photo-1516876437184-593fda40c7ce?auto=format&fit=crop&w=300&q=80',
      type: 'partenaire',
      order: 2,
      isActive: true,
    });

    // 13. Paramètres du Site (SiteSettings Singleton)
    console.log('[Seed] Initialisation des paramètres de base du centre...');
    await SiteSettings.create({
      siteName: 'B.C.A. - Centre de Formation & Communication',
      tagline: 'L’excellence en formation professionnelle et communication d’entreprise à Tiaret',
      contact: {
        address: 'Cité Administrative, Boulevard Principal, Tiaret',
        commune: 'Tiaret',
        wilaya: 'Tiaret (14)',
        phone1: '0550 00 00 00',
        phone2: '046 45 00 00',
        email: 'contact@bca-tiaret.dz',
        whatsappNumber: '213550000000',
        openingHours: 'Du Samedi au Jeudi : 08h30 - 17h00 / Vendredi fermé',
        mapCoordinates: { lat: 35.371, lng: 1.317 },
      },
      socialLinks: {
        facebook: 'https://facebook.com/bca.tiaret',
        instagram: 'https://instagram.com/bca.tiaret',
        linkedin: 'https://linkedin.com/company/bca-tiaret',
      },
      about: {
        presentation: 'B.C.A. est un pôle d’excellence agréé dédié à la formation continue et au conseil en communication globale pour les particuliers, entreprises et institutions de la région de Tiaret.',
        history: 'Créé pour combler le déficit en compétences numériques et accompagner les entreprises locales dans leur essor, B.C.A. a formé plus de 500 stagiaires et accompagné des dizaines de structures.',
        mission: 'Offrir un enseignement pratique orienté emploi et des services de communication sur-mesure pour propulser l’économie locale.',
        values: ['Excellence et Rigueur', 'Pédagogie 100% Pratique', 'Engagement Régional', 'Innovation Continue'],
      },
    });

    console.log('===============================================================');
    console.log('[Seed Réussi] Base de données MongoDB initialisée avec succès !');
    console.log('Compte Administrateur :');
    console.log(`- Email    : ${process.env.INITIAL_ADMIN_EMAIL || 'admin@bca-tiaret.dz'}`);
    console.log(`- Password : ${process.env.INITIAL_ADMIN_PASSWORD || 'AdminSecurePass2026!'}`);
    console.log('Compte Éditeur :');
    console.log('- Email    : editeur@bca-tiaret.dz');
    console.log('- Password : EditorPassword2026!');
    console.log('Compte Rédacteur :');
    console.log('- Email    : redactrice@bca-tiaret.dz');
    console.log('- Password : WriterPassword2026!');
    console.log('===============================================================');

    process.exit(0);
  } catch (error) {
    console.error(`[Seed Erreur] : ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
