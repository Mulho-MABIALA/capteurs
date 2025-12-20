from flask import Blueprint

# Create blueprints
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')
sensors_bp = Blueprint('sensors', __name__, url_prefix='/api/sensors')
sensor_data_bp = Blueprint('sensor_data', __name__, url_prefix='/api/sensor-data')
alerts_bp = Blueprint('alerts', __name__, url_prefix='/api/alerts')
users_bp = Blueprint('users', __name__, url_prefix='/api/users')

# Import routes
from . import auth, sensors, sensor_data, alerts, users

def register_blueprints(app):
    """Register all blueprints with the Flask app"""
    app.register_blueprint(auth_bp)
    app.register_blueprint(sensors_bp)
    app.register_blueprint(sensor_data_bp)
    app.register_blueprint(alerts_bp)
    app.register_blueprint(users_bp)
