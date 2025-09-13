import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color, trend, gradient = true }) => {
  const colorClasses = {
    blue: {
      bg: gradient ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600' : 'bg-blue-50',
      icon: gradient ? 'bg-white/20 backdrop-blur-sm' : 'bg-blue-100 text-blue-600',
      border: 'border-blue-200',
      text: gradient ? 'text-white' : 'text-gray-800',
      subtext: gradient ? 'text-blue-100' : 'text-gray-600',
      decoration: 'from-blue-400/20 to-indigo-400/20',
    },
    green: {
      bg: gradient ? 'bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600' : 'bg-green-50',
      icon: gradient ? 'bg-white/20 backdrop-blur-sm' : 'bg-green-100 text-green-600',
      border: 'border-green-200',
      text: gradient ? 'text-white' : 'text-gray-800',
      subtext: gradient ? 'text-green-100' : 'text-gray-600',
      decoration: 'from-green-400/20 to-teal-400/20',
    },
    yellow: {
      bg: gradient ? 'bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500' : 'bg-yellow-50',
      icon: gradient ? 'bg-white/20 backdrop-blur-sm' : 'bg-yellow-100 text-yellow-600',
      border: 'border-yellow-200',
      text: gradient ? 'text-white' : 'text-gray-800',
      subtext: gradient ? 'text-yellow-100' : 'text-gray-600',
      decoration: 'from-yellow-400/20 to-orange-400/20',
    },
    red: {
      bg: gradient ? 'bg-gradient-to-br from-red-500 via-pink-500 to-rose-500' : 'bg-red-50',
      icon: gradient ? 'bg-white/20 backdrop-blur-sm' : 'bg-red-100 text-red-600',
      border: 'border-red-200',
      text: gradient ? 'text-white' : 'text-gray-800',
      subtext: gradient ? 'text-red-100' : 'text-gray-600',
      decoration: 'from-red-400/20 to-pink-400/20',
    },
    purple: {
      bg: gradient ? 'bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-600' : 'bg-purple-50',
      icon: gradient ? 'bg-white/20 backdrop-blur-sm' : 'bg-purple-100 text-purple-600',
      border: 'border-purple-200',
      text: gradient ? 'text-white' : 'text-gray-800',
      subtext: gradient ? 'text-purple-100' : 'text-gray-600',
      decoration: 'from-purple-400/20 to-violet-400/20',
    },
    indigo: {
      bg: gradient ? 'bg-gradient-to-br from-indigo-500 via-blue-600 to-purple-600' : 'bg-indigo-50',
      icon: gradient ? 'bg-white/20 backdrop-blur-sm' : 'bg-indigo-100 text-indigo-600',
      border: 'border-indigo-200',
      text: gradient ? 'text-white' : 'text-gray-800',
      subtext: gradient ? 'text-indigo-100' : 'text-gray-600',
      decoration: 'from-indigo-400/20 to-blue-400/20',
    },
    pink: {
      bg: gradient ? 'bg-gradient-to-br from-pink-500 via-rose-500 to-red-500' : 'bg-pink-50',
      icon: gradient ? 'bg-white/20 backdrop-blur-sm' : 'bg-pink-100 text-pink-600',
      border: 'border-pink-200',
      text: gradient ? 'text-white' : 'text-gray-800',
      subtext: gradient ? 'text-pink-100' : 'text-gray-600',
      decoration: 'from-pink-400/20 to-rose-400/20',
    },
  };

  const classes = colorClasses[color];

  return (
    <div className={`${classes.bg} ${gradient ? '' : classes.border + ' border'} rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 relative overflow-hidden group`}>
      {/* Background decoration */}
      {gradient && (
        <>
          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${classes.decoration} rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500`}></div>
          <div className={`absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br ${classes.decoration} rounded-full -ml-12 -mb-12 group-hover:scale-110 transition-transform duration-500`}></div>
        </>
      )}
      
      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <p className={`${classes.subtext} text-sm font-semibold mb-2 tracking-wide uppercase`}>{title}</p>
          <p className={`${classes.text} text-4xl font-bold mb-3 group-hover:scale-105 transition-transform duration-300`}>{value}</p>
          {trend && (
            <div className="flex items-center">
              <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                trend.value >= 0 
                  ? gradient ? 'bg-white/20 text-white backdrop-blur-sm' : 'bg-green-100 text-green-700'
                  : gradient ? 'bg-white/20 text-white backdrop-blur-sm' : 'bg-red-100 text-red-700'
              }`}>
                {trend.value >= 0 ? '+' : ''}{trend.value}%
              </span>
              <span className={`text-xs ml-2 ${classes.subtext} font-medium`}>{trend.label}</span>
            </div>
          )}
        </div>
        <div className={`${classes.icon} p-4 rounded-2xl ${gradient ? 'text-white shadow-xl' : ''} group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;