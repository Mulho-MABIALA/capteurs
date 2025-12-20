import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Home, Activity, Bell, Leaf } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">
                IoT Agricole
              </span>
            </Link>

            <div className="hidden md:ml-10 md:flex md:space-x-1">
              <Link
                to="/"
                className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                  isActive('/')
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Home className="h-4 w-4 mr-2" />
                Tableau de bord
              </Link>

              <Link
                to="/sensors"
                className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                  isActive('/sensors')
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Activity className="h-4 w-4 mr-2" />
                Capteurs
              </Link>

              <Link
                to="/alerts"
                className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                  isActive('/alerts')
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Bell className="h-4 w-4 mr-2" />
                Alertes
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-gray-100 px-4 py-2 rounded-lg">
              <User className="h-5 w-5 text-gray-600 mr-2" />
              <div>
                <span className="text-sm font-semibold text-gray-900 block">
                  {user?.username}
                </span>
                <span className="text-xs text-gray-600">
                  {user?.role === 'admin' ? 'Administrateur' : 'Technicien'}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-all"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
