import { Search, Bell, Mail, User, LogOut } from 'lucide-react';

export function Header({ onLogout }) {
  const handleLogout = () => {
    const confirmed = window.confirm("Bạn có chắc muốn đăng xuất không?");
    if (confirmed && onLogout) {
      onLogout();
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search box */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm nhân viên, phòng ban..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Icons và profile */}
        <div className="flex items-center gap-4 ml-4">
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Mail size={20} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="text-right">
              <div className="text-gray-800">Nguyễn Văn A</div>
              <div className="text-xs text-gray-500">Quản trị viên</div>
            </div>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="ml-4 flex items-center gap-1 text-red-600 hover:text-red-800"
            >
              <LogOut size={18} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
