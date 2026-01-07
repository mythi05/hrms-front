import React, { useEffect, useMemo, useState } from 'react';
import '../../styles/settings.css';
import { employeeApi } from '../../api/employeeApi';

const EmployeeSettings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [original, setOriginal] = useState(null);

  const [fullName, setFullName] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [address, setAddress] = useState('');

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [leaveNotifications, setLeaveNotifications] = useState(true);
  const [payrollNotifications, setPayrollNotifications] = useState(true);

  const [language, setLanguage] = useState('vi');
  const [theme, setTheme] = useState('light');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');

  const initials = useMemo(() => {
    const s = (fullName || '').trim();
    if (!s) return 'NV';
    const parts = s.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] || '';
    const last = parts[parts.length - 1]?.[0] || '';
    const val = `${first}${last}`.toUpperCase();
    return val || 'NV';
  }, [fullName]);

  const applyData = (data) => {
    setFullName(data?.fullName ?? '');
    setEmployeeCode(data?.employeeCode ?? '');
    setEmail(data?.email ?? '');
    setPhone(data?.phone ?? '');
    setDepartment(data?.department ?? '');
    setPosition(data?.position ?? '');
    setAddress(data?.address ?? '');

    setEmailNotifications(data?.emailNotifications ?? true);
    setPushNotifications(data?.pushNotifications ?? true);
    setLeaveNotifications(data?.leaveNotifications ?? true);
    setPayrollNotifications(data?.payrollNotifications ?? true);

    setLanguage(data?.language ?? 'vi');
    setTheme(data?.theme ?? 'light');
    setDateFormat(data?.dateFormat ?? 'DD/MM/YYYY');
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await employeeApi.getMe();
        const data = res?.data || {};
        setOriginal(data);
        applyData(data);
      } catch (e) {
        console.error('Lỗi tải cài đặt:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const payload = {
        fullName,
        email,
        phone,
        address,
        emailNotifications,
        pushNotifications,
        leaveNotifications,
        payrollNotifications,
        language,
        theme,
        dateFormat
      };
      const res = await employeeApi.updateMe(payload);
      const data = res?.data || {};
      setOriginal(data);
      applyData(data);
    } catch (e) {
      console.error('Lỗi cập nhật cài đặt:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (original) applyData(original);
  };

  return (
    <div className="settings-content">
      {/* Profile Information */}
      <div className="settings-section">
        <div className="section-header">
          <div className="section-icon blue">👤</div>
          <div>
            <h2>Thông tin cá nhân</h2>
            <p>Cập nhật thông tin hồ sơ của bạn</p>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '36px',
              fontWeight: '600',
              marginBottom: '12px'
            }}
          >
            {initials}
          </div>
          <div>
            <button className="setting-button">Thay đổi ảnh</button>
          </div>
        </div>

        <div className="two-column-grid">
          <div className="form-group">
            <label>Họ và tên</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={loading || saving} />
          </div>
          <div className="form-group">
            <label>Mã nhân viên</label>
            <input
              type="text"
              value={employeeCode}
              disabled
              style={{ background: '#f5f5f5' }}
            />
          </div>
        </div>

        <div className="two-column-grid">
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading || saving} />
          </div>
          <div className="form-group">
            <label>Số điện thoại</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={loading || saving} />
          </div>
        </div>

        <div className="two-column-grid">
          <div className="form-group">
            <label>Phòng ban</label>
            <input
              type="text"
              value={department}
              disabled
              style={{ background: '#f5f5f5' }}
            />
          </div>
          <div className="form-group">
            <label>Chức vụ</label>
            <input
              type="text"
              value={position}
              disabled
              style={{ background: '#f5f5f5' }}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Địa chỉ</label>
          <textarea value={address} onChange={(e) => setAddress(e.target.value)} disabled={loading || saving} />
        </div>

        <div className="form-actions">
          <button className="setting-button primary" onClick={handleSaveProfile} disabled={loading || saving}>
            Cập nhật thông tin
          </button>
          <button className="setting-button" onClick={handleCancel} disabled={loading || saving}>Hủy</button>
        </div>
      </div>

      {/* Account Security */}
      <div className="settings-section">
        <div className="section-header">
          <div className="section-icon red">🔐</div>
          <div>
            <h2>Bảo mật tài khoản</h2>
            <p>Quản lý mật khẩu và bảo mật</p>
          </div>
        </div>

        <div className="alert-box warning">
          <span>⚠️</span>
          <span>Bạn nên đổi mật khẩu định kỳ để bảo mật tài khoản</span>
        </div>

        <div className="form-group">
          <label>Mật khẩu hiện tại</label>
          <input type="password" placeholder="Nhập mật khẩu hiện tại" />
        </div>
        <div className="form-group">
          <label>Mật khẩu mới</label>
          <input type="password" placeholder="Nhập mật khẩu mới" />
        </div>
        <div className="form-group">
          <label>Xác nhận mật khẩu mới</label>
          <input type="password" placeholder="Nhập lại mật khẩu mới" />
        </div>

        <div className="form-actions">
          <button className="setting-button primary">Đổi mật khẩu</button>
        </div>

        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
          <div className="setting-item">
            <div className="setting-info">
              <h3>Lịch sử đăng nhập</h3>
              <p>Xem các thiết bị đã đăng nhập gần đây</p>
            </div>
            <button className="setting-button">Xem chi tiết</button>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Đăng xuất tất cả thiết bị</h3>
              <p>Đăng xuất khỏi tất cả các thiết bị khác</p>
            </div>
            <button className="setting-button danger">Đăng xuất</button>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="settings-section">
        <div className="section-header">
          <div className="section-icon purple">🔔</div>
          <div>
            <h2>Thông báo</h2>
            <p>Cấu hình thông báo và nhắc nhở</p>
          </div>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h3>Thông báo email</h3>
            <p>Nhận thông báo qua email</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              disabled={loading || saving}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h3>Thông báo đẩy</h3>
            <p>Nhận thông báo đẩy trên trình duyệt</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={pushNotifications}
              onChange={(e) => setPushNotifications(e.target.checked)}
              disabled={loading || saving}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h3>Thông báo nghỉ phép</h3>
            <p>Nhận thông báo về trạng thái đơn nghỉ phép</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={leaveNotifications}
              onChange={(e) => setLeaveNotifications(e.target.checked)}
              disabled={loading || saving}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h3>Thông báo lương</h3>
            <p>Nhận thông báo về bảng lương hàng tháng</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={payrollNotifications}
              onChange={(e) => setPayrollNotifications(e.target.checked)}
              disabled={loading || saving}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      {/* Work Schedule */}
      <div className="settings-section">
        <div className="section-header">
          <div className="section-icon green">📅</div>
          <div>
            <h2>Lịch làm việc</h2>
            <p>Cài đặt ca làm và lịch trình</p>
          </div>
        </div>

        <div className="alert-box info">
          <span>ℹ️</span>
          <span>Lịch làm việc của bạn: Thứ 2 - Thứ 6, 8:00 - 17:00</span>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h3>Ca làm việc hiện tại</h3>
            <p>Ca hành chính (8:00 - 17:00)</p>
          </div>
          <button className="setting-button">Xem chi tiết</button>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h3>Số ngày phép còn lại</h3>
            <p>Bạn còn 12 ngày phép năm</p>
          </div>
          <button className="setting-button">Đăng ký nghỉ</button>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h3>Lịch sử chấm công</h3>
            <p>Xem lịch sử chấm công của bạn</p>
          </div>
          <button className="setting-button">Xem lịch sử</button>
        </div>
      </div>

      {/* Preferences */}
      <div className="settings-section">
        <div className="section-header">
          <div className="section-icon orange">⚙️</div>
          <div>
            <h2>Tùy chọn</h2>
            <p>Cài đặt hiển thị và ngôn ngữ</p>
          </div>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h3>Ngôn ngữ</h3>
            <p>Chọn ngôn ngữ hiển thị</p>
          </div>
          <select
            className="setting-button"
            style={{ width: '150px' }}
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={loading || saving}
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
          </select>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h3>Giao diện</h3>
            <p>Chọn chế độ hiển thị</p>
          </div>
          <select
            className="setting-button"
            style={{ width: '150px' }}
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            disabled={loading || saving}
          >
            <option value="light">Sáng</option>
            <option value="dark">Tối</option>
            <option value="auto">Tự động</option>
          </select>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h3>Định dạng ngày</h3>
            <p>Chọn định dạng hiển thị ngày tháng</p>
          </div>
          <select
            className="setting-button"
            style={{ width: '150px' }}
            value={dateFormat}
            onChange={(e) => setDateFormat(e.target.value)}
            disabled={loading || saving}
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
      </div>

      {/* Support */}
      <div className="settings-section">
        <div className="section-header">
          <div className="section-icon blue">💬</div>
          <div>
            <h2>Hỗ trợ</h2>
            <p>Liên hệ và trợ giúp</p>
          </div>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h3>Trung tâm trợ giúp</h3>
            <p>Tìm câu trả lời cho các câu hỏi thường gặp</p>
          </div>
          <button className="setting-button">Truy cập</button>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h3>Liên hệ hỗ trợ</h3>
            <p>Gửi yêu cầu hỗ trợ đến bộ phận IT</p>
          </div>
          <button className="setting-button">Liên hệ</button>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h3>Phản hồi</h3>
            <p>Gửi ý kiến đóng góp về hệ thống</p>
          </div>
          <button className="setting-button">Gửi phản hồi</button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSettings;
