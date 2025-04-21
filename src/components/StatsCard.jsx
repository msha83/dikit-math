import React from 'react';

const StatsCard = ({ title, value, icon, color }) => {
  // Definisi warna untuk berbagai tipe statistik
  const colorClasses = {
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600'
  };
  
  const bgColorClass = colorClasses[color] || 'bg-gray-100 text-gray-600';
  
  return (
    <div className={`bg-white shadow rounded-lg p-5 transition-transform duration-200 hover:shadow-md`}>
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${bgColorClass} mr-4`}>
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCard; 