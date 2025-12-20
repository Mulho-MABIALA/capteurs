-- Create database
CREATE DATABASE iot_platform;

-- Connect to database
\c iot_platform;

-- Enable pgcrypto extension for encryption functions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users table is created by SQLAlchemy
-- Sensors table is created by SQLAlchemy
-- Sensor_data table is created by SQLAlchemy
-- Alerts table is created by SQLAlchemy

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sensor_data_sensor_id ON sensor_data(sensor_id);
CREATE INDEX IF NOT EXISTS idx_sensor_data_timestamp ON sensor_data(timestamp);
CREATE INDEX IF NOT EXISTS idx_alerts_sensor_id ON alerts(sensor_id);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_alerts_is_resolved ON alerts(is_resolved);

-- Grant privileges (adjust username as needed)
-- GRANT ALL PRIVILEGES ON DATABASE iot_platform TO your_username;
