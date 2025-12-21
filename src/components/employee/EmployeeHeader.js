import { Mail, User, Menu } from 'lucide-react';
import EmployeeNotificationBell from '../notifications/EmployeeNotificationBell';

export default function EmployeeHeader({ isMobile, onOpenSidebar }) {
  console.log('EmployeeHeader props:', { isMobile, onOpenSidebar: !!onOpenSidebar });
  
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
    <header className="bg-white border-b border-gray-200 px-3 py-2 md:px-4 md:py-3 relative z-10">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {isMobile && (
            <button
              type="button"
              aria-label="Open sidebar"
              onClick={() => {
                console.log('EmployeeHeader menu button clicked!');
                onOpenSidebar && onOpenSidebar();
              }}
              className="inline-flex items-center justify-center rounded-lg p-2 hover:bg-gray-100 flex-shrink-0"
            >
              <Menu size={20} className="text-gray-600" />
            </button>
          )}
          <div className="min-w-0">
            <h2 className="text-gray-800 text-sm md:text-sm font-semibold truncate">Chào bạn, {fullName}!</h2>
            <p className="hidden md:block text-xs text-gray-500">{dateLabel}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          <button className="relative p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <Mail size={18} className="text-gray-600" />
          </button>

          <EmployeeNotificationBell />

          <div className="flex items-center gap-2 pl-2 md:pl-3 border-l border-gray-200">
            <div className="hidden md:block text-right min-w-0">
              <div className="text-gray-800 text-xs font-medium truncate max-w-xs">{fullName}</div>
              <div className="text-xs text-gray-500 truncate max-w-xs">{position}</div>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center flex-shrink-0">
              <User size={16} className="text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
