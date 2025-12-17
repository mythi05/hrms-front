import { Mail, User } from 'lucide-react';
import EmployeeNotificationBell from '../notifications/EmployeeNotificationBell';

export default function EmployeeHeader() {
  const user = (() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const fullName = user?.fullName || user?.username || 'Nhân viên';
  const position = user?.position || 'Nhân viên';

  const now = new Date();
  const dateLabel = now.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 md:px-6 md:py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-gray-800 text-sm md:text-base font-semibold truncate">Chào bạn, {fullName}!</h2>
          <p className="hidden md:block text-xs text-gray-500 mt-1">Hôm nay là {dateLabel}</p>
        </div>

        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Mail size={20} className="text-gray-600" />
          </button>

          <EmployeeNotificationBell />

          <div className="flex items-center gap-3 pl-3 md:pl-4 border-l border-gray-200">
            <div className="hidden md:block text-right">
              <div className="text-gray-800 text-sm font-medium">{fullName}</div>
              <div className="text-xs text-gray-500 truncate max-w-xs">{position}</div>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
