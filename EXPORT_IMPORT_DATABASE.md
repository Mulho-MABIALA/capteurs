# Guide d'Export et Import de la Base de Données PostgreSQL

Ce guide explique comment exporter votre base de données PostgreSQL complète (avec toutes les tables et données) et comment l'importer sur un autre ordinateur.

## Table des matières

1. [Exporter la base de données](#1-exporter-la-base-de-données)
2. [Importer la base de données](#2-importer-la-base-de-données)
3. [Export/Import via scripts](#3-scripts-automatisés)
4. [Dépannage](#dépannage)

---

## 1. Exporter la base de données

### Option A: Export complet (recommandé)

Cette méthode exporte **TOUT** : structure + données.

```bash
# Format: pg_dump -U utilisateur -d nom_base > fichier_export.sql
pg_dump -U iot_user -d iot_agriculture > export_database.sql

# Ou avec l'utilisateur postgres:
pg_dump -U postgres -d iot_agriculture > export_database.sql
```

**Vous serez invité à entrer le mot de passe.**

Le fichier `export_database.sql` contiendra:
- Toutes les tables (users, sensors, sensor_data, alerts)
- Toutes les données
- Les index et contraintes

### Option B: Export avec compression (pour fichiers volumineux)

```bash
# Export compressé (.gz)
pg_dump -U iot_user -d iot_agriculture | gzip > export_database.sql.gz

# Export en format personnalisé PostgreSQL (.dump)
pg_dump -U iot_user -d iot_agriculture -F c -f export_database.dump
```

### Option C: Export des données uniquement (sans structure)

```bash
# Données seules (format INSERT)
pg_dump -U iot_user -d iot_agriculture --data-only > data_only.sql

# Données seules (format COPY - plus rapide)
pg_dump -U iot_user -d iot_agriculture --data-only --column-inserts > data_only.sql
```

### Option D: Export de la structure uniquement (sans données)

```bash
# Structure seule
pg_dump -U iot_user -d iot_agriculture --schema-only > schema_only.sql
```

---

## 2. Importer la base de données

### Étape 2.1: Créer la base de données (sur le nouvel ordinateur)

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE iot_agriculture;

# Créer l'utilisateur (si nécessaire)
CREATE USER iot_user WITH PASSWORD 'votre_mot_de_passe';

# Donner les permissions
GRANT ALL PRIVILEGES ON DATABASE iot_agriculture TO iot_user;

# Quitter
\q
```

### Étape 2.2: Importer le fichier SQL

#### Si vous avez un fichier .sql non compressé:

```bash
# Méthode 1: Via psql (recommandé)
psql -U iot_user -d iot_agriculture < export_database.sql

# Méthode 2: Via psql en mode interactif
psql -U iot_user -d iot_agriculture
\i export_database.sql
\q
```

#### Si vous avez un fichier .sql.gz (compressé):

```bash
# Décompresser et importer en une seule commande
gunzip -c export_database.sql.gz | psql -U iot_user -d iot_agriculture
```

#### Si vous avez un fichier .dump (format personnalisé):

```bash
# Utiliser pg_restore
pg_restore -U iot_user -d iot_agriculture export_database.dump

# Avec options détaillées:
pg_restore -U iot_user -d iot_agriculture -v -c export_database.dump
# -v : mode verbose (affiche les détails)
# -c : nettoie (DROP) avant de créer
```

### Étape 2.3: Vérifier l'import

```bash
# Se connecter à la base
psql -U iot_user -d iot_agriculture

# Lister les tables
\dt

# Vous devriez voir:
#  Schema |    Name     | Type  |  Owner
# --------+-------------+-------+----------
#  public | alerts      | table | iot_user
#  public | sensor_data | table | iot_user
#  public | sensors     | table | iot_user
#  public | users       | table | iot_user

# Compter les enregistrements
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM sensors;
SELECT COUNT(*) FROM sensor_data;
SELECT COUNT(*) FROM alerts;

# Quitter
\q
```

---

## 3. Scripts automatisés

### Script d'export (Windows)

Créez un fichier `export_db.bat`:

```batch
@echo off
echo ========================================
echo Export de la base de donnees PostgreSQL
echo ========================================
echo.

set DB_USER=iot_user
set DB_NAME=iot_agriculture
set EXPORT_FILE=export_%date:~-4,4%%date:~-7,2%%date:~-10,2%_%time:~0,2%%time:~3,2%.sql

echo Export en cours vers: %EXPORT_FILE%
pg_dump -U %DB_USER% -d %DB_NAME% > %EXPORT_FILE%

if %errorlevel% equ 0 (
    echo.
    echo ✓ Export reussi!
    echo Fichier: %EXPORT_FILE%
) else (
    echo.
    echo ✗ Erreur lors de l'export!
)

pause
```

### Script d'export (Mac/Linux)

Créez un fichier `export_db.sh`:

```bash
#!/bin/bash

echo "========================================"
echo "Export de la base de données PostgreSQL"
echo "========================================"
echo

DB_USER="iot_user"
DB_NAME="iot_agriculture"
EXPORT_FILE="export_$(date +%Y%m%d_%H%M%S).sql"

echo "Export en cours vers: $EXPORT_FILE"
pg_dump -U $DB_USER -d $DB_NAME > $EXPORT_FILE

if [ $? -eq 0 ]; then
    echo
    echo "✓ Export réussi!"
    echo "Fichier: $EXPORT_FILE"

    # Compresser automatiquement
    gzip $EXPORT_FILE
    echo "✓ Fichier compressé: ${EXPORT_FILE}.gz"
else
    echo
    echo "✗ Erreur lors de l'export!"
fi
```

Rendre le script exécutable:
```bash
chmod +x export_db.sh
./export_db.sh
```

### Script d'import (Windows)

Créez un fichier `import_db.bat`:

```batch
@echo off
echo ========================================
echo Import de la base de donnees PostgreSQL
echo ========================================
echo.

set DB_USER=iot_user
set DB_NAME=iot_agriculture
set /p IMPORT_FILE="Entrez le nom du fichier SQL a importer: "

if not exist "%IMPORT_FILE%" (
    echo Erreur: Le fichier %IMPORT_FILE% n'existe pas!
    pause
    exit
)

echo Import en cours depuis: %IMPORT_FILE%
psql -U %DB_USER% -d %DB_NAME% < "%IMPORT_FILE%"

if %errorlevel% equ 0 (
    echo.
    echo ✓ Import reussi!
) else (
    echo.
    echo ✗ Erreur lors de l'import!
)

pause
```

### Script d'import (Mac/Linux)

Créez un fichier `import_db.sh`:

```bash
#!/bin/bash

echo "========================================"
echo "Import de la base de données PostgreSQL"
echo "========================================"
echo

DB_USER="iot_user"
DB_NAME="iot_agriculture"

read -p "Entrez le nom du fichier SQL à importer: " IMPORT_FILE

if [ ! -f "$IMPORT_FILE" ]; then
    echo "Erreur: Le fichier $IMPORT_FILE n'existe pas!"
    exit 1
fi

echo "Import en cours depuis: $IMPORT_FILE"

# Si le fichier est compressé
if [[ $IMPORT_FILE == *.gz ]]; then
    gunzip -c $IMPORT_FILE | psql -U $DB_USER -d $DB_NAME
else
    psql -U $DB_USER -d $DB_NAME < $IMPORT_FILE
fi

if [ $? -eq 0 ]; then
    echo
    echo "✓ Import réussi!"
else
    echo
    echo "✗ Erreur lors de l'import!"
fi
```

Rendre le script exécutable:
```bash
chmod +x import_db.sh
./import_db.sh
```

---

## Scénarios d'utilisation

### Scénario 1: Transférer la base sur un autre ordinateur

**Sur l'ordinateur source:**
```bash
# 1. Exporter
pg_dump -U iot_user -d iot_agriculture > export_database.sql

# 2. Compresser (optionnel)
gzip export_database.sql

# 3. Transférer le fichier vers le nouvel ordinateur (clé USB, email, etc.)
```

**Sur le nouvel ordinateur:**
```bash
# 1. Installer PostgreSQL
# 2. Créer la base et l'utilisateur (voir étape 2.1)

# 3. Importer
gunzip -c export_database.sql.gz | psql -U iot_user -d iot_agriculture

# 4. Vérifier
psql -U iot_user -d iot_agriculture -c "\dt"
```

### Scénario 2: Sauvegarde quotidienne

Créez un script qui s'exécute automatiquement chaque jour:

**Windows (Planificateur de tâches):**
```batch
@echo off
set BACKUP_DIR=C:\Backups\IoT
set DB_USER=iot_user
set DB_NAME=iot_agriculture
set BACKUP_FILE=%BACKUP_DIR%\backup_%date:~-4,4%%date:~-7,2%%date:~-10,2%.sql

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

pg_dump -U %DB_USER% -d %DB_NAME% > "%BACKUP_FILE%"

:: Supprimer les backups de plus de 7 jours
forfiles /p "%BACKUP_DIR%" /s /m *.sql /d -7 /c "cmd /c del @path"
```

**Mac/Linux (cron):**
```bash
# Ajouter au crontab (crontab -e):
0 2 * * * /path/to/backup_script.sh

# backup_script.sh:
#!/bin/bash
BACKUP_DIR="/backups/iot"
DB_USER="iot_user"
DB_NAME="iot_agriculture"
BACKUP_FILE="$BACKUP_DIR/backup_$(date +\%Y\%m\%d).sql.gz"

mkdir -p $BACKUP_DIR
pg_dump -U $DB_USER -d $DB_NAME | gzip > $BACKUP_FILE

# Supprimer les backups de plus de 7 jours
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
```

### Scénario 3: Migration vers une nouvelle version de PostgreSQL

```bash
# 1. Sur l'ancienne version
pg_dump -U iot_user -d iot_agriculture -F c -f export.dump

# 2. Installer la nouvelle version de PostgreSQL

# 3. Sur la nouvelle version
createdb -U postgres iot_agriculture
pg_restore -U iot_user -d iot_agriculture export.dump
```

---

## Dépannage

### Erreur: "psql: command not found"

**Solution:** Ajoutez PostgreSQL au PATH

**Windows:**
```batch
# Ajoutez au PATH (exemple):
set PATH=%PATH%;C:\Program Files\PostgreSQL\15\bin
```

**Mac/Linux:**
```bash
# Ajoutez au ~/.bashrc ou ~/.zshrc:
export PATH="/usr/lib/postgresql/15/bin:$PATH"
```

### Erreur: "FATAL: password authentication failed"

**Solution:** Vérifiez vos identifiants

```bash
# Se connecter avec l'utilisateur postgres d'abord
psql -U postgres -d iot_agriculture

# Réinitialiser le mot de passe
ALTER USER iot_user WITH PASSWORD 'nouveau_mot_de_passe';
```

### Erreur: "database already exists"

**Solution:** Supprimez l'ancienne base avant d'importer

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Supprimer la base
DROP DATABASE IF EXISTS iot_agriculture;

# Recréer
CREATE DATABASE iot_agriculture;
\q

# Puis importer
psql -U iot_user -d iot_agriculture < export_database.sql
```

### Erreur: "permission denied for schema public"

**Solution:** Donner les permissions

```bash
psql -U postgres -d iot_agriculture

GRANT ALL ON SCHEMA public TO iot_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO iot_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO iot_user;
\q
```

### Import très lent

**Solution:** Désactiver temporairement les index

```bash
# Avant l'import
psql -U iot_user -d iot_agriculture -c "DROP INDEX IF EXISTS idx_sensor_data_timestamp;"

# Importer
psql -U iot_user -d iot_agriculture < export_database.sql

# Recréer les index
psql -U iot_user -d iot_agriculture -c "CREATE INDEX idx_sensor_data_timestamp ON sensor_data(timestamp);"
```

---

## Export via pgAdmin (Interface graphique)

Si vous préférez utiliser une interface graphique:

1. Ouvrez **pgAdmin**
2. Connectez-vous à votre serveur PostgreSQL
3. Clic droit sur la base `iot_agriculture`
4. Sélectionnez **Backup...**
5. Choisissez:
   - **Format**: Plain (SQL)
   - **Fichier**: Choisissez l'emplacement
   - **Encoding**: UTF8
6. Cliquez sur **Backup**

Pour importer:
1. Clic droit sur **Databases**
2. **Create** → **Database**
3. Nom: `iot_agriculture`
4. Clic droit sur la nouvelle base → **Restore...**
5. Sélectionnez votre fichier
6. Cliquez sur **Restore**

---

## Commandes rapides de référence

```bash
# EXPORT
pg_dump -U iot_user -d iot_agriculture > export.sql                    # Export simple
pg_dump -U iot_user -d iot_agriculture | gzip > export.sql.gz         # Export compressé
pg_dump -U iot_user -d iot_agriculture -F c -f export.dump            # Format personnalisé

# IMPORT
psql -U iot_user -d iot_agriculture < export.sql                      # Import simple
gunzip -c export.sql.gz | psql -U iot_user -d iot_agriculture        # Import compressé
pg_restore -U iot_user -d iot_agriculture export.dump                 # Restore format personnalisé

# VÉRIFICATION
psql -U iot_user -d iot_agriculture -c "\dt"                          # Lister les tables
psql -U iot_user -d iot_agriculture -c "SELECT COUNT(*) FROM users;"  # Compter les users
```

---

## Checklist pour le transfert

- [ ] Exporter la base de données: `pg_dump -U iot_user -d iot_agriculture > export.sql`
- [ ] Vérifier que le fichier export.sql existe et n'est pas vide
- [ ] Transférer le fichier sur le nouvel ordinateur
- [ ] Installer PostgreSQL sur le nouvel ordinateur
- [ ] Créer la base de données: `CREATE DATABASE iot_agriculture;`
- [ ] Créer l'utilisateur: `CREATE USER iot_user WITH PASSWORD '...';`
- [ ] Donner les permissions: `GRANT ALL PRIVILEGES ON DATABASE iot_agriculture TO iot_user;`
- [ ] Importer: `psql -U iot_user -d iot_agriculture < export.sql`
- [ ] Vérifier les tables: `psql -U iot_user -d iot_agriculture -c "\dt"`
- [ ] Vérifier les données: `SELECT COUNT(*) FROM users;`
- [ ] Mettre à jour le fichier `backend/.env` avec les nouvelles informations de connexion

---

Votre base de données est maintenant exportée et prête à être transférée!
