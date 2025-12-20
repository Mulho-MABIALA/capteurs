import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Activity, LogIn, Leaf, Droplets, Sun } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-emerald-50 to-green-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Floating elements decoration */}
      <div className="absolute top-20 left-10 opacity-20">
        <Leaf className="h-24 w-24 text-green-500 animate-bounce" style={{animationDuration: '3s'}} />
      </div>
      <div className="absolute bottom-20 right-10 opacity-20">
        <Droplets className="h-20 w-20 text-blue-500 animate-bounce" style={{animationDuration: '4s'}} />
      </div>
      <div className="absolute top-40 right-20 opacity-20">
        <Sun className="h-16 w-16 text-yellow-500 animate-pulse" />
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full blur-2xl opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-emerald-600 p-4 rounded-2xl shadow-2xl">
                <Activity className="h-16 w-16 text-white" />
              </div>
            </div>
          </div>
          <h2 className="mt-6 text-center text-4xl font-extrabold">
            <span className="gradient-text">Plateforme IoT Agricole</span>
          </h2>
          <p className="mt-3 text-center text-base text-gray-600 font-medium">
            Gestion intelligente de vos capteurs agricoles
          </p>
        </div>

        <div className="glass-card">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow-md animate-shake">
                <p className="font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="username" className="label text-gray-700">
                  Nom d'utilisateur
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="input-field shadow-sm"
                  placeholder="Entrez votre nom d'utilisateur"
                  value={credentials.username}
                  onChange={(e) =>
                    setCredentials({ ...credentials, username: e.target.value })
                  }
                />
              </div>

              <div>
                <label htmlFor="password" className="label text-gray-700">
                  Mot de passe
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="input-field shadow-sm"
                  placeholder="Entrez votre mot de passe"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center"
              >
                <LogIn className="h-5 w-5 mr-2" />
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </div>

            <div className="text-sm text-center">
              <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Pas encore de compte? S'inscrire →
              </Link>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl border border-blue-100">
              <p className="text-sm text-gray-700 font-semibold mb-2">🔑 Compte de test:</p>
              <div className="space-y-1">
                <p className="text-sm text-gray-600"><span className="font-medium">Username:</span> admin</p>
                <p className="text-sm text-gray-600"><span className="font-medium">Password:</span> admin123</p>
              </div>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-gray-500">
          Plateforme sécurisée avec chiffrement AES-256 et authentification JWT
        </p>
      </div>
    </div>
  );
};

export default Login;
