import React, { useEffect, useMemo, useState } from 'react';
import '../../styles/settings.css';
import { getAdminSettings, getAdminSettingsOverview, updateAdminSettings } from '../../api/adminSettingsApi';
import { employeeApi } from '../../api/employeeApi';

const AdminSettings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [original, setOriginal] = useState(null);

  const [companyName, setCompanyName] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(30);

  const [overview, setOverview] = useState({
    totalEmployees: 0,
    departmentCount: 0,
    uptimeMs: 0,
    diskUsedBytes: 0,
    diskTotalBytes: 0,
  });

  const [users, setUsers] = useState([]);

  const applyData = (data) => {
    setCompanyName(data?.companyName ?? '');
    setTaxCode(data?.taxCode ?? '');
    setCompanyAddress(data?.companyAddress ?? '');
    setContactEmail(data?.contactEmail ?? '');
    setContactPhone(data?.contactPhone ?? '');

    setTwoFactorAuth(data?.twoFactorAuth ?? false);
    setSessionTimeoutMinutes(data?.sessionTimeoutMinutes ?? 30);
    setMaintenanceMode(data?.maintenanceMode ?? false);
    setAutoBackup(data?.autoBackup ?? true);
    setEmailNotifications(data?.adminEmailNotifications ?? true);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [settingsRes, overviewRes, usersRes] = await Promise.all([
          getAdminSettings(),
          getAdminSettingsOverview(),
          employeeApi.getAll(),
        ]);

        const settings = settingsRes?.data || {};
        setOriginal(settings);
        applyData(settings);

        setOverview(overviewRes?.data || {});
        setUsers(usersRes?.data || []);
      } catch (e) {
        console.error('Lỗi tải cài đặt admin:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSaveCompany = async () => {
    try {
      setSaving(true);
      const payload = {
        companyName,
        taxCode,
        companyAddress,
        contactEmail,
        contactPhone,
        twoFactorAuth,
        sessionTimeoutMinutes,
        maintenanceMode,
        autoBackup,
        adminEmailNotifications: emailNotifications,
      };
      const res = await updateAdminSettings(payload);
      const data = res?.data || {};
      setOriginal(data);
      applyData(data);
    } catch (e) {
      console.error('Lỗi cập nhật cài đặt admin:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (original) applyData(original);
  };

  const fmtUptime = useMemo(() => {
    const ms = Number(overview?.uptimeMs || 0);
    const hours = ms / 1000 / 60 / 60;
    if (!Number.isFinite(hours) || hours <= 0) return '0h';
    if (hours < 24) return `${hours.toFixed(1)}h`;
    const days = Math.floor(hours / 24);
    const rem = hours - days * 24;
    return `${days}d ${rem.toFixed(0)}h`;
  }, [overview]);

  const fmtDiskUsed = useMemo(() => {
    const used = Number(overview?.diskUsedBytes || 0);
    const gb = used / 1024 / 1024 / 1024;
    if (!Number.isFinite(gb) || gb <= 0) return '0 GB';
    return `${gb.toFixed(1)} GB`;
  }, [overview]);

  const userInitials = (name) => {
    const s = (name || '').trim();
    if (!s) return 'NV';
    const parts = s.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] || '';
    const last = parts[parts.length - 1]?.[0] || '';
    const val = `${first}${last}`.toUpperCase();
    return val || 'NV';
  };

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
            <h4>{overview?.totalEmployees ?? 0}</h4>
            <p>Tổng nhân viên</p>
          </div>
          <div className="stat-card">
            <h4>{overview?.departmentCount ?? 0}</h4>
            <p>Phòng ban</p>
          </div>
          <div className="stat-card">
            <h4>{fmtUptime}</h4>
            <p>Uptime</p>
          </div>
          <div className="stat-card">
            <h4>{fmtDiskUsed}</h4>
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
          <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} disabled={loading || saving} />
        </div>

        <div className="form-group">
          <label>Mã số thuế</label>
          <input type="text" value={taxCode} onChange={(e) => setTaxCode(e.target.value)} disabled={loading || saving} />
        </div>

        <div className="form-group">
          <label>Địa chỉ</label>
          <textarea value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} disabled={loading || saving} />
        </div>

        <div className="two-column-grid">
          <div className="form-group">
            <label>Email liên hệ</label>
            <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} disabled={loading || saving} />
          </div>
          <div className="form-group">
            <label>Số điện thoại</label>
            <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} disabled={loading || saving} />
          </div>
        </div>

        <div className="form-actions">
          <button className="setting-button primary" onClick={handleSaveCompany} disabled={loading || saving}>Lưu thay đổi</button>
          <button className="setting-button" onClick={handleCancel} disabled={loading || saving}>Hủy</button>
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
          {users.map((u) => (
            <div className="user-item" key={u.id ?? u.username ?? u.email}>
              <div className="user-info-row">
                <div className="user-avatar">{userInitials(u.fullName)}</div>
                <div className="user-details">
                  <h4>{u.fullName || u.username || '—'}</h4>
                  <p>{u.email || '—'} • {u.role || '—'}</p>
                </div>
              </div>
              <div className="user-actions">
                <button className="icon-btn" disabled={loading || saving}>✏️</button>
                <button className="icon-btn" disabled={loading || saving}>🗑️</button>
              </div>
            </div>
          ))}
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
              disabled={loading || saving}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h3>Thời gian hết phiên</h3>
            <p>Tự động đăng xuất sau thời gian không hoạt động</p>
          </div>
          <select
            className="setting-button"
            style={{ width: '150px' }}
            value={String(sessionTimeoutMinutes)}
            onChange={(e) => setSessionTimeoutMinutes(Number(e.target.value))}
            disabled={loading || saving}
          >
            <option value="15">15 phút</option>
            <option value="30">30 phút</option>
            <option value="60">1 giờ</option>
            <option value="120">2 giờ</option>
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
              disabled={loading || saving}
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
              disabled={loading || saving}
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
              disabled={loading || saving}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
