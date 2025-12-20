from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .user import User
from .sensor import Sensor
from .sensor_data import SensorData
from .alert import Alert
