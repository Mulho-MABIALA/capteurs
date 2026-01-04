# Guide d'Installation - Projet IoT Agricole

Bienvenue! Ce guide vous explique comment installer et démarrer le projet étape par étape.

## Table des matières

1. [Prérequis](#prérequis)
2. [Installation de la base de données](#1-installation-de-la-base-de-données)
3. [Installation du backend](#2-installation-du-backend)
4. [Installation du frontend](#3-installation-du-frontend)
5. [Premier démarrage](#4-premier-démarrage)
6. [Tests et validation](#5-tests-et-validation)
7. [Dépannage](#dépannage)

---

## Prérequis

Avant de commencer, assurez-vous d'avoir installé les logiciels suivants sur votre ordinateur:

### Logiciels requis

1. **Python 3.8+**
   - Téléchargez: https://www.python.org/downloads/
   - Lors de l'installation, cochez "Add Python to PATH"
   - Vérifiez l'installation: `python --version`

2. **Node.js 16+** et **npm**
   - Téléchargez: https://nodejs.org/ (version LTS recommandée)
   - Vérifiez l'installation: `node --version` et `npm --version`

3. **PostgreSQL 12+**
   - **Windows**: https://www.postgresql.org/download/windows/
   - **Mac**: https://postgresapp.com/ ou `brew install postgresql`
   - **Linux**: `sudo apt-get install postgresql postgresql-contrib`
   - Vérifiez l'installation: `psql --version`

4. **Git** (si vous clonez depuis un dépôt)
   - Téléchargez: https://git-scm.com/downloads

### Éditeur de code (optionnel mais recommandé)

- **VS Code**: https://code.visualstudio.com/
- **PyCharm**: https://www.jetbrains.com/pycharm/

---

## 1. Installation de la base de données

### Étape 1.1: Démarrer PostgreSQL

**Windows:**
```bash
# PostgreSQL devrait démarrer automatiquement après installation
# Sinon, cherchez "PostgreSQL" dans les services Windows
```

**Mac/Linux:**
```bash
# Démarrer PostgreSQL
sudo service postgresql start
# ou sur Mac avec Homebrew:
brew services start postgresql
```

### Étape 1.2: Créer la base de données

```bash
# Se connecter à PostgreSQL (le mot de passe par défaut est souvent 'postgres')
psql -U postgres

# Dans psql, exécuter:
CREATE DATABASE iot_agriculture;
CREATE USER iot_user WITH PASSWORD 'votre_mot_de_passe_securise';
GRANT ALL PRIVILEGES ON DATABASE iot_agriculture TO iot_user;
\q
```

### Étape 1.3: Tester la connexion

```bash
psql -U iot_user -d iot_agriculture
# Si vous voyez le prompt psql, c'est bon!
\q
```

---

## 2. Installation du backend

### Étape 2.1: Créer l'environnement virtuel Python

```bash
# Aller dans le dossier backend
cd backend

# Créer l'environnement virtuel
python -m venv venv

# Activer l'environnement virtuel
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Vous devriez voir (venv) au début de votre ligne de commande
```

### Étape 2.2: Installer les dépendances Python

```bash
# S'assurer que pip est à jour
python -m pip install --upgrade pip

# Installer toutes les dépendances
pip install -r requirements.txt
```

**Si requirements.txt n'existe pas**, installez manuellement:
```bash
pip install flask flask-cors flask-sqlalchemy flask-jwt-extended psycopg2-binary pycryptodome bcrypt paho-mqtt python-dotenv
```

### Étape 2.3: Configurer les variables d'environnement

Créez un fichier `.env` dans le dossier `backend/`:

```bash
# Créer le fichier (Windows)
type nul > .env
# ou Mac/Linux
touch .env
```

Ouvrez `.env` et ajoutez:

```env
# Configuration de la base de données
DATABASE_URL=postgresql://iot_user:votre_mot_de_passe_securise@localhost/iot_agriculture

# Clé secrète pour JWT (générez-en une unique!)
SECRET_KEY=votre_cle_secrete_tres_longue_et_aleatoire

# Clé de chiffrement AES-256 (32 caractères exactement)
ENCRYPTION_KEY=votre_cle_de_32_caracteres_!!!!

# Configuration Flask
FLASK_ENV=development
FLASK_DEBUG=True

# Configuration MQTT
MQTT_BROKER_HOST=localhost
MQTT_BROKER_PORT=1883
MQTT_TOPIC=agriculture/sensors/#
```

**Important**: Remplacez les valeurs par vos propres clés sécurisées!

### Étape 2.4: Initialiser la base de données

```bash
# Toujours dans le dossier backend avec venv activé
python run.py
```

Au premier lancement, Flask va:
- Créer automatiquement toutes les tables nécessaires
- Créer un compte administrateur par défaut (admin/admin123)

Arrêtez le serveur avec `Ctrl+C` pour l'instant.

---

## 3. Installation du frontend

### Étape 3.1: Installer les dépendances Node.js

```bash
# Ouvrir un NOUVEAU terminal (gardez le backend ouvert)
cd frontend

# Installer toutes les dépendances npm
npm install
```

**Note**: Cette étape peut prendre quelques minutes.

### Étape 3.2: Configurer l'API URL

Créez un fichier `.env` dans le dossier `frontend/`:

```bash
# Créer le fichier
# Windows:
type nul > .env
# Mac/Linux:
touch .env
```

Ouvrez `.env` et ajoutez:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 4. Premier démarrage

### Étape 4.1: Démarrer le backend

```bash
# Terminal 1 - Dans le dossier backend avec venv activé
cd backend
venv\Scripts\activate  # Windows
# ou: source venv/bin/activate  # Mac/Linux

python run.py
```

Vous devriez voir:
```
 * Running on http://127.0.0.1:5000
 * Running on http://0.0.0.0:5000
```

### Étape 4.2: Démarrer le frontend

```bash
# Terminal 2 - Dans le dossier frontend
cd frontend
npm run dev
```

Vous devriez voir:
```
VITE ready in XXX ms

➜  Local:   http://localhost:5173/
```

### Étape 4.3: Accéder à l'application

1. Ouvrez votre navigateur
2. Allez sur: **http://localhost:5173**
3. Connectez-vous avec:
   - **Username**: `admin`
   - **Mot de passe**: `admin123`

---

## 5. Tests et validation

### Étape 5.1: Tester la connexion

1. Sur la page de login, entrez `admin` / `admin123`
2. Vous devriez être redirigé vers le **Dashboard**
3. Le dashboard affiche "Aucune donnée disponible" (c'est normal!)

### Étape 5.2: Ajouter un capteur

1. Cliquez sur **"Capteurs"** dans le menu
2. Cliquez sur **"Ajouter un Capteur"**
3. Remplissez:
   - **Nom**: Capteur Test
   - **Type**: temperature
   - **Localisation**: Serre 1
   - **Sensor ID**: TEMP_TEST_001
4. Cliquez sur **"Ajouter"**

### Étape 5.3: Simuler des données (optionnel)

Pour envoyer des données de test via MQTT:

```bash
# Terminal 3 - Dans le dossier backend
cd backend
venv\Scripts\activate  # Windows
python test_sensor_simulator.py
```

Le simulateur va:
- Envoyer des données toutes les 5 secondes
- Simuler 4 types de capteurs (température, humidité, sol, luminosité)
- Générer des alertes si les seuils sont dépassés

**Alternative - Test via HTTPS:**
```bash
python test_https_sensor.py
```

### Étape 5.4: Vérifier les données

1. Retournez sur le **Dashboard** (http://localhost:5173)
2. Vous devriez voir:
   - Des cartes avec les statistiques
   - Des graphiques avec les données en temps réel
   - Des alertes dans l'onglet "Alertes"

---

## Dépannage

### Problème: "ModuleNotFoundError" avec Python

**Solution:**
```bash
# Vérifiez que l'environnement virtuel est activé
# Vous devez voir (venv) au début de votre ligne de commande

# Réinstallez les dépendances
pip install -r requirements.txt
```

### Problème: "Connection refused" PostgreSQL

**Solution:**
```bash
# Vérifiez que PostgreSQL est démarré
# Windows: Vérifiez les services
# Mac/Linux:
sudo service postgresql status

# Vérifiez vos identifiants dans backend/.env
DATABASE_URL=postgresql://iot_user:mot_de_passe@localhost/iot_agriculture
```

### Problème: "Port 5000 already in use"

**Solution:**
```bash
# Windows - Trouver et tuer le processus
netstat -ano | findstr :5000
taskkill /PID <numéro_du_PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### Problème: Frontend ne se connecte pas au backend

**Solution:**
1. Vérifiez que le backend tourne sur http://localhost:5000
2. Vérifiez le fichier `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
3. Redémarrez le frontend: `npm run dev`

### Problème: "npm install" échoue

**Solution:**
```bash
# Nettoyer le cache npm
npm cache clean --force

# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
```

### Problème: Les alertes ne s'affichent pas

**Solution:**
1. Vérifiez que le simulateur envoie bien des données:
   ```bash
   python test_sensor_simulator.py
   ```
2. Vérifiez dans les logs du backend que les données sont reçues
3. Les alertes ne se déclenchent que si les valeurs dépassent les seuils configurés

### Problème: "Invalid encryption key"

**Solution:**
Votre clé de chiffrement dans `backend/.env` doit faire exactement 32 caractères:
```env
ENCRYPTION_KEY=12345678901234567890123456789012
```

---

## Commandes de référence rapide

### Backend
```bash
# Démarrer le backend
cd backend
venv\Scripts\activate  # Windows
python run.py

# Lancer le simulateur MQTT
python test_sensor_simulator.py

# Lancer le test HTTPS
python test_https_sensor.py
```

### Frontend
```bash
# Démarrer le frontend
cd frontend
npm run dev

# Builder pour production
npm run build
```

### Base de données
```bash
# Se connecter à la base
psql -U iot_user -d iot_agriculture

# Voir les tables
\dt

# Voir les données d'une table
SELECT * FROM sensors;
```

---

## Prochaines étapes

Maintenant que tout fonctionne, vous pouvez:

1. **Changer le mot de passe admin**
   - Allez dans l'interface
   - Créez un nouveau compte admin avec un mot de passe sécurisé

2. **Ajouter de vrais capteurs**
   - Configurez vos capteurs IoT pour envoyer des données via MQTT ou HTTPS
   - Consultez la documentation API dans `PROJET_COMPLET.md`

3. **Personnaliser les seuils d'alerte**
   - Modifiez `backend/app/services/mqtt_service.py`
   - Ajustez les valeurs dans la fonction `check_thresholds_and_create_alerts()`

4. **Explorer le code**
   - Backend: `backend/app/`
   - Frontend: `frontend/src/`
   - Documentation: `PROJET_COMPLET.md`

---

## Besoin d'aide?

- **Documentation complète**: Consultez [PROJET_COMPLET.md](PROJET_COMPLET.md)
- **Guide rapide**: Consultez [QUICKSTART.md](QUICKSTART.md)
- **Schéma de base de données**: Consultez [database/README.md](database/README.md)

---

## Résumé de l'installation

1. Installer PostgreSQL et créer la base de données
2. Installer Python et les dépendances du backend
3. Configurer le fichier `.env` du backend
4. Installer Node.js et les dépendances du frontend
5. Configurer le fichier `.env` du frontend
6. Démarrer le backend: `python run.py`
7. Démarrer le frontend: `npm run dev`
8. Se connecter: http://localhost:5173 (admin/admin123)

Bon développement!
