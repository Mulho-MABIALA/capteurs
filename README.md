# Plateforme IoT Agricole

Plateforme complète pour la collecte, le stockage sécurisé et la visualisation des données de capteurs IoT agricoles.

## Caractéristiques principales

- **Backend Flask** avec API REST sécurisée
- **Frontend React.js** avec Tailwind CSS
- **Chiffrement AES-256** des données sensibles
- **Authentification JWT**
- **Communication MQTT et HTTPS** pour les capteurs
- **Base de données PostgreSQL**
- **Tableau de bord en temps réel**
- **Système d'alertes automatiques**

## Architecture

```
[Capteurs IoT]
    ↓
[Passerelle MQTT/HTTPS]
    ↓
[Backend Flask - Chiffrement AES]
    ↓
[Base de données PostgreSQL chiffrée]
    ↑
[Frontend React.js sécurisé - Auth JWT]
```

## Structure du projet

```
capteurs/
├── backend/              # Backend Flask
│   ├── app/
│   │   ├── models/       # Modèles de base de données
│   │   ├── routes/       # Routes API
│   │   ├── services/     # Services (MQTT, etc.)
│   │   └── utils/        # Utilitaires (chiffrement)
│   ├── config/           # Configuration
│   └── run.py            # Point d'entrée
├── frontend/             # Frontend React
│   ├── src/
│   │   ├── components/   # Composants réutilisables
│   │   ├── pages/        # Pages de l'application
│   │   ├── services/     # Services API
│   │   └── contexts/     # Contextes React
│   └── package.json
├── database/             # Scripts de base de données
└── README.md
```

## Installation

### Prérequis

- Python 3.9+
- Node.js 18+
- PostgreSQL 14+
- MQTT Broker (optionnel, ex: Mosquitto)

### 1. Installation de PostgreSQL

**Windows:**
1. Télécharger depuis https://www.postgresql.org/download/windows/
2. Installer et noter le mot de passe

**Linux:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

### 2. Configuration de la base de données

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE iot_platform;

# Quitter
\q
```

### 3. Installation du Backend

```bash
# Aller dans le dossier backend
cd backend

# Activer l'environnement virtuel (déjà créé)
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt

# Copier le fichier .env.example
copy .env.example .env   # Windows
cp .env.example .env     # Linux/Mac

# Éditer le fichier .env avec vos configurations
# Mettre à jour DATABASE_URL avec vos identifiants PostgreSQL
```

### 4. Installation du Frontend

```bash
# Aller dans le dossier frontend
cd frontend

# Installer les dépendances
npm install

# Copier le fichier .env.example
copy .env.example .env   # Windows
cp .env.example .env     # Linux/Mac
```

### 5. Installation d'un broker MQTT (optionnel)

**Windows:**
1. Télécharger Mosquitto depuis https://mosquitto.org/download/
2. Installer et démarrer le service

**Linux:**
```bash
sudo apt install mosquitto mosquitto-clients
sudo systemctl start mosquitto
sudo systemctl enable mosquitto
```

## Démarrage

### 1. Démarrer le Backend

```bash
cd backend
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

python run.py
```

Le backend sera accessible sur http://localhost:5000

### 2. Démarrer le Frontend

```bash
cd frontend
npm run dev
```

Le frontend sera accessible sur http://localhost:3000

## Utilisation

### Première connexion

1. Accéder à http://localhost:3000
2. Se connecter avec les identifiants par défaut:
   - **Username:** admin
   - **Password:** admin123

### Créer un nouveau compte

1. Cliquer sur "S'inscrire"
2. Remplir le formulaire
3. Se connecter avec les nouveaux identifiants

### Ajouter un capteur

1. Aller dans "Capteurs"
2. Cliquer sur "Ajouter un capteur"
3. Remplir les informations:
   - ID Capteur (unique)
   - Nom
   - Type (température, humidité, etc.)
   - Localisation
   - Statut

### Envoyer des données depuis un capteur

#### Via MQTT

```python
import paho.mqtt.client as mqtt
import json
import time

# Configuration
BROKER = "localhost"
PORT = 1883
TOPIC = "iot/sensors/data"

# Créer le client MQTT
client = mqtt.Client()
client.connect(BROKER, PORT, 60)

# Envoyer des données
data = {
    "sensor_id": "TEMP_001",
    "value": 25.5,
    "unit": "°C",
    "type": "temperature"
}

client.publish(TOPIC, json.dumps(data))
client.disconnect()
```

#### Via HTTPS

```python
import requests

url = "http://localhost:5000/api/sensor-data"
headers = {
    "Authorization": "Bearer YOUR_JWT_TOKEN",
    "Content-Type": "application/json"
}

data = {
    "sensor_id": "TEMP_001",
    "value": 25.5,
    "unit": "°C"
}

response = requests.post(url, json=data, headers=headers)
print(response.json())
```

## Configuration des alertes

Les alertes sont générées automatiquement lorsque les valeurs des capteurs dépassent les seuils définis dans le fichier [backend/app/services/mqtt_service.py](backend/app/services/mqtt_service.py:96):

```python
thresholds = {
    'temperature': {'high': 35, 'low': 10},
    'humidity': {'high': 80, 'low': 30},
    'soil_moisture': {'low': 20},
    'light': {'high': 10000}
}
```

Vous pouvez modifier ces seuils selon vos besoins.

## Sécurité

### Chiffrement des données

Toutes les données des capteurs sont chiffrées avec AES-256 avant d'être stockées dans la base de données. La clé de chiffrement est configurée dans le fichier `.env`.

### Authentification JWT

Toutes les requêtes API nécessitent un token JWT valide. Les tokens expirent après 1 heure par défaut.

### Communication sécurisée

En production, utilisez HTTPS pour toutes les communications et configurez TLS/SSL pour MQTT.

## API Endpoints

### Authentification
- `POST /api/auth/register` - Créer un compte
- `POST /api/auth/login` - Se connecter
- `GET /api/auth/me` - Obtenir l'utilisateur actuel

### Capteurs
- `GET /api/sensors` - Lister les capteurs
- `POST /api/sensors` - Créer un capteur
- `GET /api/sensors/:id` - Obtenir un capteur
- `PUT /api/sensors/:id` - Mettre à jour un capteur
- `DELETE /api/sensors/:id` - Supprimer un capteur

### Données de capteurs
- `GET /api/sensor-data` - Lister les données
- `POST /api/sensor-data` - Créer une donnée
- `GET /api/sensor-data/latest` - Dernières données
- `GET /api/sensor-data/stats/:id` - Statistiques d'un capteur

### Alertes
- `GET /api/alerts` - Lister les alertes
- `GET /api/alerts/:id` - Obtenir une alerte
- `PUT /api/alerts/:id/resolve` - Résoudre une alerte
- `DELETE /api/alerts/:id` - Supprimer une alerte
- `GET /api/alerts/summary` - Résumé des alertes

## Développement

### Technologies utilisées

**Backend:**
- Flask 3.0
- SQLAlchemy
- PostgreSQL
- PyCryptodome (AES-256)
- PyJWT
- Paho MQTT

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- Recharts
- Axios
- React Router

### Variables d'environnement

**Backend (.env):**
```
DATABASE_URL=postgresql://username:password@localhost:5432/iot_platform
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret-key
ENCRYPTION_KEY=your-32-byte-encryption-key
MQTT_BROKER_HOST=localhost
MQTT_BROKER_PORT=1883
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:5000/api
```

## Production

### Backend

```bash
# Utiliser Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 run:app
```

### Frontend

```bash
# Build de production
npm run build

# Servir avec un serveur web (nginx, apache, etc.)
```

### Configuration PostgreSQL pour la production

1. Créer un utilisateur dédié
2. Configurer les permissions
3. Activer SSL/TLS
4. Configurer les sauvegardes automatiques

## Dépannage

### Le backend ne démarre pas

- Vérifier que PostgreSQL est démarré
- Vérifier les identifiants dans le fichier `.env`
- Vérifier que le port 5000 n'est pas utilisé

### Le frontend ne se connecte pas au backend

- Vérifier que le backend est démarré
- Vérifier l'URL dans le fichier `.env` du frontend
- Vérifier CORS dans le backend

### Les données MQTT ne sont pas reçues

- Vérifier que Mosquitto est démarré
- Vérifier la configuration MQTT dans le `.env`
- Vérifier les topics MQTT

## Contribution

Ce projet a été créé pour répondre aux besoins spécifiques du cahier des charges fourni.

## Licence

Projet éducatif - Tous droits réservés
