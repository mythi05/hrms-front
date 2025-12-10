import { UserPlus, UserCheck, Calendar, DollarSign, Clock } from 'lucide-react';

export function RecentActivities({ activities = [] }) {
  const getIconAndColor = (type) => {
    switch (type) {
      case 'attendance':
        return { icon: UserCheck, color: 'green' };
      case 'leave':
        return { icon: Calendar, color: 'orange' };
      case 'payroll':
        return { icon: DollarSign, color: 'purple' };
      case 'employee':
        return { icon: UserPlus, color: 'blue' };
      default:
        return { icon: Clock, color: 'gray' };
    }
  };

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600',
    gray: 'bg-gray-100 text-gray-600',
  };

  const formatTime = (timeString) => {
    try {
      const date = new Date(timeString);
      const now = new Date();
      const diffMs = now - date;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0) {
        return `${diffDays} ngày trước`;
      } else if (diffHours > 0) {
        return `${diffHours} giờ trước`;
      } else {
        return 'Vừa xong';
      }
    } catch {
      return timeString;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="mb-4">Hoạt động gần đây</h3>
      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-gray-500 text-sm">Chưa có hoạt động nào</div>
        ) : (
          activities.slice(0, 10).map((activity, index) => {
            const { icon: Icon, color } = getIconAndColor(activity.type);
            return (
              <div key={index} className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <div className="text-gray-800">{activity.action}</div>
                  <div className="text-xs text-gray-600">
                    {activity.employeeName ? `${activity.employeeName} - ` : ''}{activity.action}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{formatTime(activity.time || activity.date)}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
