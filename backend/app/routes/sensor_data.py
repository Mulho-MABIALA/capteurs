from flask import request, jsonify
from flask_jwt_extended import jwt_required
from app.models import db, Sensor, SensorData
from app.utils.encryption import EncryptionService
from datetime import datetime, timedelta
from flask import current_app
from . import sensor_data_bp

@sensor_data_bp.route('', methods=['GET'])
@jwt_required()
def get_sensor_data():
    """Get sensor data with optional filters"""
    try:
        sensor_id = request.args.get('sensor_id', type=int)
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        limit = request.args.get('limit', 100, type=int)

        query = SensorData.query

        if sensor_id:
            query = query.filter_by(sensor_id=sensor_id)

        if start_date:
            start = datetime.fromisoformat(start_date)
            query = query.filter(SensorData.timestamp >= start)

        if end_date:
            end = datetime.fromisoformat(end_date)
            query = query.filter(SensorData.timestamp <= end)

        query = query.order_by(SensorData.timestamp.desc()).limit(limit)

        data_records = query.all()

        # Decrypt sensor values
        encryption_service = EncryptionService(current_app.config['ENCRYPTION_KEY'])
        result = []

        for record in data_records:
            try:
                decrypted_value = encryption_service.decrypt(record.encrypted_value)
                result.append(record.to_dict(decrypted_value=decrypted_value))
            except Exception as e:
                print(f"Failed to decrypt sensor data {record.id}: {e}")
                result.append(record.to_dict(decrypted_value=None))

        return jsonify({
            'data': result,
            'total': len(result)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@sensor_data_bp.route('/latest', methods=['GET'])
@jwt_required()
def get_latest_sensor_data():
    """Get latest sensor data for each sensor"""
    try:
        sensors = Sensor.query.filter_by(status='active').all()
        encryption_service = EncryptionService(current_app.config['ENCRYPTION_KEY'])

        result = []

        for sensor in sensors:
            latest_data = SensorData.query.filter_by(sensor_id=sensor.id)\
                .order_by(SensorData.timestamp.desc()).first()

            if latest_data:
                try:
                    decrypted_value = encryption_service.decrypt(latest_data.encrypted_value)
                    sensor_dict = sensor.to_dict()
                    sensor_dict['latest_data'] = latest_data.to_dict(decrypted_value=decrypted_value)
                    result.append(sensor_dict)
                except Exception as e:
                    print(f"Failed to decrypt sensor data: {e}")

        return jsonify({
            'sensors': result,
            'total': len(result)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@sensor_data_bp.route('', methods=['POST'])
@jwt_required()
def create_sensor_data():
    """Create sensor data manually (HTTPS endpoint)"""
    try:
        data = request.get_json()

        # Validate input
        if not data.get('sensor_id') or data.get('value') is None:
            return jsonify({'error': 'sensor_id and value are required'}), 400

        # Find sensor by sensor_id string
        sensor = Sensor.query.filter_by(sensor_id=data['sensor_id']).first()

        if not sensor:
            return jsonify({'error': 'Sensor not found'}), 404

        # Encrypt sensor value
        encryption_service = EncryptionService(current_app.config['ENCRYPTION_KEY'])
        encrypted_value = encryption_service.encrypt(str(data['value']))

        # Create sensor data
        sensor_data = SensorData(
            sensor_id=sensor.id,
            encrypted_value=encrypted_value,
            unit=data.get('unit', ''),
            timestamp=datetime.utcnow()
        )

        db.session.add(sensor_data)
        db.session.commit()

        return jsonify({
            'message': 'Sensor data created successfully',
            'data': sensor_data.to_dict(decrypted_value=str(data['value']))
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@sensor_data_bp.route('/stats/<int:sensor_id>', methods=['GET'])
@jwt_required()
def get_sensor_stats(sensor_id):
    """Get statistics for a sensor"""
    try:
        sensor = Sensor.query.get(sensor_id)

        if not sensor:
            return jsonify({'error': 'Sensor not found'}), 404

        # Get data from last 24 hours
        start_time = datetime.utcnow() - timedelta(days=1)
        data_records = SensorData.query.filter(
            SensorData.sensor_id == sensor_id,
            SensorData.timestamp >= start_time
        ).all()

        if not data_records:
            return jsonify({
                'sensor': sensor.to_dict(),
                'stats': None,
                'message': 'No data available for this sensor'
            }), 200

        # Decrypt and calculate statistics
        encryption_service = EncryptionService(current_app.config['ENCRYPTION_KEY'])
        values = []

        for record in data_records:
            try:
                decrypted_value = float(encryption_service.decrypt(record.encrypted_value))
                values.append(decrypted_value)
            except Exception as e:
                print(f"Failed to decrypt sensor data: {e}")

        if values:
            stats = {
                'min': min(values),
                'max': max(values),
                'avg': sum(values) / len(values),
                'count': len(values)
            }
        else:
            stats = None

        return jsonify({
            'sensor': sensor.to_dict(),
            'stats': stats,
            'period': '24 hours'
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
