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
    console.log('--- Démarrage de l’initialisation complète de la base de données (Seed) ---');
    await connectDB();

    // 1. Nettoyage complet
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

    // 2. Création des Utilisateurs (Équipe et Comptes Démo)
    console.log('[Seed] Création des comptes utilisateurs...');
    const superAdmin = await User.create({
      name: process.env.INITIAL_ADMIN_NAME || 'Directeur Général B.C.A.',
      email: process.env.INITIAL_ADMIN_EMAIL || 'admin@bca-tiaret.dz',
      password: process.env.INITIAL_ADMIN_PASSWORD || 'AdminSecurePass2026!',
      role: ROLES.ADMIN,
      phone: process.env.INITIAL_ADMIN_PHONE || '0550000000',
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

    const trainerWeb = await User.create({
      name: 'Karim Boumediene (Formateur Web & Mobile)',
      email: 'formateur.web@bca-tiaret.dz',
      password: 'TrainerPass2026!',
      role: ROLES.EDITOR,
      phone: '0553456789',
      isActive: true,
    });

    const trainerDesign = await User.create({
      name: 'Nadia Larbi (Formatrice Infographie & Design)',
      email: 'formatrice.design@bca-tiaret.dz',
      password: 'TrainerPass2026!',
      role: ROLES.EDITOR,
      phone: '0554567890',
      isActive: true,
    });

    const studentUser = await User.create({
      name: 'Sofiane Dahmani (Stagiaire Promotion 2026)',
      email: 'stagiaire@bca-tiaret.dz',
      password: 'StudentPass2026!',
      role: ROLES.WRITER,
      phone: '0555678901',
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

    const catPetiteEmploi = await Category.create({ name: 'Offres d’Emploi & Stages', type: 'petite_annonce', icon: 'Briefcase', color: '#0284c7', order: 1 });
    const catPetiteMateriel = await Category.create({ name: 'Matériel Informatique & Équipement', type: 'petite_annonce', icon: 'Monitor', color: '#14b8a6', order: 2 });
    const catPetiteServices = await Category.create({ name: 'Services & Prestations', type: 'petite_annonce', icon: 'Tag', color: '#a855f7', order: 3 });

    // 4. Formations & Sessions
    console.log('[Seed] Création des formations et sessions...');
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
      image: 'https://images.unsplash.com/photo-1542744094-24638eff58bb?auto=format&fit=crop&w=1200&q=80',
      isFeatured: true,
      trainer: {
        name: 'Nadia Larbi',
        title: 'Directrice Artistique Senior (10 ans d’expérience)',
        bio: 'Diplômée des Beaux-Arts, Nadia a encadré plus de 20 promotions de designers aujourd’hui en poste en agence ou en freelance.',
        photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      },
    });

    const f2 = await Formation.create({
      title: 'Développement Web Full-Stack Moderne (React, Node.js, Express & MongoDB)',
      category: catFormInfo._id,
      subtitle: 'Concevez des plateformes web interactives et des applications robustes',
      summary: 'Apprenez à coder des applications web complètes de l’interface utilisateur jusqu’à la base de données avec les technologies les plus recherchées par les entreprises.',
      description: `
        <h3>Plongez dans le développement web professionnel</h3>
        <p>Un parcours intensif axé sur des projets réels. De la création d'interfaces réactives avec React et Tailwind CSS à la mise en place d'APIs REST sécurisées sous Node.js.</p>
      `,
      objectives: [
        'Maîtriser JavaScript moderne (ES6+), HTML5 et CSS3',
        'Développer des interfaces utilisateur dynamiques avec React et Tailwind CSS',
        'Créer des APIs REST sécurisées avec authentification JWT et Express',
        'Modéliser et interroger des bases de données NoSQL MongoDB',
        'Déployer des applications en production sur le Cloud',
      ],
      targetAudience: ['Développeurs débutants à intermédiaires', 'Ingénieurs en reconversion', 'Porteurs de projets digitaux'],
      durationHours: 60,
      durationWeeks: 8,
      price: 35000,
      priceDisplay: '35 000 DZD',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
      isFeatured: true,
      trainer: {
        name: 'Karim Boumediene',
        title: 'Lead Developer & Formateur Web Full-Stack',
        bio: 'Consultant indépendant et développeur passionné par l’écosystème JavaScript moderne et le Cloud.',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      },
    });

    const f3 = await Formation.create({
      title: 'Comptabilité Pratique des Entreprises & Système SCF Algérien',
      category: catFormGest._id,
      subtitle: 'Maîtrisez les opérations comptables et déclarations fiscales courantes',
      summary: 'De la tenue des journaux comptables à l’établissement du bilan, apprenez les règles du Système Comptable Financier algérien avec des cas réels sur logiciel spécialisé.',
      description: '<p>Formation essentielle pour les comptables, gestionnaires et chefs d’entreprises désireux de piloter leur gestion financière en toute conformité légale.</p>',
      objectives: [
        'Enregistrer les écritures d’achats, ventes, banques et paie',
        'Établir les déclarations fiscales mensuelles (G50) et bilans annuels',
        'Utiliser un progiciel de comptabilité agréé',
      ],
      targetAudience: ['Comptables débutants', 'Gérants de TPE/PME', 'Étudiants en sciences économiques'],
      durationHours: 40,
      durationWeeks: 5,
      price: 22000,
      priceDisplay: '22 000 DZD',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
      isFeatured: true,
    });

    const f4 = await Formation.create({
      title: 'Anglais Professionnel & Prise de Parole en Public (Business English)',
      category: catFormLang._id,
      subtitle: 'Fluidifiez vos échanges et gagnez en confiance à l’international',
      summary: 'Développez votre aisance orale et écrite en contexte professionnel : réunions, emails d’affaires, négociations et présentations percutantes.',
      description: `
        <h3>Communiquez avec impact dans le monde des affaires</h3>
        <p>Ce programme intensif vise à développer vos compétences linguistiques pratiques en anglais professionnel. Des mises en situation réelles et des simulations d'entretiens pour acquérir une fluidité immédiate.</p>
        <h4>Au programme :</h4>
        <ul>
          <li>Vocabulaire commercial et tournures d'usage en négociation</li>
          <li>Animation de réunions, présentations visuelles et argumentation</li>
          <li>Rédaction d'emails professionnels clairs, courtois et efficaces</li>
        </ul>
      `,
      objectives: [
        'Animer et participer activement à des réunions professionnelles en anglais',
        'Rédiger des correspondances et propositions commerciales claires',
        'Améliorer sa prononciation et son vocabulaire spécifique aux affaires',
      ],
      targetAudience: ['Cadres et managers', 'Ingénieurs', 'Commerciaux et étudiants'],
      durationHours: 36,
      durationWeeks: 6,
      price: 18000,
      priceDisplay: '18 000 DZD',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
      isFeatured: true,
    });

    // Sessions d'apprentissage
    const s1 = await Session.create({
      formation: f1._id,
      sessionCode: 'INFO-2026-01',
      startDate: new Date('2026-02-15'),
      endDate: new Date('2026-03-26'),
      schedule: 'Dimanche, Mardi, Jeudi de 14h00 à 17h00',
      maxSeats: 15,
      enrolledCount: 5,
      status: 'planned',
    });

    const s2 = await Session.create({
      formation: f2._id,
      sessionCode: 'DEV-2026-01',
      startDate: new Date('2026-03-06'),
      endDate: new Date('2026-04-25'),
      schedule: 'Vendredi et Samedi de 09h00 à 16h00',
      maxSeats: 12,
      enrolledCount: 4,
      status: 'planned',
    });

    const s3 = await Session.create({
      formation: f3._id,
      sessionCode: 'COMPT-2026-01',
      startDate: new Date('2026-03-10'),
      endDate: new Date('2026-04-15'),
      schedule: 'Lundi et Mercredi de 17h30 à 20h00',
      maxSeats: 15,
      enrolledCount: 7,
      status: 'planned',
    });

    // 5. Préinscriptions de Démonstration (Inscriptions Stagiaires)
    console.log('[Seed] Création des préinscriptions stagiaires...');
    await PreInscription.create({
      formation: f1._id,
      session: s1._id,
      fullName: 'Amina Cherifi',
      email: 'amina.cherifi@gmail.com',
      phone: '0551001122',
      wilaya: 'Tiaret (14)',
      commune: 'Tiaret',
      currentStatus: 'etudiant',
      motivation: 'Passionnée de graphisme, je souhaite me perfectionner pour travailler comme designer freelance.',
      status: 'nouveau',
    });

    await PreInscription.create({
      formation: f2._id,
      session: s2._id,
      fullName: 'Mustapha Benali',
      email: 'mustapha.benali@outlook.dz',
      phone: '0662334455',
      wilaya: 'Tiaret (14)',
      commune: 'Sougueur',
      currentStatus: 'demandeur_emploi',
      motivation: 'Je cherche à acquérir les compétences nécessaires pour postuler en tant que développeur web junior.',
      status: 'en_cours',
      internalNotes: 'Contacté par téléphone, très motivé. Dossier en attente de validation finale.',
    });

    await PreInscription.create({
      formation: f3._id,
      session: s3._id,
      fullName: 'Farida Ould Kaci',
      email: 'farida.kaci@yahoo.fr',
      phone: '0770998877',
      wilaya: 'Tiaret (14)',
      commune: 'Tiaret',
      currentStatus: 'salarie',
      motivation: 'Je gère la comptabilité dans une PME locale et souhaite me mettre à niveau sur le SCF.',
      status: 'confirme',
      internalNotes: 'Paiement de l’acompte effectué. Place confirmée.',
      processedBy: superAdmin._id,
      processedAt: new Date(),
    });

    await PreInscription.create({
      formation: f1._id,
      session: s1._id,
      fullName: 'Walid Brahimi',
      email: 'walid.brahimi@gmail.com',
      phone: '0540112233',
      wilaya: 'Tiaret (14)',
      commune: 'Frenda',
      currentStatus: 'professionnel',
      motivation: 'Créateur de contenu sur les réseaux sociaux, je souhaite professionnaliser mes visuels.',
      status: 'nouveau',
    });

    // 6. Prestations de l'Agence & Réalisations
    console.log('[Seed] Création des prestations d’agence et réalisations...');
    const p1 = await Prestation.create({
      title: 'Création d’Identité Visuelle & Charte Graphique Complète',
      category: catPrestGraph._id,
      summary: 'Donnez à votre marque une identité forte, mémorable et déclinable sur tous vos supports de communication.',
      description: '<p>Conception sur-mesure de logo, charte typographique, palette chromatique, papeterie d’entreprise et visuels pour réseaux sociaux.</p>',
      benefits: [
        'Logo vectoriel original et déclinaisons (clair / sombre / monochrome)',
        'Livre de marque (Brand Guidelines) complet au format PDF',
        'Pack complet pour impression (Cartes de visite, en-tête, flyers)',
        'Gabarits prêts pour les réseaux sociaux (Facebook, Instagram, LinkedIn)',
      ],
      priceDisplay: 'À partir de 45 000 DZD',
      image: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=1200&q=80',
      isFeatured: true,
    });

    const p2 = await Prestation.create({
      title: 'Production de Spots Publicitaires Vidéo 4K & Drone',
      category: catPrestVideo._id,
      summary: 'Sublimez votre entreprise ou vos produits grâce à des vidéos institutionnelles et publicitaires captivantes.',
      description: '<p>Prise de vue haute définition au sol et par drone, montage dynamique, habillage graphique, voix-off et étalonnage cinéma.</p>',
      benefits: [
        'Scénarisation et découpage technique sur mesure',
        'Tournage professionnel en caméra 4K et prises de vue aériennes autorisées',
        'Montage rythmé, sound design et voix-off bilingue (arabe / français)',
        'Formats optimisés pour les réseaux sociaux (Reels, TikTok, YouTube)',
      ],
      priceDisplay: 'À partir de 60 000 DZD',
      image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
      isFeatured: true,
    });

    const p3 = await Prestation.create({
      title: 'Gestion Professionnelle des Réseaux Sociaux (Community Management)',
      category: catPrestDigital._id,
      summary: 'Déléguez l’animation de vos pages Facebook, Instagram et TikTok à des professionnels de la communication.',
      description: '<p>Stratégie de contenu éditoriale, création graphique hebdomadaire, animation de communauté, modération et campagnes sponsorisées ciblées sur Tiaret et sa région.</p>',
      benefits: [
        'Calendrier éditorial mensuel validé en amont',
        'Création de visuels percutants et rédaction bilingue',
        'Gestion des campagnes publicitaires Meta Ads ciblées',
        'Rapport mensuel détaillé des performances et de la croissance',
      ],
      priceDisplay: 'À partir de 30 000 DZD / mois',
      image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1200&q=80',
      isFeatured: true,
    });

    await Realisation.create({
      title: 'Refonte de l’Identité de Marque & Packaging - Huilerie Moderne du Sersou',
      category: catPrestGraph._id,
      clientName: 'Sarl Huilerie du Sersou',
      prestation: p1._id,
      summary: 'Création d’un univers visuel élégant mariant tradition et modernité pour une marque locale d’huile d’olive extra vierge.',
      description: 'Conception complète de l’identité visuelle, charte graphique et étiquetage packaging pour une huile d’olive de qualité supérieure produite dans la région de Tiaret.',
      coverImage: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1000&q=80',
      isActive: true,
    });

    await Realisation.create({
      title: 'Spot Publicitaire Vidéo - Salon de l’Artisanat & du Tourisme de Tiaret',
      category: catPrestVideo._id,
      clientName: 'Direction de la Culture & Tourisme',
      prestation: p2._id,
      summary: 'Capsule vidéo promotionnelle dynamique diffusée sur les réseaux régionaux avec plus de 120 000 vues.',
      description: 'Production audiovisuelle complète en 4K avec prises de vue aériennes par drone et montage dynamique valorisant le patrimoine artisanal de la wilaya de Tiaret.',
      coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80',
      isActive: true,
    });

    // 7. Demandes de Devis (Quotes)
    console.log('[Seed] Création des demandes de devis...');
    await QuoteRequest.create({
      type: 'prestation',
      fullName: 'Kamel Touati',
      company: 'Clinique Dentaire El-Amel',
      email: 'contact@clinique-elamel.dz',
      phone: '0550114477',
      prestation: p1._id,
      budget: '50 000 - 80 000 DZD',
      deadline: 'Sous 15 jours',
      projectDescription: 'Nous ouvrons un nouveau cabinet à Tiaret centre et nous avons besoin d’un logo, d’une enseigne extérieure lumineuse et de cartes professionnelles.',
      status: 'nouveau',
    });

    await QuoteRequest.create({
      type: 'prestation',
      fullName: 'Aïcha Benali',
      company: 'Pâtisserie Fleur de Blé',
      email: 'aicha.benali@gmail.com',
      phone: '0661223344',
      prestation: p2._id,
      budget: '60 000 DZD',
      deadline: 'Pour le mois prochain',
      projectDescription: 'Réalisation d’une courte vidéo de présentation de notre atelier de pâtisserie artisanale pour nos réseaux Instagram et TikTok.',
      status: 'en_etude',
      internalNotes: 'Contacté au téléphone, proposition tarifaire envoyée par email.',
    });

    await QuoteRequest.create({
      type: 'publicite',
      fullName: 'Samir Boukhatem',
      company: 'Complexe Immobilier Les Pins',
      email: 'contact@lespins-immobilier.dz',
      phone: '0770556677',
      adSlotInterest: 'Bannière d’accueil principale (Haut de page)',
      budget: '25 000 DZD / mois',
      deadline: 'Affichage immédiat',
      projectDescription: 'Campagne de visibilité pour le lancement commercial de notre nouvelle résidence de 60 logements à Tiaret.',
      status: 'accepte',
      internalNotes: 'Bannière validée et intégrée dans la régie publicitaire.',
    });

    // 8. Messages de Contact
    console.log('[Seed] Création des messages de contact...');
    await ContactMessage.create({
      fullName: 'Nour El Houda Mebarki',
      email: 'nour.mebarki@yahoo.com',
      phone: '0555889900',
      subject: 'Renseignements sur la certification et les horaires de cours',
      message: 'Bonjour, vos attestations de formation sont-elles reconnues par l’État pour monter un dossier ANADE ? Proposez-vous des cours du soir ? Merci d’avance pour votre réponse.',
      status: 'nouveau',
    });

    await ContactMessage.create({
      fullName: 'Djamel Khelifi',
      email: 'djamel.khelifi@gmail.com',
      phone: '0663112233',
      subject: 'Partenariat de formation pour les employés de notre entreprise',
      message: 'Nous sommes une société de distribution basée dans la zone industrielle de Tiaret. Nous souhaitons former 6 de nos agents commerciaux sur les logiciels bureautiques et la communication client. Pourriez-vous nous proposer une convention sur-mesure ?',
      status: 'lu',
    });

    await ContactMessage.create({
      fullName: 'Leïla Slimani',
      email: 'leila.slimani@hotmail.com',
      phone: '0771445566',
      subject: 'Inscription formation Infographie session de mars',
      message: 'Je souhaite connaître les modalités de paiement pour la formation Infographie. Est-il possible de payer en deux tranches ?',
      status: 'repondu',
      isReplied: true,
      repliedAt: new Date(),
      replyNotes: 'Répondu par email et téléphone : confirmation du paiement échelonné possible en 2 tranches.',
      handledBy: superAdmin._id,
    });

    // 9. Actualités Régionales & Vie du Centre
    console.log('[Seed] Création des articles de presse et actualités...');
    await Article.create({
      title: 'Lancement officiel des inscriptions aux nouvelles promotions professionnelles 2026 au Centre B.C.A.',
      category: catArtCentre._id,
      summary: 'Le centre B.C.A. ouvre les portes de ses cursus certifiants dans les métiers du digital, du design graphique et de la gestion.',
      content: `
        <p>Le Centre B.C.A. annonce l'ouverture officielle des préinscriptions pour sa nouvelle session de formation professionnelle continue à Tiaret.</p>
        <p>Doté d'infrastructures modernes, d'équipements informatiques récents et de formateurs expérimentés, le centre propose des cursus pratiques conçus pour répondre aux besoins du marché local de l’emploi.</p>
      `,
      coverImage: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
      author: superAdmin._id,
      status: 'published',
      isFeatured: true,
      publishedAt: new Date(),
    });

    await Article.create({
      title: 'Tiaret : Dynamique entrepreneuriale et essor des start-ups innovantes dans la région du Sersou',
      category: catArtEco._id,
      summary: 'Focus sur les jeunes porteurs de projets et créateurs d’entreprises qui dynamisent le tissu économique local grâce aux compétences numériques.',
      content: `
        <p>La wilaya de Tiaret connaît un engouement croissant pour l'entrepreneuriat jeune et les initiatives numériques. De plus en plus de diplômés font le choix de lancer leurs propres projets dans les services, le commerce digital et l'artisanat moderne.</p>
      `,
      coverImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',
      author: writer._id,
      status: 'published',
      isFeatured: true,
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    });

    // 10. Événements de l'Agenda
    console.log('[Seed] Création des événements de l’agenda...');
    const ev1 = await Event.create({
      title: 'Journée Portes Ouvertes : Découverte des Métiers du Web & du Design Graphique',
      category: catEventCulture._id,
      summary: 'Venez visiter nos ateliers, échanger avec nos formateurs et assister à des démonstrations en direct de création digitale.',
      description: '<p>Une journée festive et enrichissante ouverte à tous les passionnés, étudiants et demandeurs d’emploi à Tiaret. Ateliers pratiques gratuits et remises spéciales sur les inscriptions de la journée.</p>',
      startDate: new Date('2026-02-28'),
      endDate: new Date('2026-02-28'),
      startTime: '09h30',
      endTime: '17h00',
      location: {
        venue: 'Centre B.C.A., Cité Administrative',
        commune: 'Tiaret',
        wilaya: 'Tiaret (14)',
      },
      organizer: {
        name: 'Centre B.C.A. Tiaret',
        phone: '0550000000',
        email: 'contact@bca-tiaret.dz',
      },
      coverImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
      isFeatured: true,
      status: 'published',
    });

    const ev2 = await Event.create({
      title: 'Salon Régional de l’Entrepreneuriat & de l’Innovation Numérique de Tiaret',
      category: catEventPro._id,
      summary: 'Le grand rendez-vous économique réunissant porteurs de projets, PME régionales, banques et centres de formation.',
      description: '<p>Deux jours de conférences, d’ateliers de networking et d’expositions pour stimuler l’investissement et l’emploi dans la wilaya de Tiaret.</p>',
      startDate: new Date('2026-03-20'),
      endDate: new Date('2026-03-21'),
      startTime: '09h00',
      endTime: '18h00',
      location: {
        venue: 'Palais de la Culture, Boulevard de l’Indépendance',
        commune: 'Tiaret',
        wilaya: 'Tiaret (14)',
      },
      organizer: {
        name: 'Chambre de Commerce et d’Industrie du Sersou',
        phone: '046452020',
        email: 'contact@cci-sersou.dz',
      },
      coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      isFeatured: true,
      status: 'published',
    });

    // 11. Propositions d'Événements (Event Proposals)
    console.log('[Seed] Création des propositions d’événements...');
    await EventProposal.create({
      title: 'Atelier Sensibilisation à la Cybersécurité pour les TPE/PME',
      category: catEventPro._id,
      description: 'Conférence interactive de 3h animée par un expert pour apprendre aux petites entreprises locales à sécuriser leurs données bancaires et fichiers clients.',
      startDate: new Date('2026-03-15'),
      startTime: '14h00',
      endTime: '17h00',
      venue: 'Chambre de Commerce de Tiaret',
      commune: 'Tiaret',
      organizerName: 'Association Tech Tiaret',
      organizerPhone: '0550998877',
      organizerEmail: 'contact@tech-tiaret.org',
      status: 'pending',
    });

    await EventProposal.create({
      title: 'Exposition d’Art & Peinture Moderne des Jeunes de la Wilaya',
      category: catEventCulture._id,
      description: 'Exposition d’une semaine regroupant 30 artistes locaux dans la grande galerie du centre-ville.',
      startDate: new Date('2026-04-05'),
      endDate: new Date('2026-04-12'),
      venue: 'Maison de la Culture Ali Maâchi',
      commune: 'Tiaret',
      organizerName: 'Collectif des Artistes du Sersou',
      organizerPhone: '0661887766',
      organizerEmail: 'artistes.tiaret@gmail.com',
      status: 'approved',
      reviewedBy: superAdmin._id,
      reviewedAt: new Date(),
    });

    // 12. Annonceurs Partenaires & Annuaire Local
    console.log('[Seed] Création des fiches annonceurs...');
    await Annonceur.create({
      name: 'Hôtel Rostom Tiaret',
      sector: catAnnResto._id,
      shortDescription: 'Hôtel 4 étoiles d’affaires et de tourisme au cœur de Tiaret avec restaurant gastronomique et salles de conférences.',
      fullDescription: 'L’Hôtel Rostom vous accueille dans un cadre moderne et chaleureux. Chambres climatisées de haut standing, restaurant traditionnel et international, espace de séminaires et service traiteur.',
      phone: '046 45 10 10',
      email: 'reservation@hotel-rostom.dz',
      website: 'https://hotel-rostom.dz',
      address: 'Boulevard de l’ALN, Centre-ville, Tiaret',
      commune: 'Tiaret',
      logo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80',
      coverImage: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      isFeatured: true,
      status: 'active',
    });

    await Annonceur.create({
      name: 'Laboratoire Médical Ibn Rochd',
      sector: catAnnSante._id,
      shortDescription: 'Analyses médicales automatisées de haute précision avec remise sécurisée des résultats en ligne.',
      fullDescription: 'Équipé d’automates de dernière génération, le laboratoire Ibn Rochd prend en charge l’ensemble des bilans sanguins, bactériologiques et hormonaux avec une équipe dévouée.',
      phone: '046 42 20 20',
      email: 'labo.ibnrochd.tiaret@gmail.com',
      address: 'Face à l’Hôpital Youssef Damerdji, Tiaret',
      commune: 'Tiaret',
      logo: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=400&q=80',
      coverImage: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?auto=format&fit=crop&w=1200&q=80',
      isFeatured: true,
      status: 'active',
    });

    await Annonceur.create({
      name: 'Promotech Immobilier Tiaret',
      sector: catAnnBTP._id,
      shortDescription: 'Promotion immobilière de standing à Tiaret : appartements F3, F4 et locaux commerciaux avec finitions haut de gamme.',
      fullDescription: 'Promotech Immobilier réalise des résidences modernes sécurisées à Tiaret. Matériaux nobles, isolation phonique et thermique, ascenseurs et parking en sous-sol. Actes notariés et crédits bancaires acceptés.',
      phone: '0550 88 99 11',
      email: 'vente@promotech-tiaret.dz',
      address: 'Boulevard Emir Abdelkader, Tiaret',
      commune: 'Tiaret',
      logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80',
      coverImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      isFeatured: true,
      status: 'active',
    });

    // 13. Petites Annonces Locales
    console.log('[Seed] Création des petites annonces...');
    await PetiteAnnonce.create({
      title: 'Recrutement : Infographiste / Community Manager expérimenté',
      category: catPetiteEmploi._id,
      type: 'offre',
      description: 'Agence de communication à Tiaret recherche un infographiste dynamique maîtrisant Photoshop, Illustrator et la gestion de contenu pour les réseaux sociaux. Salaire motivant selon compétences.',
      priceDisplay: 'Selon profil / Expérience',
      commune: 'Tiaret',
      wilaya: 'Tiaret (14)',
      contactName: 'Responsable RH',
      contactPhone: '0550112233',
      contactEmail: 'recrutement.agence.tiaret@gmail.com',
      status: 'published',
      isFeatured: true,
    });

    await PetiteAnnonce.create({
      title: 'Vente : 5 PC de bureau HP Core i7 16Go RAM complets avec écrans 24 pouces',
      category: catPetiteMateriel._id,
      type: 'offre',
      description: 'Idéal pour bureau, cabinet d’architecture ou centre de formation. Matériel en parfait état de fonctionnement avec licences d’origine.',
      price: 65000,
      priceDisplay: '65 000 DZD / unité',
      isNegotiable: true,
      commune: 'Tiaret',
      wilaya: 'Tiaret (14)',
      contactName: 'Mourad Informatique',
      contactPhone: '0662998877',
      status: 'published',
    });

    await PetiteAnnonce.create({
      title: 'Recherche : Développeur web freelance pour création de site vitrine',
      category: catPetiteServices._id,
      type: 'demande',
      description: 'Entreprise de distribution à Tiaret recherche un freelance pour la création d’un site web vitrine avec formulaire de contact et présentation de catalogue.',
      priceDisplay: 'À débattre selon devis',
      commune: 'Tiaret',
      wilaya: 'Tiaret (14)',
      contactName: 'Sarl Sersou Distribution',
      contactPhone: '0770334455',
      status: 'pending',
    });

    // 14. Bannières Publicitaires (AdSlots)
    console.log('[Seed] Création des bannières publicitaires actives...');
    await AdSlot.create({
      title: 'Campagne Rentrée Formations B.C.A. 2026',
      slotKey: 'home_banner_top',
      advertiserName: 'B.C.A. Éducation',
      targetUrl: '/formations',
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      pricePaid: 25000,
      isActive: true,
    });

    await AdSlot.create({
      title: 'Espace Publicitaire Dédié aux Annonceurs Locaux',
      slotKey: 'home_banner_middle',
      advertiserName: 'Hôtel Rostom Tiaret',
      targetUrl: 'https://hotel-rostom.dz',
      imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1400&q=80',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      pricePaid: 18000,
      isActive: true,
    });

    // 15. Galerie Photo & Médias
    console.log('[Seed] Création de la galerie et albums...');
    const album1 = await Album.create({
      title: 'Remise des Attestations - Promotion Infographie & Web 2025',
      theme: 'formations',
      description: 'Cérémonie conviviale récompensant les lauréats de nos cursus en présence de leurs formateurs et partenaires.',
      coverImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80',
      eventDate: new Date('2025-12-20'),
      isFeatured: true,
      order: 1,
    });

    await MediaItem.create({
      album: album1._id,
      title: 'Remise du Certificat d’Excellence à la Major de Promotion',
      type: 'photo',
      url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80',
      caption: 'Félicitations aux 15 diplômés en conception visuelle et multimédia !',
    });

    await MediaItem.create({
      album: album1._id,
      title: 'Atelier Pratique de Design & Typographie en Salle Multimédia',
      type: 'photo',
      url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80',
      caption: 'Séance de travail intensif sur logiciel avec accompagnement individualisé.',
    });

    // 16. Témoignages
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

    await Testimonial.create({
      authorName: 'Sarah Benmoussa',
      roleOrCompany: 'Diplômée Full-Stack & Développeuse Web',
      type: 'stagiaire',
      formation: f2._id,
      content: 'Le cursus Full-Stack a complètement transformé ma carrière. On apprend sur des projets réels et on sort capable de créer une application complète. Merci à toute l’équipe !',
      rating: 5,
      isFeatured: true,
      isActive: true,
    });

    // 17. Partenaires / Logos
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

    await Partner.create({
      name: 'Université Ibn Khaldoun de Tiaret',
      logo: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=300&q=80',
      type: 'partenaire',
      order: 3,
      isActive: true,
    });

    // 18. Paramètres du Site (SiteSettings Singleton)
    console.log('[Seed] Initialisation des paramètres de base du centre...');
    await SiteSettings.create({
      siteName: 'B.C.A. - Centre de Formation & Communication',
      tagline: 'L’excellence en formation professionnelle et communication d’entreprise à Tiaret',
      homePhotos: {
        heroSlide1: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1920&q=80',
        heroSlide2: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1920&q=80',
        heroSlide3: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1920&q=80',
        ctaBanner: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80',
      },
      adPricing: {
        bannerHomeTop: '25 000 DA / mois',
        bannerHomeMiddle: '18 000 DA / mois',
        sponsoredArticle: '12 000 DA',
        advertiserPageAnnual: '35 000 DA / an',
      },
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
      seo: {
        defaultMetaTitle: 'B.C.A. | Centre de Formation, Communication & Portail Local à Tiaret',
        defaultMetaDescription: 'Formations professionnelles certifiantes, agence de communication média, annonces locales et actualités à Tiaret (Algérie).',
        keywords: ['formation tiaret', 'communication tiaret', 'centre formation tiaret', 'actualites tiaret', 'annonces tiaret'],
      },
    });

    console.log('===============================================================');
    console.log('[Seed Réussi] Base de données MongoDB Atlas peuplée avec succès !');
    console.log('--- COMPTES D’ACCÈS CRÉÉS ---');
    console.log('1. Super Administrateur (Accès Total) :');
    console.log(`   - Email        : ${process.env.INITIAL_ADMIN_EMAIL || 'admin@bca-tiaret.dz'}`);
    console.log(`   - Téléphone    : ${process.env.INITIAL_ADMIN_PHONE || '0550000000'}`);
    console.log(`   - Mot de passe : ${process.env.INITIAL_ADMIN_PASSWORD || 'AdminSecurePass2026!'}`);
    console.log('2. Responsable Pédagogique (Éditeur) :');
    console.log('   - Email        : editeur@bca-tiaret.dz');
    console.log('   - Téléphone    : 0551234567');
    console.log('   - Mot de passe : EditorPassword2026!');
    console.log('3. Chargée de Communication (Rédactrice) :');
    console.log('   - Email        : redactrice@bca-tiaret.dz');
    console.log('   - Téléphone    : 0552345678');
    console.log('   - Mot de passe : WriterPassword2026!');
    console.log('4. Formateur Web (Éditeur) :');
    console.log('   - Email        : formateur.web@bca-tiaret.dz');
    console.log('   - Téléphone    : 0553456789');
    console.log('   - Mot de passe : TrainerPass2026!');
    console.log('5. Formatrice Design (Éditeur) :');
    console.log('   - Email        : formatrice.design@bca-tiaret.dz');
    console.log('   - Téléphone    : 0554567890');
    console.log('   - Mot de passe : TrainerPass2026!');
    console.log('6. Stagiaire Démo (Rédacteur) :');
    console.log('   - Email        : stagiaire@bca-tiaret.dz');
    console.log('   - Téléphone    : 0555678901');
    console.log('   - Mot de passe : StudentPass2026!');
    console.log('===============================================================');

    process.exit(0);
  } catch (error) {
    console.error(`[Seed Erreur] : ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
