/**
 * Configuration PM2 pour le déploiement en production de B.C.A.
 * Permet l'exécution en cluster, le redémarrage automatique en cas de crash
 * et la rotation des journaux d'erreurs sans interruption de service.
 */
module.exports = {
  apps: [
    {
      name: 'bca-server',
      script: './server/src/server.js',
      instances: 2, // 2 processus en cluster pour équilibrer la charge
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
      min_uptime: '10s',
      max_restarts: 10,
    },
  ],
};
