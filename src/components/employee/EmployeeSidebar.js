import {
  LayoutDashboard,
  User,
  Clock,
  Calendar,
  DollarSign,
  GraduationCap,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function EmployeeSidebar({ currentPage, setCurrentPage, collapsed, setCollapsed }) {
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', label: 'Trang chủ', icon: LayoutDashboard },
    { id: 'profile', label: 'Hồ sơ của tôi', icon: User },
    { id: 'attendance', label: 'Chấm công', icon: Clock },
    { id: 'leave', label: 'Nghỉ phép', icon: Calendar },
    { id: 'payroll', label: 'Lương & Thưởng', icon: DollarSign },
    { id: 'training', label: 'Đào tạo', icon: GraduationCap },
    { id: 'tasks', label: 'Công việc', icon: FileText },
    { id: 'documents', label: 'Tài liệu', icon: Calendar },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ];

const handleLogout = () => {
  const confirmLogout = window.confirm("Bạn có chắc muốn đăng xuất không?");
  if (confirmLogout) {
    // Xóa token và user info
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login'); // redirect về login Employee
  }
};


  return (
    <div className={`bg-gradient-to-b from-green-700 to-green-900 text-white transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} flex flex-col`}>
      <div className="p-6 flex items-center justify-between border-b border-green-600">
        {!collapsed && (
          <div>
            <h1 className="text-white">HRMS Portal</h1>
            <p className="text-green-200 text-xs mt-1">Nhân viên</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 hover:bg-green-600 rounded"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-3 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg mb-1 transition-colors ${isActive
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'text-green-100 hover:bg-green-800'
                }`}
              title={collapsed ? item.label : ''}
            >
              <Icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-green-600">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 text-green-100 hover:bg-green-800 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          {!collapsed && <span>Đăng xuất</span>}
        </button>
      </div>

    </div>
  );
}
