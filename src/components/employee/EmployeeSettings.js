import React, { useState } from 'react';
import { User, Bell, Lock, Globe, Palette, HelpCircle, ChevronRight } from 'lucide-react';

export default function EmployeeSettings() {
  const [activeTab, setActiveTab] = useState('profile');

  const menuItems = [
    { id: 'profile', label: 'Thông tin cá nhân', icon: User },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'security', label: 'Bảo mật', icon: Lock },
    { id: 'language', label: 'Ngôn ngữ', icon: Globe },
    { id: 'appearance', label: 'Giao diện', icon: Palette },
    { id: 'help', label: 'Trợ giúp', icon: HelpCircle },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Thông tin cá nhân</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    defaultValue="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    defaultValue="a.nguyen@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    defaultValue="0123456789"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phòng ban</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    defaultValue="Phòng Kinh doanh"
                    disabled
                  />
                </div>
              </div>
              <div className="mt-6">
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Cài đặt thông báo</h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium">Email thông báo</div>
                  <div className="text-sm text-gray-500">Nhận thông báo qua email</div>
                </div>
                <input type="checkbox" className="w-5 h-5 text-green-600" defaultChecked />
              </label>
              <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium">Thông báo đẩy</div>
                  <div className="text-sm text-gray-500">Nhận thông báo trên trình duyệt</div>
                </div>
                <input type="checkbox" className="w-5 h-5 text-green-600" defaultChecked />
              </label>
              <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium">Thông báo lương</div>
                  <div className="text-sm text-gray-500">Nhận thông báo khi có bảng lương mới</div>
                </div>
                <input type="checkbox" className="w-5 h-5 text-green-600" defaultChecked />
              </label>
              <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium">Thông báo nghỉ phép</div>
                  <div className="text-sm text-gray-500">Nhận thông báo về trạng thái nghỉ phép</div>
                </div>
                <input type="checkbox" className="w-5 h-5 text-green-600" />
              </label>
            </div>
          </div>
        );
      
      case 'security':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Bảo mật</h3>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="font-medium mb-2">Đổi mật khẩu</div>
                <div className="space-y-3">
                  <input
                    type="password"
                    placeholder="Mật khẩu hiện tại"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <input
                    type="password"
                    placeholder="Mật khẩu mới"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <input
                    type="password"
                    placeholder="Xác nhận mật khẩu mới"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <button className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Cập nhật mật khẩu
                </button>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="font-medium mb-2">Xác thực hai yếu tố</div>
                <div className="text-sm text-gray-500 mb-3">Tăng cường bảo mật cho tài khoản của bạn</div>
                <button className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors">
                  Thiết lập 2FA
                </button>
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
        <h2 className="text-2xl font-bold text-gray-800">Cài đặt</h2>
        <p className="text-gray-600 mt-1">Quản lý cài đặt tài khoản và hệ thống</p>
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
                      ? 'bg-green-100 text-green-700 border-r-2 border-green-600'
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
