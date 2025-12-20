from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Sensor
from . import sensors_bp

@sensors_bp.route('', methods=['GET'])
@jwt_required()
def get_sensors():
    """Get all sensors"""
    try:
        status = request.args.get('status')
        sensor_type = request.args.get('type')

        query = Sensor.query

        if status:
            query = query.filter_by(status=status)
        if sensor_type:
            query = query.filter_by(type=sensor_type)

        sensors = query.all()

        return jsonify({
            'sensors': [sensor.to_dict() for sensor in sensors],
            'total': len(sensors)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@sensors_bp.route('/<int:sensor_id>', methods=['GET'])
@jwt_required()
def get_sensor(sensor_id):
    """Get a specific sensor"""
    try:
        sensor = Sensor.query.get(sensor_id)

        if not sensor:
            return jsonify({'error': 'Sensor not found'}), 404

        return jsonify({'sensor': sensor.to_dict()}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@sensors_bp.route('', methods=['POST'])
@jwt_required()
def create_sensor():
    """Create a new sensor"""
    try:
        data = request.get_json()

        # Validate input
        if not data.get('sensor_id') or not data.get('name') or not data.get('type'):
            return jsonify({'error': 'sensor_id, name, and type are required'}), 400

        # Check if sensor_id already exists
        if Sensor.query.filter_by(sensor_id=data['sensor_id']).first():
            return jsonify({'error': 'Sensor ID already exists'}), 400

        # Create new sensor
        sensor = Sensor(
            sensor_id=data['sensor_id'],
            name=data['name'],
            type=data['type'],
            location=data.get('location'),
            status=data.get('status', 'active'),
            description=data.get('description')
        )

        db.session.add(sensor)
        db.session.commit()

        return jsonify({
            'message': 'Sensor created successfully',
            'sensor': sensor.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@sensors_bp.route('/<int:sensor_id>', methods=['PUT'])
@jwt_required()
def update_sensor(sensor_id):
    """Update a sensor"""
    try:
        sensor = Sensor.query.get(sensor_id)

        if not sensor:
            return jsonify({'error': 'Sensor not found'}), 404

        data = request.get_json()

        # Update fields
        if 'name' in data:
            sensor.name = data['name']
        if 'type' in data:
            sensor.type = data['type']
        if 'location' in data:
            sensor.location = data['location']
        if 'status' in data:
            sensor.status = data['status']
        if 'description' in data:
            sensor.description = data['description']

        db.session.commit()

        return jsonify({
            'message': 'Sensor updated successfully',
            'sensor': sensor.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@sensors_bp.route('/<int:sensor_id>', methods=['DELETE'])
@jwt_required()
def delete_sensor(sensor_id):
    """Delete a sensor"""
    try:
        sensor = Sensor.query.get(sensor_id)

        if not sensor:
            return jsonify({'error': 'Sensor not found'}), 404

        db.session.delete(sensor)
        db.session.commit()

        return jsonify({'message': 'Sensor deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
