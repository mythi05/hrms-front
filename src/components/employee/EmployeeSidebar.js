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
  ChevronRight,
  X,
  Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export function EmployeeSidebar({ currentPage, setCurrentPage, collapsed, setCollapsed, isMobile, mobileOpen, setMobileOpen }) {
  const navigate = useNavigate();

  console.log('EmployeeSidebar state:', {
    isMobile,
    mobileOpen,
    currentPage,
    setMobileOpen: typeof setMobileOpen
  });

  const menuItems = [
    { id: 'dashboard', label: 'Trang chủ', icon: LayoutDashboard },
    { id: 'profile', label: 'Hồ sơ', icon: User },
    { id: 'attendance', label: 'Chấm công', icon: Clock },
    { id: 'leave', label: 'Nghỉ phép', icon: Calendar },
    { id: 'payroll', label: 'Lương', icon: DollarSign },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'tasks', label: 'Công việc', icon: FileText },
    { id: 'performance', label: 'Hiệu suất', icon: Calendar },
    { id: 'documents', label: 'Tài liệu', icon: FileText },
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


  const drawerClass = isMobile
    ? `fixed inset-y-0 left-0 w-80 max-w-[85vw] transform transition-transform duration-300 ease-in-out z-50 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`
    : `relative bg-gradient-to-b from-green-700 to-green-900 text-white transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} flex flex-col`;

  console.log('EmployeeSidebar drawerClass:', drawerClass);

  return (
    <>
      {isMobile && mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => {
            console.log('Employee overlay clicked!');
            setMobileOpen(false);
          }}
          className="fixed inset-0 z-40 bg-black/40"
        />
      )}
      <div
        className={drawerClass}
        style={{
          background: isMobile
            ? 'linear-gradient(to bottom, #15803d, #14532d)'
            : undefined,
          transform: isMobile && !mobileOpen ? 'translateX(-100%)' : undefined
        }}
      >
        {isMobile && (
          <div className="p-4 flex items-center justify-between border-b border-green-600">
            <h1 className="text-lg font-bold">HRMS Portal</h1>
            <button
              type="button"
              onClick={() => {
                console.log('Employee sidebar close button clicked! Before:', mobileOpen);
                setMobileOpen(false);
                console.log('Employee sidebar close button called setMobileOpen(false)');
              }}
              className="p-1 hover:bg-green-600 rounded z-50 relative bg-red-500 border-2 border-yellow-400"
              aria-label="Close sidebar"
            >
              <X size={20} className="text-white" />
            </button>
          </div>
        )}
        {!isMobile && (
          <div className="p-4 md:p-6 flex items-center justify-between border-b border-green-600">
            <h1
              className={`text-lg font-bold whitespace-nowrap overflow-hidden transition-all duration-200 ease-in-out ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[160px] opacity-100'}`}
            >
              HRMS Portal
            </h1>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 hover:bg-green-600 rounded"
              aria-label="Toggle collapse"
            >
              {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>
        )}

        <nav className="flex-1 px-3 py-4 overflow-y-auto overscroll-contain min-h-0">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            const showLabel = !collapsed || isMobile;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  if (isMobile) setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg mb-1 transition-colors ${isActive
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'text-green-100 hover:bg-green-800'
                  }`}
                title={collapsed ? item.label : ''}
                style={{
                  backgroundColor: isActive ? '#059669' : 'transparent',
                  color: isActive ? 'white' : '#d1fae5'
                }}
              >
                <Icon size={20} className="flex-shrink-0" />
                {showLabel && <span className="truncate flex-1 text-left">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-green-600">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 text-green-100 hover:bg-green-800 rounded-lg transition-colors"
          >
            <LogOut size={20} className="flex-shrink-0" />
            {(!collapsed || isMobile) && <span className="truncate">Đăng xuất</span>}
          </button>
        </div>
      </div>
    </>
  );
}
