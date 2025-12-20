import { useState, useEffect } from 'react';
import { alertsAPI } from '../services/api';
import { AlertTriangle, CheckCircle, Trash2, Filter } from 'lucide-react';
import { format } from 'date-fns';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    is_resolved: '',
    severity: '',
  });

  useEffect(() => {
    fetchAlerts();
  }, [filter]);

  const fetchAlerts = async () => {
    try {
      const params = {};
      if (filter.is_resolved !== '') {
        params.is_resolved = filter.is_resolved;
      }
      if (filter.severity) {
        params.severity = filter.severity;
      }

      const response = await alertsAPI.getAll(params);
      setAlerts(response.data.alerts || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await alertsAPI.resolve(id);
      fetchAlerts();
    } catch (error) {
      console.error('Error resolving alert:', error);
      alert('Error resolving alert');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette alerte?')) {
      return;
    }

    try {
      await alertsAPI.delete(id);
      fetchAlerts();
    } catch (error) {
      console.error('Error deleting alert:', error);
      alert('Error deleting alert');
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity) => {
    return <AlertTriangle className={`h-5 w-5 ${
      severity === 'critical' ? 'text-red-500' :
      severity === 'warning' ? 'text-yellow-500' :
      'text-blue-500'
    }`} />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Alertes</h1>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <Filter className="h-5 w-5 text-gray-500" />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              className="input-field"
              value={filter.is_resolved}
              onChange={(e) => setFilter({ ...filter, is_resolved: e.target.value })}
            >
              <option value="">Toutes</option>
              <option value="false">Non résolues</option>
              <option value="true">Résolues</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sévérité</label>
            <select
              className="input-field"
              value={filter.severity}
              onChange={(e) => setFilter({ ...filter, severity: e.target.value })}
            >
              <option value="">Toutes</option>
              <option value="critical">Critique</option>
              <option value="warning">Avertissement</option>
              <option value="info">Info</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`card ${alert.is_resolved ? 'opacity-60' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="mt-1">
                  {getSeverityIcon(alert.severity)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    {alert.is_resolved && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Résolu
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {alert.message}
                  </h3>

                  {alert.sensor && (
                    <p className="text-sm text-gray-600 mb-2">
                      Capteur: {alert.sensor.name} ({alert.sensor.sensor_id})
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {alert.threshold_value !== null && (
                      <span>Seuil: {alert.threshold_value}</span>
                    )}
                    {alert.actual_value !== null && (
                      <span>Valeur: {alert.actual_value}</span>
                    )}
                    <span>
                      {format(new Date(alert.created_at), 'dd/MM/yyyy HH:mm')}
                    </span>
                  </div>

                  {alert.is_resolved && alert.resolved_at && (
                    <p className="text-sm text-green-600 mt-2">
                      Résolu le {format(new Date(alert.resolved_at), 'dd/MM/yyyy HH:mm')}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                {!alert.is_resolved && (
                  <button
                    onClick={() => handleResolve(alert.id)}
                    className="btn-primary flex items-center"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Résoudre
                  </button>
                )}
                <button
                  onClick={() => handleDelete(alert.id)}
                  className="btn-danger flex items-center"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {alerts.length === 0 && (
          <div className="card text-center py-12">
            <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune alerte</h3>
            <p className="mt-1 text-sm text-gray-500">
              Aucune alerte ne correspond à vos critères de filtrage.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
