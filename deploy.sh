#!/bin/bash
# ==============================================================================
# SCRIPT DE DÉPLOIEMENT AUTOMATISÉ EN PRODUCTION - B.C.A. TIARET
# ==============================================================================

set -e # Arrêter le script immédiatement en cas d'erreur

echo "=========================================================="
echo "🚀 [B.C.A.] Début du déploiement en production..."
echo "Date : $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================================="

APP_DIR="/var/www/bca"

cd "$APP_DIR"

# 1. Sauvegarde préventive de la base de données avant mise à jour
echo "📦 [1/6] Sauvegarde de précaution MongoDB..."
cd server
npm run backup || echo "⚠️ Sauvegarde ignorée ou non critique."
cd ..

# 2. Récupération des dernières modifications Git
echo "📥 [2/6] Synchronisation du dépôt Git..."
git pull origin main

# 3. Installation des dépendances et mise à jour du backend
echo "⚙️ [3/6] Préparation du backend Express..."
cd server
npm install --omit=dev
cd ..

# 4. Installation des dépendances et compilation du frontend React
echo "🎨 [4/6] Compilation du frontend React (Vite)..."
cd client
npm install
npm run build
cd ..

# 5. Redémarrage sans coupure du backend avec PM2 (Zero-Downtime)
echo "🔄 [5/6] Rechargement des processus Node.js PM2..."
pm2 reload ecosystem.config.cjs --env production || pm2 start ecosystem.config.cjs --env production
pm2 save

# 6. Test et rechargement de Nginx
echo "🌐 [6/6] Validation et rechargement Nginx..."
sudo nginx -t
sudo systemctl reload nginx

echo "=========================================================="
echo "✅ [B.C.A.] Déploiement terminé avec succès !"
echo "Site web accessible sur : https://bca-tiaret.dz"
echo "API Backend opérationnelle sur : https://bca-tiaret.dz/api/health"
echo "=========================================================="
