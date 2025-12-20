from . import db
from datetime import datetime

class SensorData(db.Model):
    __tablename__ = 'sensor_data'

    id = db.Column(db.Integer, primary_key=True)
    sensor_id = db.Column(db.Integer, db.ForeignKey('sensors.id'), nullable=False)
    encrypted_value = db.Column(db.Text, nullable=False)  # Encrypted sensor value (AES-256)
    unit = db.Column(db.String(20))  # °C, %, lux, etc.
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    def to_dict(self, decrypted_value=None):
        """Convert sensor data to dictionary"""
        return {
            'id': self.id,
            'sensor_id': self.sensor_id,
            'value': decrypted_value,  # Decrypted value
            'unit': self.unit,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }
