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

export function Sidebar({ currentPage, setCurrentPage, collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
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

  return (
    <aside
      className={`bg-blue-900 text-white flex flex-col transition-transform duration-300 z-40
        fixed inset-y-0 left-0 w-64 transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:inset-auto md:transform-none md:transition-all
        ${collapsed ? 'md:w-20' : 'md:w-64'}`}
    >
      
      {/* Header + Collapse button */}
      <div className="p-4 md:p-6 flex items-center justify-between">
        {!collapsed && <h1 className="text-lg font-bold">HRMS Admin</h1>}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileOpen && setMobileOpen(false)}
            className="p-1 hover:bg-blue-800 rounded md:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 hover:bg-blue-800 rounded hidden md:inline-flex"
            aria-label="Toggle collapse"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>

      {/* Menu items */}
      <nav className="flex-1 px-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex items-center w-full gap-3 px-3 py-3 rounded-lg mb-1 transition-colors duration-200
                ${isActive ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-800'}`}
              title={collapsed ? item.label : ''}
            >
              <Icon size={20} />
              {!collapsed && <span className="hidden md:inline">{item.label}</span>}
              <span className="md:hidden">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-blue-800">
        {!collapsed && (
          <div className="text-xs text-blue-300">
            © 2025 HRMS System
          </div>
        )}
      </div>
    </aside>
  );
}
