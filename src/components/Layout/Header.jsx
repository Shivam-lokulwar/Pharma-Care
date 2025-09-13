import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, LogOut, Search, Settings, Sparkles, Zap, X, Activity } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { getMedicines } from '../../utils/storage';

const Header = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim()) {
      const medicines = getMedicines();
      const filtered = medicines.filter(medicine =>
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 8);
      setSearchResults(filtered);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchTerm]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      if (!target.closest('.dropdown-container')) {
        setShowNotifications(false);
        setShowProfile(false);
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowProfile(false);
    try {
      logout();
    } catch (error) {
      console.error('Logout error:', error);
      window.location.replace('/login');
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    setShowNotifications(false);
    
    switch (notification.type) {
      case 'expiry':
        navigate('/inventory?filter=expiry');
        break;
      case 'low-stock':
        navigate('/inventory?filter=low-stock');
        break;
      case 'prescription':
        navigate('/prescriptions');
        break;
      default:
        break;
    }
  };

  const handleSearchResultClick = (medicine) => {
    navigate('/inventory');
    setSearchTerm('');
    setShowSearchResults(false);
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowProfile(false);
    setShowSearchResults(false);
  };

  const toggleProfile = () => {
    setShowProfile(!showProfile);
    setShowNotifications(false);
    setShowSearchResults(false);
  };

  return (
    <>
      <header className="bg-white/95 backdrop-blur-xl border-b border-gray-200/50 px-6 py-4 sticky top-0 z-30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-purple-50/20 to-pink-50/30"></div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/5 to-purple-400/5 rounded-full -mr-20 -mt-20"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">PharmaCare</h2>
                <p className="text-gray-600 text-sm">Management System</p>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="hidden md:flex items-center relative dropdown-container">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <input
                  type="text"
                  placeholder="Search medicines, categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => searchTerm && setShowSearchResults(true)}
                  className="pl-12 pr-10 py-3 w-80 bg-white/80 border border-gray-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 backdrop-blur-sm shadow-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setShowSearchResults(false);
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative dropdown-container">
              <button
                onClick={toggleNotifications}
                className="relative p-3 text-gray-600 hover:text-gray-800 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-2xl transition-all duration-200 group"
              >
                <Bell className="w-6 h-6 group-hover:scale-110 transition-transform" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Settings */}
            <button 
              onClick={handleSettingsClick}
              className="p-3 text-gray-600 hover:text-gray-800 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-2xl transition-all duration-200 group"
            >
              <Settings className="w-6 h-6 group-hover:scale-110 group-hover:rotate-90 transition-all duration-300" />
            </button>

            {/* Profile */}
            <div className="relative dropdown-container">
              <button
                onClick={toggleProfile}
                className="flex items-center space-x-3 p-2 text-gray-600 hover:text-gray-800 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-2xl transition-all duration-200 group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-105 transition-transform">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="font-semibold text-gray-800">{user?.name || 'Admin User'}</p>
                  <p className="text-xs text-gray-500">{user?.role || 'admin'}</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Results Dropdown */}
      {showSearchResults && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 z-50 max-h-96 overflow-y-auto">
          {searchResults.length > 0 ? (
            <div className="p-2">
              <div className="px-4 py-3 text-sm font-semibold text-gray-700 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                Found {searchResults.length} medicine(s)
              </div>
              {searchResults.map((medicine) => (
                <button
                  key={medicine.id}
                  onClick={() => handleSearchResultClick(medicine)}
                  className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-200 group border-b border-gray-50 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 group-hover:text-blue-600 mb-1">
                        {medicine.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {medicine.category} • {medicine.supplier}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-medium text-gray-800 mb-1">
                        Stock: {medicine.quantity}
                      </p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        medicine.status === 'in-stock' ? 'bg-green-100 text-green-800' :
                        medicine.status === 'low-stock' ? 'bg-yellow-100 text-yellow-800' :
                        medicine.status === 'expiring-soon' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {medicine.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No medicines found</p>
              <p className="text-sm">Try searching with different keywords</p>
            </div>
          )}
        </div>
      )}

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="fixed top-20 right-6 w-96 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 z-50 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Bell className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="font-bold text-gray-800 text-lg">Notifications</h3>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-gray-600 text-sm">You have {unreadCount} unread notifications</p>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.slice(0, 5).map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 ${
                    !notification.read ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <h4 className="font-semibold text-gray-800 mb-1">{notification.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                  <span className="text-xs text-gray-500">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            )}
          </div>
          {notifications.length > 5 && (
            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 text-center border-t border-gray-100">
              <button 
                onClick={() => {
                  setShowNotifications(false);
                  navigate('/notifications');
                }}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}

      {/* Profile Dropdown */}
      {showProfile && (
        <div className="fixed top-20 right-6 w-72 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 z-50 overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-b border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 text-lg">Profile</h3>
                <button
                  onClick={() => setShowProfile(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg text-xl">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800 text-lg">{user?.name || 'Admin User'}</p>
                  <p className="text-sm text-gray-600 mb-2">{user?.email || 'admin@pharmacare.com'}</p>
                  <span className="inline-block px-3 py-1 text-xs bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-medium">
                    {(user?.role || 'admin').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-3">
            <button
              onClick={() => {
                setShowProfile(false);
                navigate('/settings');
              }}
              className="flex items-center space-x-3 w-full px-4 py-3 text-left text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-2xl transition-all duration-200 group mb-2"
            >
              <Settings className="w-5 h-5 group-hover:scale-110 group-hover:rotate-90 transition-all duration-300" />
              <span className="font-medium">Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-4 py-3 text-left text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 rounded-2xl transition-all duration-200 group"
            >
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Backdrop overlay */}
      {(showNotifications || showProfile || showSearchResults) && (
        <div 
          className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40"
          onClick={() => {
            setShowNotifications(false);
            setShowProfile(false);
            setShowSearchResults(false);
          }}
        />
      )}
    </>
  );
};

export default Header;