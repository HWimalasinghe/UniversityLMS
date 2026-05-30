import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Building2, Users, LayoutDashboard, LogOut, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Faculties', path: '/admin/faculties', icon: Building2 },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Requests', path: '/admin/requests', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              {/* Logo / Title */}
              <div className="flex items-center gap-2 text-indigo-600">
                <Building2 className="h-7 w-7" />
                <span className="text-xl font-bold hidden sm:block">Admin Portal</span>
              </div>
              
              {/* Desktop Nav Items */}
              <div className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        isActive 
                          ? 'bg-indigo-50 text-indigo-700' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-700' : 'text-gray-400'}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right Side (Profile & Logout) */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
                  A
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">Admin User</span>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:block">Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Items */}
        <div className="md:hidden border-t border-gray-200 overflow-x-auto">
          <div className="flex p-2 space-x-1 min-w-max">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                    isActive 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-700' : 'text-gray-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {navItems.find(i => i.path === location.pathname)?.name || 'Admin Panel'}
          </h1>
        </header>
        <div className="bg-transparent">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
