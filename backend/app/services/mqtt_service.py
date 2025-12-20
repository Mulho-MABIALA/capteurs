import paho.mqtt.client as mqtt
import json
from datetime import datetime
from app.models import db, Sensor, SensorData, Alert
from app.utils.encryption import EncryptionService

class MQTTService:
    """Service for handling MQTT connections and sensor data"""

    def __init__(self, app=None):
        self.app = app
        self.client = None
        self.encryption_service = None

        if app:
            self.init_app(app)

    def init_app(self, app):
        """Initialize MQTT service with Flask app"""
        self.app = app
        self.encryption_service = EncryptionService(app.config['ENCRYPTION_KEY'])

        # Create MQTT client (compatible with paho-mqtt 2.x)
        self.client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION1, client_id="iot_platform_server")

        # Set up callbacks
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        self.client.on_disconnect = self.on_disconnect

        # Set username and password if provided
        if app.config.get('MQTT_USERNAME') and app.config.get('MQTT_PASSWORD'):
            self.client.username_pw_set(
                app.config['MQTT_USERNAME'],
                app.config['MQTT_PASSWORD']
            )

    def connect(self):
        """Connect to MQTT broker"""
        try:
            self.client.connect(
                self.app.config['MQTT_BROKER_HOST'],
                self.app.config['MQTT_BROKER_PORT'],
                60
            )
            self.client.loop_start()
            print(f"Connecting to MQTT broker at {self.app.config['MQTT_BROKER_HOST']}:{self.app.config['MQTT_BROKER_PORT']}")
        except Exception as e:
            print(f"Failed to connect to MQTT broker: {e}")

    def disconnect(self):
        """Disconnect from MQTT broker"""
        if self.client:
            self.client.loop_stop()
            self.client.disconnect()

    def on_connect(self, client, userdata, flags, rc):
        """Callback when connected to MQTT broker"""
        if rc == 0:
            print("Connected to MQTT broker successfully")
            # Subscribe to all sensor topics
            client.subscribe(self.app.config['MQTT_TOPIC'])
            print(f"Subscribed to topic: {self.app.config['MQTT_TOPIC']}")
        else:
            print(f"Failed to connect to MQTT broker. Return code: {rc}")

    def on_disconnect(self, client, userdata, rc):
        """Callback when disconnected from MQTT broker"""
        if rc != 0:
            print(f"Unexpected disconnection from MQTT broker. Return code: {rc}")

    def on_message(self, client, userdata, msg):
        """Callback when a message is received"""
        try:
            # Parse message payload
            payload = json.loads(msg.payload.decode())

            sensor_id = payload.get('sensor_id')
            value = payload.get('value')
            unit = payload.get('unit', '')
            sensor_type = payload.get('type', 'unknown')

            if not sensor_id or value is None:
                print("Invalid message format: missing sensor_id or value")
                return

            with self.app.app_context():
                # Find or create sensor
                sensor = Sensor.query.filter_by(sensor_id=sensor_id).first()
                if not sensor:
                    sensor = Sensor(
                        sensor_id=sensor_id,
                        name=f"Sensor {sensor_id}",
                        type=sensor_type,
                        status='active'
                    )
                    db.session.add(sensor)
                    db.session.commit()
                    print(f"Created new sensor: {sensor_id}")

                # Encrypt sensor value
                encrypted_value = self.encryption_service.encrypt(str(value))

                # Store sensor data
                sensor_data = SensorData(
                    sensor_id=sensor.id,
                    encrypted_value=encrypted_value,
                    unit=unit,
                    timestamp=datetime.utcnow()
                )
                db.session.add(sensor_data)
                db.session.commit()

                print(f"Stored data from sensor {sensor_id}: {value} {unit}")

                # Check for alerts
                self.check_alerts(sensor, float(value))

        except json.JSONDecodeError:
            print(f"Failed to decode JSON message: {msg.payload}")
        except Exception as e:
            print(f"Error processing message: {e}")

    def check_alerts(self, sensor, value):
        """Check if sensor value triggers any alerts"""
        try:
            # Define thresholds based on sensor type
            thresholds = {
                'temperature': {'high': 35, 'low': 10},
                'humidity': {'high': 80, 'low': 30},
                'soil_moisture': {'low': 20},
                'light': {'high': 10000}
            }

            if sensor.type not in thresholds:
                return

            sensor_thresholds = thresholds[sensor.type]

            # Check high threshold
            if 'high' in sensor_thresholds and value > sensor_thresholds['high']:
                self.create_alert(
                    sensor,
                    f"high_{sensor.type}",
                    f"{sensor.name} value is too high: {value}",
                    'warning',
                    sensor_thresholds['high'],
                    value
                )

            # Check low threshold
            if 'low' in sensor_thresholds and value < sensor_thresholds['low']:
                self.create_alert(
                    sensor,
                    f"low_{sensor.type}",
                    f"{sensor.name} value is too low: {value}",
                    'warning',
                    sensor_thresholds['low'],
                    value
                )

        except Exception as e:
            print(f"Error checking alerts: {e}")

    def create_alert(self, sensor, alert_type, message, severity, threshold, actual_value):
        """Create an alert if one doesn't already exist for this condition"""
        try:
            # Check if an unresolved alert already exists
            existing_alert = Alert.query.filter_by(
                sensor_id=sensor.id,
                alert_type=alert_type,
                is_resolved=False
            ).first()

            if not existing_alert:
                alert = Alert(
                    sensor_id=sensor.id,
                    alert_type=alert_type,
                    message=message,
                    severity=severity,
                    threshold_value=threshold,
                    actual_value=actual_value,
                    is_resolved=False
                )
                db.session.add(alert)
                db.session.commit()
                print(f"Created alert: {message}")

        except Exception as e:
            print(f"Error creating alert: {e}")

    def publish(self, topic, payload):
        """Publish a message to MQTT broker"""
        if self.client:
            self.client.publish(topic, json.dumps(payload))
