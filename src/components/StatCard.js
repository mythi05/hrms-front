import { TrendingUp, TrendingDown } from 'lucide-react';

export function StatCard({ title, value, change, trend, icon: Icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600',
  };

  const trendColorClasses = {
    up: 'text-green-600',
    down: 'text-red-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
        <div className={`flex items-center gap-1 text-xs ${trendColorClasses[trend]}`}>
          {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span>{change}</span>
        </div>
      </div>
      <div className="text-gray-600 text-xs mb-1">{title}</div>
      <div className="text-gray-900">{value}</div>
    </div>
  );
}
