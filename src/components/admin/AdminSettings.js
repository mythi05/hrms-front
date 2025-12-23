import React, { useState } from 'react';
import '../../styles/settings.css';

const AdminSettings = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  return (
    <div className="settings-content">
      {/* System Overview */}
      <div className="settings-section">
        <div className="section-header">
          <div className="section-icon blue">⚙️</div>
          <div>
            <h2>Tổng quan hệ thống</h2>
            <p>Thông tin và trạng thái hệ thống HRMS</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h4>156</h4>
            <p>Tổng nhân viên</p>
          </div>
          <div className="stat-card">
            <h4>12</h4>
            <p>Phòng ban</p>
          </div>
          <div className="stat-card">
            <h4>98.5%</h4>
            <p>Uptime</p>
          </div>
          <div className="stat-card">
            <h4>2.3 GB</h4>
            <p>Dung lượng sử dụng</p>
          </div>
        </div>
      </div>

      {/* Company Settings */}
      <div className="settings-section">
        <div className="section-header">
          <div className="section-icon green">🏢</div>
          <div>
            <h2>Cài đặt công ty</h2>
            <p>Thông tin và cấu hình công ty</p>
          </div>
        </div>

        <div className="form-group">
          <label>Tên công ty</label>
          <input type="text" defaultValue="Công ty TNHH ABC" />
        </div>

        <div className="form-group">
          <label>Mã số thuế</label>
          <input type="text" defaultValue="0123456789" />
        </div>

        <div className="form-group">
          <label>Địa chỉ</label>
          <textarea defaultValue="123 Đường ABC, Quận 1, TP. Hồ Chí Minh" />
        </div>

        <div className="two-column-grid">
          <div className="form-group">
            <label>Email liên hệ</label>
            <input type="email" defaultValue="contact@company.com" />
          </div>
          <div className="form-group">
            <label>Số điện thoại</label>
            <input type="tel" defaultValue="028 1234 5678" />
          </div>
        </div>

        <div className="form-actions">
          <button className="setting-button primary">Lưu thay đổi</button>
          <button className="setting-button">Hủy</button>
        </div>
      </div>

      {/* User Management */}
      <div className="settings-section">
        <div className="section-header">
          <div className="section-icon purple">👥</div>
          <div>
            <h2>Quản lý người dùng</h2>
            <p>Quản lý tài khoản và quyền hạn</p>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <button className="setting-button primary">+ Thêm người dùng mới</button>
        </div>

        <div className="user-list">
          <div className="user-item">
            <div className="user-info-row">
              <div className="user-avatar">NV</div>
              <div className="user-details">
                <h4>Nguyễn Văn A</h4>
                <p>admin@company.com • Administrator</p>
              </div>
            </div>
            <div className="user-actions">
              <button className="icon-btn">✏️</button>
              <button className="icon-btn">🗑️</button>
            </div>
          </div>

          <div className="user-item">
            <div className="user-info-row">
              <div
                className="user-avatar"
                style={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                }}
              >
                TT
              </div>
              <div className="user-details">
                <h4>Trần Thị B</h4>
                <p>manager@company.com • Manager</p>
              </div>
            </div>
            <div className="user-actions">
              <button className="icon-btn">✏️</button>
              <button className="icon-btn">🗑️</button>
            </div>
          </div>

          <div className="user-item">
            <div className="user-info-row">
              <div
                className="user-avatar"
                style={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                }}
              >
                LV
              </div>
              <div className="user-details">
                <h4>Lê Văn C</h4>
                <p>employee@company.com • Employee</p>
              </div>
            </div>
            <div className="user-actions">
              <button className="icon-btn">✏️</button>
              <button className="icon-btn">🗑️</button>
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="settings-section">
        <div className="section-header">
          <div className="section-icon red">🔒</div>
          <div>
            <h2>Bảo mật</h2>
            <p>Cấu hình bảo mật hệ thống</p>
          </div>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h3>Xác thực hai yếu tố (2FA)</h3>
            <p>Yêu cầu xác thực hai yếu tố cho tất cả người dùng</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={twoFactorAuth}
              onChange={(e) => setTwoFactorAuth(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h3>Thời gian hết phiên</h3>
            <p>Tự động đăng xuất sau thời gian không hoạt động</p>
          </div>
          <select className="setting-button" style={{ width: '150px' }}>
            <option>15 phút</option>
            <option>30 phút</option>
            <option>1 giờ</option>
            <option>2 giờ</option>
          </select>
        </div>
      </div>

      {/* System Settings */}
      <div className="settings-section">
        <div className="section-header">
          <div className="section-icon orange">🔧</div>
          <div>
            <h2>Cài đặt hệ thống</h2>
            <p>Cấu hình chung của hệ thống</p>
          </div>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h3>Chế độ bảo trì</h3>
            <p>Tạm dừng truy cập hệ thống để bảo trì</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h3>Sao lưu tự động</h3>
            <p>Tự động sao lưu dữ liệu hàng ngày</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={autoBackup}
              onChange={(e) => setAutoBackup(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h3>Thông báo email</h3>
            <p>Gửi email thông báo cho admin về các sự kiện quan trọng</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
