"""
Script de simulation de capteurs IoT
Envoie des données de test via MQTT au backend
"""

import paho.mqtt.client as mqtt
import json
import time
import random
from datetime import datetime

# Configuration MQTT
MQTT_BROKER = "localhost"
MQTT_PORT = 1883
MQTT_TOPIC_BASE = "iot/sensors"

# Capteurs simulés
SENSORS = [
    {
        "sensor_id": "TEMP_001",
        "type": "temperature",
        "unit": "°C",
        "min": 15,
        "max": 35,
        "name": "Température Serre 1"
    },
    {
        "sensor_id": "HUM_001",
        "type": "humidity",
        "unit": "%",
        "min": 30,
        "max": 90,
        "name": "Humidité Serre 1"
    },
    {
        "sensor_id": "SOIL_001",
        "type": "soil_moisture",
        "unit": "%",
        "min": 10,
        "max": 80,
        "name": "Humidité Sol Champ A"
    },
    {
        "sensor_id": "LIGHT_001",
        "type": "light",
        "unit": "lux",
        "min": 100,
        "max": 15000,
        "name": "Luminosité Serre 1"
    }
]

def on_connect(client, userdata, flags, rc):
    """Callback de connexion"""
    if rc == 0:
        print(f"✓ Connecté au broker MQTT {MQTT_BROKER}:{MQTT_PORT}")
    else:
        print(f"✗ Échec de connexion, code: {rc}")

def on_publish(client, userdata, mid):
    """Callback de publication"""
    print(f"  Message {mid} publié")

def generate_sensor_data(sensor):
    """Génère des données aléatoires pour un capteur"""
    value = random.uniform(sensor["min"], sensor["max"])

    # Ajouter quelques valeurs extrêmes pour tester les alertes
    if random.random() < 0.1:  # 10% de chance
        if random.random() < 0.5:
            value = sensor["max"] + random.uniform(5, 15)
        else:
            value = sensor["min"] - random.uniform(5, 15)

    return {
        "sensor_id": sensor["sensor_id"],
        "value": round(value, 2),
        "unit": sensor["unit"],
        "type": sensor["type"],
        "timestamp": datetime.utcnow().isoformat()
    }

def main():
    """Fonction principale"""
    print("=" * 60)
    print("Simulateur de capteurs IoT")
    print("=" * 60)

    # Créer le client MQTT
    client = mqtt.Client(client_id="sensor_simulator")
    client.on_connect = on_connect
    client.on_publish = on_publish

    try:
        # Se connecter au broker
        print(f"\nConnexion au broker MQTT {MQTT_BROKER}:{MQTT_PORT}...")
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        client.loop_start()

        time.sleep(2)  # Attendre la connexion

        print(f"\nEnvoi de données toutes les 10 secondes...")
        print("Appuyez sur Ctrl+C pour arrêter\n")

        iteration = 0
        while True:
            iteration += 1
            print(f"\n--- Itération {iteration} - {datetime.now().strftime('%H:%M:%S')} ---")

            for sensor in SENSORS:
                data = generate_sensor_data(sensor)
                topic = f"{MQTT_TOPIC_BASE}/data"

                # Publier les données
                result = client.publish(topic, json.dumps(data))

                print(f"📡 {sensor['name']}: {data['value']} {data['unit']}")

                if result.rc != 0:
                    print(f"  ✗ Échec de publication pour {sensor['sensor_id']}")

            time.sleep(10)  # Attendre 10 secondes

    except KeyboardInterrupt:
        print("\n\nArrêt du simulateur...")
    except Exception as e:
        print(f"\n✗ Erreur: {e}")
    finally:
        client.loop_stop()
        client.disconnect()
        print("Déconnecté")

if __name__ == "__main__":
    main()
