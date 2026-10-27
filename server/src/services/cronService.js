import cron from 'node-cron';
import { runBackup } from '../scripts/backup.js';

/**
 * Service de planification des tâches récurrentes de maintenance B.C.A.
 */
export const initCronJobs = () => {
  // 1. Sauvegarde automatique quotidienne à 02h00 du matin (heure algérienne / GMT+1)
  cron.schedule('0 2 * * *', async () => {
    console.log(`[Cron] Lancement de la sauvegarde automatique nocturne : ${new Date().toISOString()}`);
    try {
      const result = await runBackup();
      console.log(`[Cron] Sauvegarde nocturne réussie : ${result.fileName} (${result.sizeKB} Ko)`);
    } catch (err) {
      console.error('[Cron] Échec de la sauvegarde nocturne automatique :', err);
    }
  });

  console.log('[Cron] Planificateur de tâches actif (Sauvegarde MongoDB planifiée tous les jours à 02h00).');
};

export default { initCronJobs };
