import React, { useState } from 'react';
import { Users, Bell, Lock, Globe, Palette, HelpCircle, Shield, Database, Settings, Building2, ChevronRight } from 'lucide-react';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');

  const menuItems = [
    { id: 'general', label: 'Cài đặt chung', icon: Settings },
    { id: 'company', label: 'Thông tin công ty', icon: Building2 },
    { id: 'users', label: 'Quản lý người dùng', icon: Users },
    { id: 'notifications', label: 'Thông báo hệ thống', icon: Bell },
    { id: 'security', label: 'Bảo mật', icon: Shield },
    { id: 'backup', label: 'Sao lưu & Phục hồi', icon: Database },
    { id: 'appearance', label: 'Giao diện', icon: Palette },
    { id: 'help', label: 'Trợ giúp', icon: HelpCircle },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Cài đặt chung</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên công ty</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      defaultValue="HRMS Company"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email công ty</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      defaultValue="info@company.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      defaultValue="0123456789"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      defaultValue="123 ABC Street, City"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả công ty</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    defaultValue="Hệ thống quản lý nhân sự chuyên nghiệp"
                  />
                </div>
              </div>
              <div className="mt-6">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'users':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Quản lý người dùng</h3>
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Danh sách quản trị viên</h4>
                  <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                    Thêm quản trị viên
                  </button>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {[
                  { name: 'Admin User', email: 'admin@company.com', role: 'Super Admin', status: 'Active' },
                  { name: 'HR Manager', email: 'hr@company.com', role: 'HR Admin', status: 'Active' },
                ].map((user, index) => (
                  <div key={index} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400">{user.role}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.status}
                      </span>
                      <button className="text-blue-600 hover:text-blue-800">
                        Chỉnh sửa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Cài đặt thông báo hệ thống</h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium">Email thông báo</div>
                  <div className="text-sm text-gray-500">Gửi thông báo hệ thống qua email</div>
                </div>
                <input type="checkbox" className="w-5 h-5 text-blue-600" defaultChecked />
              </label>
              <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium">Thông báo tuyển dụng</div>
                  <div className="text-sm text-gray-500">Thông báo khi có ứng viên mới</div>
                </div>
                <input type="checkbox" className="w-5 h-5 text-blue-600" defaultChecked />
              </label>
              <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium">Thông báo chấm công</div>
                  <div className="text-sm text-gray-500">Thông báo khi có vấn đề về chấm công</div>
                </div>
                <input type="checkbox" className="w-5 h-5 text-blue-600" defaultChecked />
              </label>
              <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium">Thông báo lương</div>
                  <div className="text-sm text-gray-500">Thông báo khi có bảng lương mới</div>
                </div>
                <input type="checkbox" className="w-5 h-5 text-blue-600" />
              </label>
            </div>
          </div>
        );
      
      case 'security':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Bảo mật hệ thống</h3>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="font-medium mb-2">Chính sách mật khẩu</div>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4 text-blue-600" defaultChecked />
                    <span className="text-sm">Yêu cầu mật khẩu tối thiểu 8 ký tự</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4 text-blue-600" defaultChecked />
                    <span className="text-sm">Yêu cầu ký tự đặc biệt</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">Yêu cầu đổi mật khẩu mỗi 90 ngày</span>
                  </label>
                </div>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="font-medium mb-2">Đăng nhập hai yếu tố</div>
                <div className="text-sm text-gray-500 mb-3">Bắt buộc 2FA cho tài khoản quản trị viên</div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Bắt buộc 2FA cho admin</span>
                </label>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="font-medium mb-2">Log hoạt động</div>
                <div className="text-sm text-gray-500 mb-3">Ghi lại các hoạt động quan trọng</div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 text-blue-600" defaultChecked />
                  <span className="text-sm">Ghi log đăng nhập</span>
                </label>
              </div>
            </div>
          </div>
        );
      
      case 'backup':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Sao lưu & Phục hồi</h3>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="font-medium mb-2">Sao lưu tự động</div>
                <div className="text-sm text-gray-500 mb-3">Thiết lập sao lưu dữ liệu định kỳ</div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tần suất sao lưu</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option>Hàng ngày</option>
                      <option>Hàng tuần</option>
                      <option>Hàng tháng</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian sao lưu</label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      defaultValue="02:00"
                    />
                  </div>
                </div>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="font-medium mb-2">Sao lưu thủ công</div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Sao lưu ngay
                </button>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="font-medium mb-2">Lịch sử sao lưu</div>
                <div className="text-sm text-gray-500">
                  <p>Sao lưu gần nhất: 2025-01-10 02:00:00</p>
                  <p>Kích thước: 125.4 MB</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <p>Tính năng đang được phát triển</p>
              <p className="text-sm mt-2">Vui lòng quay lại sau</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">Cài đặt hệ thống</h2>
        <p className="text-gray-600 mt-1">Quản lý cài đặt và cấu hình hệ thống HRMS</p>
      </div>
      
      <div className="flex">
        {/* Sidebar menu */}
        <div className="w-64 bg-gray-50 p-4 border-r border-gray-200">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={18} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isActive && <ChevronRight size={16} />}
                </button>
              );
            })}
          </nav>
        </div>
        
        {/* Content */}
        <div className="flex-1 p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
