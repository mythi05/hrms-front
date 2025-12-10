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
  ChevronRight
} from 'lucide-react';

export function Sidebar({ currentPage, setCurrentPage, collapsed, setCollapsed }) {
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
    <aside className={`bg-blue-900 text-white flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      
      {/* Header + Collapse button */}
      <div className="p-6 flex items-center justify-between">
        {!collapsed && <h1 className="text-lg font-bold">HRMS Admin</h1>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 hover:bg-blue-800 rounded"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
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
              {!collapsed && <span>{item.label}</span>}
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
