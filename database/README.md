# Database Setup

## PostgreSQL Installation

### Windows
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer and follow the installation wizard
3. Remember the password you set for the postgres user

### Linux
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

## Database Initialization

1. Start PostgreSQL service:
   - Windows: The service should start automatically
   - Linux: `sudo systemctl start postgresql`

2. Create the database:
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE iot_platform;

# Exit
\q
```

3. Update the `.env` file in the backend folder with your database credentials:
```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/iot_platform
```

## Database Schema

The database schema is automatically created by SQLAlchemy when you run the Flask application for the first time. The following tables will be created:

- **users**: Stores user accounts (admin, technicians)
- **sensors**: Stores sensor information
- **sensor_data**: Stores encrypted sensor readings
- **alerts**: Stores alerts triggered by sensor thresholds

## Manual Schema Creation (Optional)

If you want to create indexes manually, you can run:

```bash
psql -U postgres -d iot_platform -f init.sql
```
