from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import config
from app.models import db
from app.services.mqtt_service import MQTTService

# Initialize extensions
jwt = JWTManager()
mqtt_service = MQTTService()

def create_app(config_name='default'):
    """Application factory"""
    app = Flask(__name__)

    # Load configuration
    app.config.from_object(config[config_name])

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    CORS(app)

    # Initialize MQTT service
    mqtt_service.init_app(app)

    # Register blueprints
    from app.routes import register_blueprints
    register_blueprints(app)

    # Create database tables
    with app.app_context():
        db.create_all()
        print("Database tables created successfully")

        # Create default admin user if not exists
        from app.models import User
        admin = User.query.filter_by(username='admin').first()
        if not admin:
            admin = User(
                username='admin',
                email='admin@example.com',
                role='admin'
            )
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
            print("Default admin user created (username: admin, password: admin123)")

    # Connect to MQTT broker
    mqtt_service.connect()

    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return {'status': 'healthy', 'message': 'IoT Platform API is running'}, 200

    return app
