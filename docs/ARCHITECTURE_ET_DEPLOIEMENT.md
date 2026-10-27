# Architecture Technique & Guide de Déploiement en Production
## Plateforme Web B.C.A. (Tiaret, Algérie)

Ce document fournit la documentation technique complète pour déployer, configurer et administrer l'infrastructure de la plateforme web **B.C.A.** sur un serveur VPS (Virtual Private Server) fonctionnant sous Linux (Ubuntu 22.04 LTS ou Debian 12).

---

### 1. Vue d'Ensemble de l'Architecture

La plateforme adopte une architecture découplée haute performance :
- **Frontend SPA** : React 18, Vite 6, Tailwind CSS 3, React Router v6, react-i18next (support RTL et arabe), react-helmet-async (SEO).
- **Backend API RESTful** : Node.js (ES Modules), Express.js (MVC), Mongoose ODM, JWT (Access Token 15 min + Refresh Token HTTP-Only 7 jours), Sharp (compression automatique des visuels au format WebP), Nodemailer, Node-cron.
- **Base de données** : MongoDB 7.x avec indexation géographique, textuelle et temporelle.
- **Serveur Web & Reverse Proxy** : Nginx avec terminaison TLS/SSL (Certbot Let's Encrypt), compression Gzip et cache HTTP.
- **Gestionnaire de processus** : PM2 en mode cluster (2 instances CPU, redémarrage automatique en cas de crash).

---

### 2. Prérequis Serveur (VPS Recommandé)

- **Système d'exploitation** : Ubuntu 22.04 LTS ou 24.04 LTS (ou Debian 12).
- **Ressources minimales** : 2 CPU vCores, 2 Go de RAM, 25 Go de stockage SSD/NVMe.
- **Nom de domaine** : Un domaine pointant vers l'adresse IP du VPS (ex: `bca-tiaret.dz` et `www.bca-tiaret.dz`).

---

### 3. Installation des Paquets Système sur le VPS

Connectez-vous en SSH à votre serveur :
```bash
ssh root@votre-ip-serveur
```

#### 3.1. Mise à jour du système & utilitaires de base
```bash
apt update && apt upgrade -y
apt install -y curl wget git build-essential ufw fail2ban certbot python3-certbot-nginx
```

#### 3.2. Configuration du Pare-Feu (UFW)
```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable
```

#### 3.3. Installation de Node.js 20 LTS (NodeSource)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2
node -v # Doit afficher v20.x.x
npm -v
```

#### 3.4. Installation de MongoDB Community Edition 7.x
```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt update
apt install -y mongodb-org
systemctl start mongod
systemctl enable mongod
systemctl status mongod
```

#### 3.5. Installation de Nginx
```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

---

### 4. Déploiement de l'Application

#### 4.1. Clonage du projet
```bash
mkdir -p /var/www/bca
cd /var/www/bca
git clone <URL_DU_DEPOT_GIT> .
```

#### 4.2. Configuration des Variables d'Environnement

Créez le fichier d'environnement du serveur :
```bash
cp server/.env.example server/.env
nano server/.env
```
Renseignez les variables de production :
- `NODE_ENV=production`
- `PORT=5000`
- `CLIENT_URL=https://bca-tiaret.dz`
- `MONGO_URI=mongodb://127.0.0.1:27017/bca_production`
- `JWT_ACCESS_SECRET=<Générez_une_clé_secrète_de_64_caractères>`
- `JWT_REFRESH_SECRET=<Générez_une_deuxième_clé_secrète>`
- `SMTP_USER` et `SMTP_PASS` (identifiants SMTP pour les notifications d'inscriptions et de devis)

Créez le fichier d'environnement du client :
```bash
cp client/.env.example client/.env
nano client/.env
```
Renseignez :
- `VITE_API_BASE_URL=https://bca-tiaret.dz/api`
- `VITE_STORAGE_URL=https://bca-tiaret.dz/uploads`
- `VITE_SITE_URL=https://bca-tiaret.dz`

#### 4.3. Compilation et Initialisation de la Base de Données
```bash
# Installation des dépendances Backend
cd /var/www/bca/server
npm install --omit=dev

# Injection des données initiales de démonstration et création du compte Super Admin
npm run seed

# Installation et compilation du Frontend
cd /var/www/bca/client
npm install
npm run build
```

---

### 5. Configuration de Nginx et Certificat SSL Gratuit

#### 5.1. Déploiement de la configuration Nginx
```bash
cp /var/www/bca/nginx/bca-tiaret.conf /etc/nginx/sites-available/bca-tiaret.conf
ln -s /etc/nginx/sites-available/bca-tiaret.conf /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

#### 5.2. Génération du Certificat SSL Let's Encrypt
```bash
certbot --nginx -d bca-tiaret.dz -d www.bca-tiaret.dz --non-interactive --agree-tos -m contact@bca-tiaret.dz
```
*Le renouvellement automatique des certificats SSL est géré par le timer système de Certbot.*

---

### 6. Démarrage et Gestion des Processus avec PM2

```bash
cd /var/www/bca
mkdir -p logs
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup # Exécutez la commande générée à l'écran pour activer le démarrage automatique au boot
```

Commandes utiles PM2 :
```bash
pm2 status                # Voir l'état des instances Node.js
pm2 logs bca-server       # Voir les logs en direct
pm2 reload bca-server     # Recharger sans coupure (Zero Downtime)
pm2 restart bca-server    # Redémarrer
```

---

### 7. Sauvegardes Automatiques et Restauration

- **Sauvegarde nocturne automatique** : Planifiée tous les jours à **02h00 du matin** via le service `cronService.js`.
- **Emplacement des archives** : `/var/www/bca/server/backups/bca_backup_YYYY-MM-DD_HH-mm-ss.zip`.
- **Rétention** : Les 7 sauvegardes les plus récentes sont conservées automatiquement.

#### Sauvegarde manuelle immédiate :
```bash
cd /var/www/bca/server
npm run backup
```

#### Restauration complète de la base de données :
```bash
cd /var/www/bca/server
npm run restore                       # Restaure la sauvegarde la plus récente
npm run restore -- --file=nom_archive.zip # Restaure une sauvegarde précise
```

---

### 8. Mises à Jour Futures (En 1 Seule Ligne)

Pour déployer les futures évolutions du code, rendez le script exécutable et lancez-le :
```bash
chmod +x /var/www/bca/deploy.sh
/var/www/bca/deploy.sh
```
Ce script prend en charge automatiquement :
1. La sauvegarde de précaution de la base MongoDB
2. Le `git pull` des dernières modifications
3. L'installation des dépendances
4. La recompilation Vite
5. Le rechargement sans coupure PM2
6. Le rechargement Nginx
