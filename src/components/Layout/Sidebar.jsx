import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Pill, 
  FolderOpen, 
  Users, 
  ShoppingCart, 
  FileText, 
  Stethoscope,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Activity,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', color: 'from-blue-500 to-blue-600' },
    { path: '/inventory', icon: Pill, label: 'Inventory', color: 'from-green-500 to-green-600' },
    { path: '/categories', icon: FolderOpen, label: 'Categories', color: 'from-purple-500 to-purple-600' },
    { path: '/suppliers', icon: Users, label: 'Suppliers', color: 'from-orange-500 to-orange-600' },
    { path: '/sales', icon: ShoppingCart, label: 'Sales', color: 'from-emerald-500 to-emerald-600' },
    { path: '/prescriptions', icon: Stethoscope, label: 'Prescriptions', color: 'from-pink-500 to-pink-600' },
    { path: '/reports', icon: FileText, label: 'Reports', color: 'from-indigo-500 to-indigo-600' },
    { path: '/settings', icon: Settings, label: 'Settings', color: 'from-gray-500 to-gray-600' },
  ];

  const handleLogout = () => {
    try {
      logout();
    } catch (error) {
      console.error('Logout error:', error);
      window.location.replace('/login');
    }
  };

  return (
    <div className={`bg-white/90 backdrop-blur-xl border-r border-gray-200/50 transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-72'
    } h-screen flex flex-col shadow-2xl relative overflow-hidden`}>
      
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/5 to-purple-400/5 rounded-full -mr-16 -mt-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-purple-400/5 to-pink-400/5 rounded-full -ml-12 -mb-12"></div>

      {/* Header */}
      <div className="relative p-6 border-b border-gray-200/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  PharmaCare
                </h1>
                <p className="text-xs text-gray-500 flex items-center">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Management System
                </p>
              </div>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-2 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 group"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex items-center space-x-4 px-4 py-3 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                isActive
                  ? `bg-gradient-to-r ${item.color} text-white shadow-xl transform scale-105`
                  : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-gray-800'
              }`}
              title={isCollapsed ? item.label : ''}
            >
              {/* Background decoration for active item */}
              {isActive && (
                <div className="absolute inset-0 bg-white/10 rounded-2xl"></div>
              )}
              
              <div className={`relative p-2 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-white/20 shadow-lg' 
                  : 'bg-gray-100 group-hover:bg-gray-200 group-hover:scale-110'
              }`}>
                <Icon className={`w-5 h-5 transition-all duration-200 ${
                  isActive ? 'text-white' : 'text-gray-600 group-hover:text-gray-800'
                }`} />
              </div>
              
              {!isCollapsed && (
                <div className="relative flex-1 flex items-center justify-between">
                  <span className="font-semibold">{item.label}</span>
                  {isActive && (
                    <div className="w-2 h-2 bg-white rounded-full shadow-lg animate-pulse"></div>
                  )}
                </div>
              )}
            </Link>
          );
        })}
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="group flex items-center space-x-4 px-4 py-3 rounded-2xl transition-all duration-300 relative overflow-hidden text-gray-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700 w-full"
          title={isCollapsed ? 'Logout' : ''}
        >
          <div className="relative p-2 rounded-xl transition-all duration-200 bg-gray-100 group-hover:bg-red-100 group-hover:scale-110">
            <LogOut className="w-5 h-5 transition-all duration-200 text-gray-600 group-hover:text-red-700" />
          </div>
          
          {!isCollapsed && (
            <div className="relative flex-1 flex items-center justify-between">
              <span className="font-semibold">Logout</span>
            </div>
          )}
        </button>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="relative p-4 border-t border-gray-200/50">
          <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-4 relative overflow-hidden border border-blue-200/30">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full -mr-8 -mt-8"></div>
            <div className="relative">
              <div className="flex items-center mb-2">
                <Sparkles className="w-4 h-4 text-blue-600 mr-2" />
                <h4 className="font-semibold text-gray-800 text-sm">Need Help?</h4>
              </div>
              <p className="text-xs text-gray-600 mb-3">Contact our support team for assistance</p>
              <button className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-sm py-2 rounded-xl hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Get Support
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;