"""
Script de test pour envoyer des données de capteurs via HTTPS
"""

import requests
import json
import time
import random
from datetime import datetime

# Configuration
API_URL = "http://localhost:5000/api"
USERNAME = "admin"
PASSWORD = "admin123"

# Capteurs à tester
SENSORS = [
    {
        "sensor_id": "HTTP_TEMP_001",
        "type": "temperature",
        "unit": "°C",
        "min": 15,
        "max": 35
    },
    {
        "sensor_id": "HTTP_HUM_001",
        "type": "humidity",
        "unit": "%",
        "min": 30,
        "max": 90
    }
]

def login():
    """Se connecter et obtenir un token JWT"""
    print("Connexion à l'API...")
    response = requests.post(
        f"{API_URL}/auth/login",
        json={"username": USERNAME, "password": PASSWORD}
    )

    if response.status_code == 200:
        token = response.json()["access_token"]
        print(f"✓ Connecté avec succès")
        return token
    else:
        print(f"✗ Échec de connexion: {response.json()}")
        return None

def create_sensors(token):
    """Créer les capteurs s'ils n'existent pas"""
    print("\nCréation des capteurs...")
    headers = {"Authorization": f"Bearer {token}"}

    for sensor in SENSORS:
        sensor_data = {
            "sensor_id": sensor["sensor_id"],
            "name": f"Capteur HTTPS {sensor['type']}",
            "type": sensor["type"],
            "location": "Test via HTTPS",
            "status": "active",
            "description": "Capteur de test pour HTTPS"
        }

        response = requests.post(
            f"{API_URL}/sensors",
            json=sensor_data,
            headers=headers
        )

        if response.status_code == 201:
            print(f"✓ Capteur {sensor['sensor_id']} créé")
        elif response.status_code == 400 and "already exists" in response.json().get("error", ""):
            print(f"ℹ Capteur {sensor['sensor_id']} existe déjà")
        else:
            print(f"✗ Erreur: {response.json()}")

def send_sensor_data(token):
    """Envoyer des données de capteurs"""
    print("\nEnvoi de données de capteurs...")
    headers = {"Authorization": f"Bearer {token}"}

    iteration = 0
    while True:
        iteration += 1
        print(f"\n--- Itération {iteration} - {datetime.now().strftime('%H:%M:%S')} ---")

        for sensor in SENSORS:
            value = round(random.uniform(sensor["min"], sensor["max"]), 2)

            # Ajouter quelques valeurs extrêmes pour tester les alertes
            if random.random() < 0.1:
                if random.random() < 0.5:
                    value = sensor["max"] + random.uniform(5, 15)
                else:
                    value = sensor["min"] - random.uniform(5, 15)

            data = {
                "sensor_id": sensor["sensor_id"],
                "value": value,
                "unit": sensor["unit"]
            }

            response = requests.post(
                f"{API_URL}/sensor-data",
                json=data,
                headers=headers
            )

            if response.status_code == 201:
                print(f"✓ {sensor['sensor_id']}: {value} {sensor['unit']}")
            else:
                print(f"✗ Erreur pour {sensor['sensor_id']}: {response.json()}")

        time.sleep(10)  # Attendre 10 secondes

def main():
    """Fonction principale"""
    print("=" * 60)
    print("Test d'envoi de données via HTTPS")
    print("=" * 60)

    try:
        # Se connecter
        token = login()
        if not token:
            return

        # Créer les capteurs
        create_sensors(token)

        # Envoyer des données
        print("\nEnvoi de données toutes les 10 secondes...")
        print("Appuyez sur Ctrl+C pour arrêter\n")
        send_sensor_data(token)

    except KeyboardInterrupt:
        print("\n\nArrêt du script...")
    except Exception as e:
        print(f"\n✗ Erreur: {e}")

if __name__ == "__main__":
    main()
