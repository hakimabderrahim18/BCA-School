import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import mongoose from 'mongoose';
import archiver from 'archiver';
import dotenv from 'dotenv';

dotenv.config();

const BACKUP_DIR = path.join(process.cwd(), 'backups');
const MAX_BACKUP_RETENTION = 7; // Conserver les 7 dernières sauvegardes quotidiennes

/**
 * Script de sauvegarde complète de la base de données MongoDB B.C.A.
 * Sauvegarde toutes les collections au format JSON compressé dans une archive ZIP/Tar
 */
export async function runBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupFileName = `bca_backup_${timestamp}.zip`;

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const archivePath = path.join(BACKUP_DIR, backupFileName);

  console.log(`[Backup] Début de la sauvegarde MongoDB : ${backupFileName}...`);

  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bca_database';

  let isLocalConnection = false;
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(mongoUri);
    isLocalConnection = true;
  }

  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    const output = fs.createWriteStream(archivePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    const archivePromise = new Promise((resolve, reject) => {
      output.on('close', resolve);
      archive.on('error', reject);
    });

    archive.pipe(output);

    // Extraction et archivage de chaque collection
    for (const colInfo of collections) {
      const colName = colInfo.name;
      // Ignorer les collections système MongoDB
      if (colName.startsWith('system.')) continue;

      const documents = await db.collection(colName).find({}).toArray();
      const jsonData = JSON.stringify(documents, null, 2);

      archive.append(jsonData, { name: `${colName}.json` });
      console.log(`[Backup] Collection archivée : ${colName} (${documents.length} documents)`);
    }

    // Ajout d'un fichier manifeste de métadonnées
    const manifest = {
      createdAt: new Date().toISOString(),
      database: db.databaseName,
      totalCollections: collections.length,
      version: '1.0.0',
      system: 'B.C.A. Tiaret Platform',
    };
    archive.append(JSON.stringify(manifest, null, 2), { name: 'manifest.json' });

    await archive.finalize();
    await archivePromise;

    const stats = fs.statSync(archivePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`[Backup] Succès ! Archive créée : ${archivePath} (${sizeKB} Ko)`);

    // Rotation des anciennes sauvegardes (conserver uniquement les 7 plus récentes)
    rotateBackups();

    return {
      success: true,
      fileName: backupFileName,
      path: archivePath,
      sizeKB,
    };
  } catch (error) {
    console.error('[Backup] Erreur lors de la sauvegarde MongoDB:', error);
    throw error;
  } finally {
    if (isLocalConnection) {
      await mongoose.disconnect();
    }
  }
}

/**
 * Rotation automatique des sauvegardes
 */
function rotateBackups() {
  try {
    const files = fs
      .readdirSync(BACKUP_DIR)
      .filter((file) => file.startsWith('bca_backup_') && file.endsWith('.zip'))
      .map((file) => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        time: fs.statSync(path.join(BACKUP_DIR, file)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length > MAX_BACKUP_RETENTION) {
      const filesToDelete = files.slice(MAX_BACKUP_RETENTION);
      for (const file of filesToDelete) {
        fs.unlinkSync(file.path);
        console.log(`[Backup] Rotation : ancienne sauvegarde supprimée -> ${file.name}`);
      }
    }
  } catch (err) {
    console.warn('[Backup] Avertissement lors de la rotation des archives:', err.message);
  }
}

// Exécution directe en ligne de commande (ex: npm run backup)
if (process.argv[1] && process.argv[1].endsWith('backup.js')) {
  runBackup()
    .then(() => {
      console.log('[Backup] Opération terminée.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Backup] Échec :', err);
      process.exit(1);
    });
}
