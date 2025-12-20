# Guide de démarrage rapide

## Installation rapide (5 minutes)

### 1. Installer PostgreSQL

**Windows:**
- Télécharger et installer depuis https://www.postgresql.org/download/windows/
- Créer la base de données:
```sql
CREATE DATABASE iot_platform;
```

**Linux:**
```bash
sudo apt install postgresql
sudo -u postgres psql -c "CREATE DATABASE iot_platform;"
```

### 2. Configurer le Backend

```bash
cd backend

# Activer l'environnement virtuel
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Installer les dépendances
pip install -r requirements.txt

# Créer le fichier .env
copy .env.example .env  # Windows
cp .env.example .env    # Linux/Mac

# Modifier DATABASE_URL dans .env avec vos identifiants PostgreSQL
# Exemple: DATABASE_URL=postgresql://postgres:votreMotDePasse@localhost:5432/iot_platform
```

### 3. Configurer le Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Créer le fichier .env
copy .env.example .env  # Windows
cp .env.example .env    # Linux/Mac
```

### 4. Démarrer l'application

**Terminal 1 - Backend:**
```bash
cd backend
venv\Scripts\activate  # Windows
python run.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Accéder à l'application

Ouvrir http://localhost:3000 dans votre navigateur

**Identifiants par défaut:**
- Username: `admin`
- Password: `admin123`

## Test avec des capteurs simulés

### Option 1: MQTT (nécessite Mosquitto)

**Installer Mosquitto:**
- Windows: https://mosquitto.org/download/
- Linux: `sudo apt install mosquitto`

**Lancer le simulateur:**
```bash
cd backend
python test_sensor_simulator.py
```

### Option 2: HTTPS (pas besoin de MQTT)

```bash
cd backend
python test_https_sensor.py
```

## Utilisation de base

1. **Voir le tableau de bord** - Affiche les dernières mesures et graphiques
2. **Gérer les capteurs** - Ajouter/modifier/supprimer des capteurs
3. **Voir les alertes** - Consulter et résoudre les alertes

## Structure des données MQTT

Format JSON pour envoyer des données via MQTT:

```json
{
  "sensor_id": "TEMP_001",
  "value": 25.5,
  "unit": "°C",
  "type": "temperature"
}
```

Topic: `iot/sensors/data`

## Endpoints API principaux

- `POST /api/auth/login` - Connexion
- `GET /api/sensors` - Liste des capteurs
- `POST /api/sensor-data` - Envoyer des données
- `GET /api/sensor-data/latest` - Dernières données
- `GET /api/alerts` - Liste des alertes

## Dépannage rapide

**Backend ne démarre pas:**
- Vérifier que PostgreSQL est démarré
- Vérifier DATABASE_URL dans .env

**Frontend ne se connecte pas:**
- Vérifier que le backend tourne sur le port 5000
- Vérifier la console du navigateur pour les erreurs

**Données MQTT non reçues:**
- Vérifier que Mosquitto est démarré
- Vérifier MQTT_BROKER_HOST dans .env

## Prochaines étapes

Consultez le [README.md](README.md) pour:
- Configuration avancée
- Déploiement en production
- Documentation complète de l'API
- Configuration des alertes personnalisées
