import { Search, Mail, LogOut, Menu } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { employeeApi } from '../api/employeeApi';
import AdminNotificationBell from './notifications/AdminNotificationBell';

export function Header({ onLogout, onOpenSidebar, showMenuButton }) {
  console.log('AdminHeader props:', { showMenuButton, onOpenSidebar: !!onOpenSidebar });

  const [me, setMe] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await employeeApi.getMe();
        const data = res?.data || null;
        setMe(data);
        if (data) {
          try {
            localStorage.setItem('user', JSON.stringify(data));
          } catch (_) {
            // ignore
          }
        }
      } catch (e) {
        console.error('Lỗi tải thông tin admin:', e);
      }
    };
    load();
  }, []);

  const fullName = me?.fullName || me?.username || 'Admin';
  const roleLabel = me?.role === 'HR' ? 'Nhân sự' : 'Quản trị viên';
  const avatarUrl = me?.avatarUrl || '';

  const initials = useMemo(() => {
    const s = (fullName || '').trim();
    if (!s) return 'AD';
    const parts = s.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] || '';
    const last = parts[parts.length - 1]?.[0] || '';
    const val = `${first}${last}`.toUpperCase();
    return val || 'AD';
  }, [fullName]);
  
  const handleLogout = () => {
    const confirmed = window.confirm("Bạn có chắc muốn đăng xuất không?");
    if (confirmed && onLogout) {
      onLogout();
    }
  };

  return (
    <header className="bg-white text-black border-b border-gray-200 px-4 py-3 md:px-6 md:py-4 relative z-10">
      <div className="flex items-center justify-between">
        {showMenuButton && (
          <button
            type="button"
            aria-label="Open sidebar"
            onClick={() => {
              console.log('AdminHeader menu button clicked!');
              onOpenSidebar && onOpenSidebar();
            }}
            className="mr-3 inline-flex items-center justify-center rounded-lg p-2 hover:bg-gray-100"
          >
            <Menu size={20} className="text-black" />
          </button>
        )}

        {/* Search box */}
        <div className="hidden md:block flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/70" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm nhân viên, phòng ban..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Icons và profile */}
        <div className="flex items-center gap-2 md:gap-4 md:ml-4">
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Mail size={20} className="text-black" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <AdminNotificationBell />

          <div className="flex items-center gap-3 pl-3 md:pl-4 border-l border-gray-300">
            <div className="hidden md:block text-right">
              <div className="text-black">{fullName}</div>
              <div className="text-xs text-black/70">{roleLabel}</div>
            </div>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-sm font-semibold">{initials}</span>
              )}
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="ml-4 flex items-center gap-1 text-red-700 hover:text-red-600"
            >
              <LogOut size={18} />
              <span className="hidden md:inline">Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
