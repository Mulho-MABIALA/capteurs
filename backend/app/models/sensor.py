from . import db
from datetime import datetime

class Sensor(db.Model):
    __tablename__ = 'sensors'

    id = db.Column(db.Integer, primary_key=True)
    sensor_id = db.Column(db.String(100), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # temperature, humidity, soil_moisture, light
    location = db.Column(db.String(200))
    status = db.Column(db.String(20), default='active')  # active, inactive, maintenance
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    sensor_data = db.relationship('SensorData', backref='sensor', lazy=True, cascade='all, delete-orphan')
    alerts = db.relationship('Alert', backref='sensor', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        """Convert sensor to dictionary"""
        return {
            'id': self.id,
            'sensor_id': self.sensor_id,
            'name': self.name,
            'type': self.type,
            'location': self.location,
            'status': self.status,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
