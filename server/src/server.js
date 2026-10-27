import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB, closeDB } from './config/db.js';
import { verifyEmailConnection } from './config/nodemailer.js';
import { initCronJobs } from './services/cronService.js';

const PORT = process.env.PORT || 5000;

// Démarrage du serveur et des services
const startServer = async () => {
  try {
    // 1. Connexion à la base de données MongoDB
    await connectDB();

    // 2. Vérification de la configuration d'envoi d'e-mails
    await verifyEmailConnection();

    // 3. Initialisation du planificateur de tâches cron (sauvegardes nocturnes)
    initCronJobs();

    // 4. Démarrage de l'écoute sur le port configuré
    const server = app.listen(PORT, () => {
      console.log('====================================================');
      console.log(`[B.C.A. Backend] Serveur démarré avec succès !`);
      console.log(`[Environnement] : ${process.env.NODE_ENV || 'development'}`);
      console.log(`[URL API]       : http://localhost:${PORT}/api`);
      console.log(`[Health Check]  : http://localhost:${PORT}/api/health`);
      console.log('====================================================');
    });

    // Gestion de l'arrêt propre (Graceful Shutdown)
    const gracefulShutdown = async (signal) => {
      console.log(`\n[Serveur] Signal ${signal} reçu. Fermeture progressive des connexions...`);
      server.close(async () => {
        console.log('[Serveur] Serveur HTTP arrêté.');
        await closeDB();
        process.exit(0);
      });

      // Forcer l'arrêt après 10 secondes si des opérations restent bloquées
      setTimeout(() => {
        console.error('[Serveur] Fermeture forcée après délai de timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error(`[Serveur] Erreur fatale au démarrage : ${error.message}`);
    process.exit(1);
  }
};

startServer();
