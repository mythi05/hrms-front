import React, { useEffect, useState, useCallback } from 'react';
import { AlertTriangle, Loader2, CheckCircle2, Bell } from 'lucide-react';
import { getMyNotifications, markNotificationRead } from '../../api/notificationApi';
import '../../styles/EmployeeNotifications.css';

export default function EmployeeNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ FIX: useCallback
  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMyNotifications();
      setNotifications(res.data || []);
    } catch (e) {
      console.error('Lỗi tải danh sách thông báo:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readFlag: true } : n))
      );
    } catch (e) {
      console.error('Lỗi cập nhật thông báo:', e);
    }
  };

  // ✅ FIX: thêm dependency
  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="notifications-container">
      {/* Header */}
      <div className="notifications-header">
        <div className="header-icon-wrapper">
          <Bell className="header-icon" />
        </div>
        <div className="header-content">
          <h1 className="header-title">Thông báo</h1>
          <p className="header-subtitle">
            Cập nhật liên quan đến lương, nghỉ phép và công việc
          </p>
        </div>
      </div>

      <div className="notifications-card">
        {loading && notifications.length === 0 ? (
          <div className="empty-state loading">
            <Loader2 className="empty-icon spinner" />
            <span>Đang tải thông báo...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <AlertTriangle className="empty-icon" />
            <span>Hiện chưa có thông báo nào</span>
          </div>
        ) : (
          <ul className="notifications-list">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`notification-item ${n.readFlag ? 'read' : 'unread'}`}
              >
                <div className="notification-status">
                  <div className={`status-icon ${n.readFlag ? 'read' : 'unread'}`}>
                    <Bell className="bell-icon" />
                  </div>
                </div>

                <div className="notification-content">
                  <div className="notification-header-row">
                    <h2 className="notification-title">{n.title}</h2>
                    <span className="notification-date">
                      {n.createdAt
                        ? new Date(n.createdAt).toLocaleString('vi-VN')
                        : ''}
                    </span>
                  </div>
                  <p className="notification-message">{n.message}</p>
                </div>

                {!n.readFlag && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="mark-read-button"
                  >
                    <CheckCircle2 className="button-icon" />
                    <span>Đã đọc</span>
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
