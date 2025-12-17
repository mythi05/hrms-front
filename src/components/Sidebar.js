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
  Settings,
  Building2,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

export function Sidebar({ currentPage, setCurrentPage, collapsed, setCollapsed, mobileOpen, setMobileOpen, isMobile }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Nhân viên', icon: Users },
    { id: 'departments', label: 'Phòng ban', icon: Building2 },
    { id: 'attendance', label: 'Chấm công', icon: Clock },
    { id: 'leave', label: 'Nghỉ phép', icon: Calendar },
    { id: 'payroll', label: 'Lương', icon: DollarSign },
    { id: 'tasks', label: 'Giao việc', icon: FileText },
    { id: 'recruitment', label: 'Tuyển dụng', icon: UserPlus },
    { id: 'performance', label: 'Hiệu suất', icon: TrendingUp },
    { id: 'training', label: 'Đào tạo', icon: GraduationCap },
    { id: 'reports', label: 'Báo cáo', icon: FileText },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ];

  const drawerClass = isMobile
    ? `fixed inset-y-0 left-0 w-64 transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`
    : `static inset-auto transform-none transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`;

  return (
    <aside
      className={`bg-gradient-to-b from-blue-800 to-blue-950 text-white flex flex-col z-40 ${drawerClass}`}
    >
      
      {/* Header + Collapse button */}
      <div className="p-4 md:p-6 flex items-center justify-between border-b border-blue-700">
        {!collapsed && <h1 className="text-lg font-bold">HRMS Admin</h1>}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileOpen && setMobileOpen(false)}
            className={`p-1 hover:bg-blue-800 rounded ${isMobile ? '' : 'hidden'}`}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className={`p-1 hover:bg-blue-800 rounded ${isMobile ? 'hidden' : 'inline-flex'}`}
            aria-label="Toggle collapse"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>

      {/* Menu items */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg mb-1 transition-colors duration-200
                ${isActive ? 'bg-blue-700 text-white shadow-lg' : 'text-blue-100 hover:bg-blue-900/40'}`}
              title={collapsed ? item.label : ''}
            >
              <Icon size={20} className="shrink-0" />
              {(!collapsed || isMobile) && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-blue-700">
        {!collapsed && (
          <div className="text-xs text-blue-300">
            © 2025 HRMS System
          </div>
        )}
      </div>
    </aside>
  );
}
