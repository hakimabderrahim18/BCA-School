import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const BACKUP_DIR = path.join(process.cwd(), 'backups');

/**
 * Script de restauration de la base de données MongoDB B.C.A.
 * Usage :
 *   npm run restore                     -> Restaure la sauvegarde la plus récente
 *   npm run restore -- --file=nom.zip   -> Restaure un fichier d'archive spécifique
 */
export async function runRestore(targetFileName) {
  if (!fs.existsSync(BACKUP_DIR)) {
    throw new Error(`Le dossier de sauvegardes "${BACKUP_DIR}" n'existe pas.`);
  }

  // Détermination de l'archive à restaurer
  let fileToRestore = targetFileName;

  if (!fileToRestore) {
    const backupFiles = fs
      .readdirSync(BACKUP_DIR)
      .filter((f) => f.startsWith('bca_backup_') && f.endsWith('.zip'))
      .map((f) => ({
        name: f,
        time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time);

    if (backupFiles.length === 0) {
      throw new Error("Aucune sauvegarde trouvée dans le dossier backups/.");
    }

    fileToRestore = backupFiles[0].name;
  }

  const archivePath = path.join(BACKUP_DIR, fileToRestore);
  if (!fs.existsSync(archivePath)) {
    throw new Error(`Le fichier d'archive spécifié "${archivePath}" est introuvable.`);
  }

  console.log(`[Restore] Début de la restauration à partir de : ${fileToRestore}...`);

  const tempExtractDir = path.join(BACKUP_DIR, `.temp_restore_${Date.now()}`);
  fs.mkdirSync(tempExtractDir, { recursive: true });

  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bca_database';

  let isLocalConnection = false;
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(mongoUri);
    isLocalConnection = true;
  }

  try {
    // Extraction de l'archive ZIP
    console.log('[Restore] Extraction de l’archive...');
    try {
      // Tentative avec l'utilitaire tar présent sur Windows 10/11 et Linux
      execSync(`tar -xf "${archivePath}" -C "${tempExtractDir}"`);
    } catch (tarErr) {
      // Fallback PowerShell sur Windows
      execSync(
        `powershell -Command "Expand-Archive -Path '${archivePath}' -DestinationPath '${tempExtractDir}' -Force"`
      );
    }

    // Lecture du manifeste
    const manifestPath = path.join(tempExtractDir, 'manifest.json');
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      console.log(`[Restore] Manifeste validé : Sauvegarde du ${manifest.createdAt} (${manifest.system})`);
    }

    const db = mongoose.connection.db;
    const extractedFiles = fs.readdirSync(tempExtractDir).filter((f) => f.endsWith('.json') && f !== 'manifest.json');

    console.log(`[Restore] ${extractedFiles.length} collections détectées pour restauration.`);

    for (const jsonFile of extractedFiles) {
      const colName = jsonFile.replace('.json', '');
      const rawData = fs.readFileSync(path.join(tempExtractDir, jsonFile), 'utf8');
      const documents = JSON.parse(rawData);

      const collection = db.collection(colName);

      // Vider la collection avant restauration pour éviter les doublons d'index uniques
      await collection.deleteMany({});

      if (documents.length > 0) {
        // Transformation des ObjectId et dates si nécessaire
        const cleanedDocs = documents.map((doc) => {
          if (doc._id && typeof doc._id === 'string' && doc._id.length === 24) {
            try {
              doc._id = new mongoose.Types.ObjectId(doc._id);
            } catch (e) {}
          }
          return doc;
        });

        await collection.insertMany(cleanedDocs);
      }

      console.log(`[Restore] Collection restaurée : ${colName} (${documents.length} documents)`);
    }

    console.log('[Restore] Restauration MongoDB effectuée avec succès !');
    return { success: true, restoredFile: fileToRestore };
  } catch (error) {
    console.error('[Restore] Erreur critique lors de la restauration :', error);
    throw error;
  } finally {
    // Nettoyage du dossier temporaire
    if (fs.existsSync(tempExtractDir)) {
      try {
        fs.rmSync(tempExtractDir, { recursive: true, force: true });
      } catch (e) {}
    }

    if (isLocalConnection) {
      await mongoose.disconnect();
    }
  }
}

// Exécution directe
if (process.argv[1] && process.argv[1].endsWith('restore.js')) {
  const fileArg = process.argv.find((arg) => arg.startsWith('--file='));
  const fileName = fileArg ? fileArg.split('=')[1] : null;

  runRestore(fileName)
    .then(() => {
      console.log('[Restore] Processus terminé.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Restore] Échec de la procédure :', err.message);
      process.exit(1);
    });
}
