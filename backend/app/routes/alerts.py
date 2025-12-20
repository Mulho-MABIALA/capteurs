from flask import request, jsonify
from flask_jwt_extended import jwt_required
from app.models import db, Alert, Sensor
from datetime import datetime
from . import alerts_bp

@alerts_bp.route('', methods=['GET'])
@jwt_required()
def get_alerts():
    """Get all alerts with optional filters"""
    try:
        sensor_id = request.args.get('sensor_id', type=int)
        is_resolved = request.args.get('is_resolved')
        severity = request.args.get('severity')
        limit = request.args.get('limit', 100, type=int)

        query = Alert.query

        if sensor_id:
            query = query.filter_by(sensor_id=sensor_id)

        if is_resolved is not None:
            is_resolved_bool = is_resolved.lower() == 'true'
            query = query.filter_by(is_resolved=is_resolved_bool)

        if severity:
            query = query.filter_by(severity=severity)

        query = query.order_by(Alert.created_at.desc()).limit(limit)

        alerts = query.all()

        # Include sensor information
        result = []
        for alert in alerts:
            alert_dict = alert.to_dict()
            sensor = Sensor.query.get(alert.sensor_id)
            if sensor:
                alert_dict['sensor'] = sensor.to_dict()
            result.append(alert_dict)

        return jsonify({
            'alerts': result,
            'total': len(result)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@alerts_bp.route('/<int:alert_id>', methods=['GET'])
@jwt_required()
def get_alert(alert_id):
    """Get a specific alert"""
    try:
        alert = Alert.query.get(alert_id)

        if not alert:
            return jsonify({'error': 'Alert not found'}), 404

        alert_dict = alert.to_dict()
        sensor = Sensor.query.get(alert.sensor_id)
        if sensor:
            alert_dict['sensor'] = sensor.to_dict()

        return jsonify({'alert': alert_dict}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@alerts_bp.route('/<int:alert_id>/resolve', methods=['PUT'])
@jwt_required()
def resolve_alert(alert_id):
    """Resolve an alert"""
    try:
        alert = Alert.query.get(alert_id)

        if not alert:
            return jsonify({'error': 'Alert not found'}), 404

        alert.is_resolved = True
        alert.resolved_at = datetime.utcnow()

        db.session.commit()

        return jsonify({
            'message': 'Alert resolved successfully',
            'alert': alert.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@alerts_bp.route('/<int:alert_id>', methods=['DELETE'])
@jwt_required()
def delete_alert(alert_id):
    """Delete an alert"""
    try:
        alert = Alert.query.get(alert_id)

        if not alert:
            return jsonify({'error': 'Alert not found'}), 404

        db.session.delete(alert)
        db.session.commit()

        return jsonify({'message': 'Alert deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@alerts_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_alerts_summary():
    """Get summary of alerts"""
    try:
        total_alerts = Alert.query.count()
        unresolved_alerts = Alert.query.filter_by(is_resolved=False).count()
        critical_alerts = Alert.query.filter_by(severity='critical', is_resolved=False).count()
        warning_alerts = Alert.query.filter_by(severity='warning', is_resolved=False).count()

        return jsonify({
            'total': total_alerts,
            'unresolved': unresolved_alerts,
            'critical': critical_alerts,
            'warning': warning_alerts,
            'resolved': total_alerts - unresolved_alerts
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
