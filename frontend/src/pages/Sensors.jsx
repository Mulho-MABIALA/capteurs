import { useState, useEffect } from 'react';
import { sensorsAPI } from '../services/api';
import { Plus, Edit, Trash2, Activity, X } from 'lucide-react';

const Sensors = () => {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSensor, setEditingSensor] = useState(null);
  const [formData, setFormData] = useState({
    sensor_id: '',
    name: '',
    type: 'temperature',
    location: '',
    status: 'active',
    description: '',
  });

  useEffect(() => {
    fetchSensors();
  }, []);

  const fetchSensors = async () => {
    try {
      const response = await sensorsAPI.getAll();
      setSensors(response.data.sensors || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sensors:', error);
      setLoading(false);
    }
  };

  const handleOpenModal = (sensor = null) => {
    if (sensor) {
      setEditingSensor(sensor);
      setFormData({
        sensor_id: sensor.sensor_id,
        name: sensor.name,
        type: sensor.type,
        location: sensor.location || '',
        status: sensor.status,
        description: sensor.description || '',
      });
    } else {
      setEditingSensor(null);
      setFormData({
        sensor_id: '',
        name: '',
        type: 'temperature',
        location: '',
        status: 'active',
        description: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSensor(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingSensor) {
        await sensorsAPI.update(editingSensor.id, formData);
      } else {
        await sensorsAPI.create(formData);
      }

      fetchSensors();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving sensor:', error);
      alert(error.response?.data?.error || 'Error saving sensor');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce capteur?')) {
      return;
    }

    try {
      await sensorsAPI.delete(id);
      fetchSensors();
    } catch (error) {
      console.error('Error deleting sensor:', error);
      alert('Error deleting sensor');
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des capteurs</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Ajouter un capteur
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID Capteur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Localisation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sensors.map((sensor) => (
              <tr key={sensor.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {sensor.sensor_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {sensor.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {sensor.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {sensor.location || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      sensor.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : sensor.status === 'inactive'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {sensor.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleOpenModal(sensor)}
                    className="text-primary-600 hover:text-primary-900 mr-4"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(sensor.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sensors.length === 0 && (
          <div className="text-center py-12">
            <Activity className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun capteur</h3>
            <p className="mt-1 text-sm text-gray-500">
              Commencez par ajouter un nouveau capteur.
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingSensor ? 'Modifier le capteur' : 'Ajouter un capteur'}
                    </h3>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="label">ID Capteur</label>
                      <input
                        type="text"
                        required
                        disabled={!!editingSensor}
                        className="input-field"
                        value={formData.sensor_id}
                        onChange={(e) =>
                          setFormData({ ...formData, sensor_id: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="label">Nom</label>
                      <input
                        type="text"
                        required
                        className="input-field"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="label">Type</label>
                      <select
                        className="input-field"
                        value={formData.type}
                        onChange={(e) =>
                          setFormData({ ...formData, type: e.target.value })
                        }
                      >
                        <option value="temperature">Température</option>
                        <option value="humidity">Humidité</option>
                        <option value="soil_moisture">Humidité du sol</option>
                        <option value="light">Luminosité</option>
                      </select>
                    </div>

                    <div>
                      <label className="label">Localisation</label>
                      <input
                        type="text"
                        className="input-field"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="label">Statut</label>
                      <select
                        className="input-field"
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                      >
                        <option value="active">Actif</option>
                        <option value="inactive">Inactif</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>

                    <div>
                      <label className="label">Description</label>
                      <textarea
                        className="input-field"
                        rows="3"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="btn-primary w-full sm:w-auto sm:ml-3">
                    {editingSensor ? 'Mettre à jour' : 'Ajouter'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sensors;
