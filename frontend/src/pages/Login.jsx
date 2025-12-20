import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Leaf, Shield, Activity } from 'lucide-react';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(credentials);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <Leaf className="h-8 w-8 text-green-600" />
            <span className="ml-2 text-2xl font-bold text-gray-900">IoT Agricole</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Info */}
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Gestion Intelligente de vos Capteurs Agricoles
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Surveillez en temps réel vos cultures avec notre plateforme IoT sécurisée.
              Collecte de données, alertes automatiques et visualisation intuitive.
            </p>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-2">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Surveillance en temps réel</h3>
                  <p className="text-gray-600">Température, humidité, luminosité - toutes vos données en un coup d'œil</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 bg-green-100 rounded-lg p-2">
                  <Leaf className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Alertes intelligentes</h3>
                  <p className="text-gray-600">Soyez notifié automatiquement en cas de valeurs anormales</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 bg-purple-100 rounded-lg p-2">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Sécurité maximale</h3>
                  <p className="text-gray-600">Chiffrement AES-256 et authentification JWT</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Login Form */}
          <div>
            <div className="bg-white rounded-lg shadow-xl p-8 border border-gray-200">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Connexion</h2>
                <p className="text-gray-600">Accédez à votre tableau de bord</p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <p className="font-medium">{error}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="username" className="label">
                    Nom d'utilisateur
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="input-field"
                    placeholder="Entrez votre nom d'utilisateur"
                    value={credentials.username}
                    onChange={(e) =>
                      setCredentials({ ...credentials, username: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label htmlFor="password" className="label">
                    Mot de passe
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="input-field"
                    placeholder="Entrez votre mot de passe"
                    value={credentials.password}
                    onChange={(e) =>
                      setCredentials({ ...credentials, password: e.target.value })
                    }
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary flex items-center justify-center"
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  {loading ? 'Connexion...' : 'Se connecter'}
                </button>

                <div className="text-sm text-center">
                  <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
                    Pas encore de compte? S'inscrire →
                  </Link>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-gray-700 font-semibold mb-2">🔑 Compte de démonstration:</p>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600"><span className="font-medium">Username:</span> admin</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Password:</span> admin123</p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-sm text-gray-500">
        <p>© 2025 IoT Agricole - Plateforme sécurisée de gestion de capteurs</p>
      </div>
    </div>
  );
};

export default Login;
