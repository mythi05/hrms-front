import React from "react";
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  Calendar, 
  DollarSign, 
  UserPlus, 
  TrendingUp, 
  GraduationCap,
  FileText,
  Bell,
  Settings,
  Building2,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

export function Sidebar({ currentPage, setCurrentPage, collapsed, setCollapsed, mobileOpen, setMobileOpen, isMobile }) {
  console.log('AdminSidebar state:', { isMobile, mobileOpen, currentPage, setMobileOpen: typeof setMobileOpen });
  
  // Add CSS to hide scrollbar
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .sidebar-scroll::-webkit-scrollbar {
        display: none;
      }
      .sidebar-scroll {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Nhân viên', icon: Users },
    { id: 'departments', label: 'Phòng ban', icon: Building2 },
    { id: 'attendance', label: 'Chấm công', icon: Clock },
    { id: 'leave', label: 'Nghỉ phép', icon: Calendar },
    { id: 'payroll', label: 'Lương', icon: DollarSign },
    { id: 'tasks', label: 'Giao việc', icon: FileText },
    // { id: 'recruitment', label: 'Tuyển dụng', icon: UserPlus },
    { id: 'performance', label: 'Hiệu suất', icon: TrendingUp },
    { id: 'reports', label: 'Quản lý tài liệu', icon: FileText },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ];

  const drawerClass = isMobile
    ? `fixed inset-y-0 left-0 w-80 max-w-[85vw] transform transition-transform duration-300 ease-in-out z-50 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`
    : `relative flex-shrink-0 transition-all duration-300 ease-in-out ${collapsed ? 'w-20' : 'w-64'}`;

  console.log('AdminSidebar drawerClass:', drawerClass);

  return (
    <>
      {isMobile && mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => {
            console.log('Admin overlay clicked!');
            setMobileOpen(false);
          }}
          className="fixed inset-0 z-40 bg-black/40"
        />
      )}
      <aside
        className={`bg-blue-900 text-white flex flex-col z-50 min-h-0 ${drawerClass}`}
        style={{
          background: isMobile 
            ? 'linear-gradient(to bottom, #1e40af, #1e3a8a)' 
            : undefined,
          transform: isMobile && !mobileOpen ? 'translateX(-100%)' : undefined
        }}
      >
      
      {/* Header + Collapse button */}
      <div className="p-4 md:p-6 flex items-center justify-between border-b border-blue-700">
        <h1
          className={`text-lg font-bold whitespace-nowrap overflow-hidden transition-all duration-200 ease-in-out ${collapsed && !isMobile ? 'max-w-0 opacity-0' : 'max-w-[160px] opacity-100'}`}
        >
          HRMS Admin
        </h1>
        <div className="flex items-center gap-2">
          {isMobile && (
            <button
              type="button"
              onClick={() => {
                console.log('Admin mobile close button clicked! Before:', mobileOpen);
                setMobileOpen(false);
                console.log('Admin sidebar close button called setMobileOpen(false)');
              }}
              className={`p-1 hover:bg-blue-800 rounded ${isMobile ? '' : 'hidden'}`}
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          )}
          {!isMobile && (
            <button
              onClick={() => {
                console.log('Admin desktop toggle clicked');
                setCollapsed(!collapsed);
              }}
              className={`p-1 hover:bg-blue-800 rounded ${isMobile ? 'hidden' : 'inline-flex'}`}
              aria-label="Toggle collapse"
            >
              {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          )}
        </div>
      </div>

      {/* Menu items */}
      <nav 
        className="flex-1 px-3 py-4 overflow-y-auto overscroll-contain min-h-0 sidebar-scroll"
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          const showLabel = !collapsed || isMobile;

          return (
            <button
              key={item.id}
              onClick={() => {
                setCurrentPage(item.id);
                if (isMobile) setMobileOpen && setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg mb-1 transition-colors ${
                isActive
                  ? 'bg-blue-700 text-white shadow-lg'
                  : 'text-blue-100 hover:bg-blue-900/40'
              }`}
              title={collapsed ? item.label : ''}
              style={{
                backgroundColor: isActive ? '#1d4ed8' : 'transparent',
                color: isActive ? 'white' : '#dbeafe'
              }}
            >
              <Icon size={20} className="flex-shrink-0" />
              {showLabel && <span className="truncate flex-1 text-left">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-blue-700">
        <div
          className={`text-xs text-blue-300 whitespace-nowrap overflow-hidden transition-all duration-200 ease-in-out ${collapsed && !isMobile ? 'max-w-0 opacity-0' : 'max-w-[220px] opacity-100'}`}
        >
          © 2025 HRMS System
        </div>
      </div>
    </aside>
    </>
  );
}
