from . import db
from datetime import datetime

class Alert(db.Model):
    __tablename__ = 'alerts'

    id = db.Column(db.Integer, primary_key=True)
    sensor_id = db.Column(db.Integer, db.ForeignKey('sensors.id'), nullable=False)
    alert_type = db.Column(db.String(50), nullable=False)  # high_temperature, low_humidity, etc.
    message = db.Column(db.Text, nullable=False)
    severity = db.Column(db.String(20), default='warning')  # info, warning, critical
    threshold_value = db.Column(db.Float)
    actual_value = db.Column(db.Float)
    is_resolved = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    resolved_at = db.Column(db.DateTime)

    def to_dict(self):
        """Convert alert to dictionary"""
        return {
            'id': self.id,
            'sensor_id': self.sensor_id,
            'alert_type': self.alert_type,
            'message': self.message,
            'severity': self.severity,
            'threshold_value': self.threshold_value,
            'actual_value': self.actual_value,
            'is_resolved': self.is_resolved,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None
        }
