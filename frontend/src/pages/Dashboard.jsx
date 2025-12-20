import { useState, useEffect } from 'react';
import { sensorDataAPI, alertsAPI } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Thermometer, Droplets, Sun, Activity, AlertTriangle, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  const [latestData, setLatestData] = useState([]);
  const [alertsSummary, setAlertsSummary] = useState(null);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [sensorHistory, setSensorHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedSensor) {
      fetchSensorHistory(selectedSensor.id);
    }
  }, [selectedSensor]);

  const fetchDashboardData = async () => {
    try {
      const [latestResponse, alertsResponse] = await Promise.all([
        sensorDataAPI.getLatest(),
        alertsAPI.getSummary(),
      ]);

      setLatestData(latestResponse.data.sensors || []);
      setAlertsSummary(alertsResponse.data);

      if (!selectedSensor && latestResponse.data.sensors.length > 0) {
        setSelectedSensor(latestResponse.data.sensors[0]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const fetchSensorHistory = async (sensorId) => {
    try {
      const response = await sensorDataAPI.getAll({
        sensor_id: sensorId,
        limit: 50,
      });

      const formattedData = response.data.data.map((item) => ({
        time: format(new Date(item.timestamp), 'HH:mm'),
        value: parseFloat(item.value),
        timestamp: item.timestamp,
      })).reverse();

      setSensorHistory(formattedData);
    } catch (error) {
      console.error('Error fetching sensor history:', error);
    }
  };

  const getSensorIcon = (type) => {
    switch (type) {
      case 'temperature':
        return <Thermometer className="h-6 w-6" />;
      case 'humidity':
        return <Droplets className="h-6 w-6" />;
      case 'light':
        return <Sun className="h-6 w-6" />;
      default:
        return <Activity className="h-6 w-6" />;
    }
  };

  const getSensorColor = (type) => {
    switch (type) {
      case 'temperature':
        return 'text-red-600 bg-red-100';
      case 'humidity':
        return 'text-blue-600 bg-blue-100';
      case 'light':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Tableau de bord</h1>

      {/* Alerts Summary */}
      {alertsSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Alertes</p>
                <p className="text-2xl font-bold text-gray-900">{alertsSummary.total}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Non résolues</p>
                <p className="text-2xl font-bold text-orange-600">{alertsSummary.unresolved}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-400" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critiques</p>
                <p className="text-2xl font-bold text-red-600">{alertsSummary.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Résolues</p>
                <p className="text-2xl font-bold text-green-600">{alertsSummary.resolved}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </div>
        </div>
      )}

      {/* Latest Sensor Readings */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Dernières mesures</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestData.map((sensor) => (
            <div
              key={sensor.id}
              className={`card cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedSensor?.id === sensor.id ? 'ring-2 ring-primary-500' : ''
              }`}
              onClick={() => setSelectedSensor(sensor)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${getSensorColor(sensor.type)}`}>
                  {getSensorIcon(sensor.type)}
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    sensor.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {sensor.status}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">{sensor.name}</h3>

              {sensor.latest_data && (
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {sensor.latest_data.value} {sensor.latest_data.unit}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {format(new Date(sensor.latest_data.timestamp), 'dd/MM/yyyy HH:mm')}
                  </p>
                </div>
              )}

              {sensor.location && (
                <p className="text-sm text-gray-600 mt-2">📍 {sensor.location}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sensor History Chart */}
      {selectedSensor && sensorHistory.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Historique: {selectedSensor.name}
          </h2>

          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={sensorHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name={`Valeur (${selectedSensor.latest_data?.unit || ''})`}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
