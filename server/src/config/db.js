import mongoose from 'mongoose';

/**
 * Initialise et gère la connexion à la base de données MongoDB
 */
export const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      process.env.MONGO_URI ||
      'mongodb://127.0.0.1:27017/bca_db';

    const conn = await mongoose.connect(mongoUri, {
      autoIndex: process.env.NODE_ENV !== 'production', // Désactiver autoIndex en production pour les performances
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`[MongoDB] Connecté avec succès : ${conn.connection.host} / DB : ${conn.connection.name}`);

    // Écouteurs d'événements de connexion
    mongoose.connection.on('error', (err) => {
      console.error(`[MongoDB] Erreur de connexion : ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Déconnecté de la base de données. Tentative de reconnexion...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('[MongoDB] Reconnecté avec succès.');
    });

    return conn;
  } catch (error) {
    console.error(`[MongoDB] Erreur critique lors de la connexion initiale : ${error.message}`);
    process.exit(1);
  }
};

/**
 * Ferme proprement la connexion MongoDB lors de l'arrêt du serveur
 */
export const closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('[MongoDB] Connexion fermée proprement.');
  } catch (error) {
    console.error(`[MongoDB] Erreur lors de la fermeture : ${error.message}`);
  }
};
