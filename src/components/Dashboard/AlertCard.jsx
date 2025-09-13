import React from 'react';
import { AlertTriangle, Clock, Package, Stethoscope, Zap, CheckCircle, Sparkles } from 'lucide-react';

const AlertCard = ({ alerts, onViewDetails }) => {
  const getAlertIcon = (type) => {
    switch (type) {
      case 'expiry':
        return Clock;
      case 'low-stock':
        return Package;
      case 'restock':
        return AlertTriangle;
      case 'prescription':
        return Stethoscope;
      default:
        return AlertTriangle;
    }
  };

  const getAlertColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'from-red-500 via-pink-500 to-rose-500 text-white';
      case 'medium':
        return 'from-yellow-500 via-orange-500 to-red-500 text-white';
      case 'low':
        return 'from-blue-500 via-indigo-500 to-purple-500 text-white';
      default:
        return 'from-gray-500 to-gray-600 text-white';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="h-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Smart Alerts</h3>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-green-600">All Clear</span>
          </div>
        </div>
        <div className="text-center py-12 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-3xl"></div>
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h4 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
              All Clear!
            </h4>
            <p className="text-gray-600 text-lg mb-2">No alerts at this time</p>
            <p className="text-sm text-gray-500">Your pharmacy is running smoothly!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Smart Alerts</h3>
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          <span className="text-sm font-medium text-gray-600">{alerts.length} Active</span>
        </div>
      </div>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {alerts.map((alert) => {
          const Icon = getAlertIcon(alert.type);
          const colorClass = getAlertColor(alert.priority);
          const badgeClass = getPriorityBadge(alert.priority);
          
          return (
            <div
              key={alert.id}
              className={`bg-gradient-to-r ${colorClass} rounded-2xl p-6 cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 relative overflow-hidden group`}
              onClick={() => onViewDetails(alert.type)}
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12 group-hover:scale-110 transition-transform duration-500"></div>
              
              <div className="relative flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-xl">{alert.title}</h4>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm ${badgeClass}`}>
                          {alert.priority.toUpperCase()}
                        </span>
                        <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-lg font-bold shadow-lg">
                          {alert.count}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm opacity-90 leading-relaxed mb-4">{alert.message}</p>
                    <div className="flex items-center">
                      <span className="text-xs bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full font-medium shadow-lg group-hover:bg-white/30 transition-colors">
                        Click to view details →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {alerts.length > 3 && (
        <div className="mt-6 text-center">
          <button className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-sm font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
            View All Alerts ({alerts.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default AlertCard;