import React, { useEffect, useRef, useState } from 'react';
import { Bell, CheckCircle2, X, AlertTriangle, Loader2 } from 'lucide-react';
import { getMyNotifications, getUnreadCount, markNotificationRead } from '../../api/notificationApi';
import './index.css';

const getTypeConfig = (type) => {
  switch (type) {
    case 'PAYROLL':
      return { label: 'Lương', color: 'bg-emerald-100 text-emerald-700', icon: '💸' };
    case 'PAYROLL_UPDATED':
      return { label: 'Cập nhật lương', color: 'bg-emerald-50 text-emerald-700', icon: '🔄' };
    case 'LEAVE_APPROVED':
    case 'LEAVE_REJECTED':
      return { label: 'Nghỉ phép', color: 'bg-blue-50 text-blue-700', icon: type === 'LEAVE_APPROVED' ? '✅' : '❌' };
    case 'LEAVE_REQUEST_CREATED':
      return { label: 'Nghỉ phép', color: 'bg-blue-50 text-blue-700', icon: '📝' };
    case 'TASK_ASSIGNED':
      return { label: 'Giao việc', color: 'bg-indigo-50 text-indigo-700', icon: '📌' };
    case 'TASK_UPDATED':
      return { label: 'Cập nhật việc', color: 'bg-indigo-100 text-indigo-700', icon: '📝' };
    case 'TASK_STATUS_UPDATED':
      return { label: 'Công việc', color: 'bg-indigo-100 text-indigo-700', icon: '✅' };
    default:
      return { label: 'Khác', color: 'bg-gray-100 text-gray-700', icon: 'ℹ️' };
  }
};

const formatTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export default function AdminNotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const navigateByType = (type) => {
    let page = 'dashboard';
    switch (type) {
      case 'PAYROLL':
      case 'PAYROLL_UPDATED':
        page = 'payroll';
        break;
      case 'LEAVE_REQUEST_CREATED':
      case 'LEAVE_APPROVED':
      case 'LEAVE_REJECTED':
        page = 'leave';
        break;
      case 'TASK_ASSIGNED':
      case 'TASK_UPDATED':
      case 'TASK_STATUS_UPDATED':
        page = 'tasks';
        break;
      default:
        page = 'dashboard';
    }

    window.dispatchEvent(new CustomEvent('admin:navigate', { detail: page }));
  };

  const load = async () => {
    try {
      if (!notifications.length) setLoading(true);
      const [listRes, countRes] = await Promise.all([getMyNotifications(), getUnreadCount()]);
      setNotifications(listRes.data || []);
      setUnread(countRes.data || 0);
    } catch (e) {
      console.error('Lỗi tải thông báo admin:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const handleItemClick = async (n) => {
    try {
      if (!n.readFlag) {
        await markNotificationRead(n.id);
      }
      navigateByType(n.type);
      setOpen(false);
      setNotifications((prev) => prev.map((notif) => (notif.id === n.id ? { ...notif, readFlag: true } : notif)));
      setUnread((prev) => (n.readFlag ? prev : prev - 1));
    } catch (e) {
      console.error('Lỗi khi xử lý thông báo admin:', e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      if (unread === 0) return;
      await Promise.all(notifications.filter((n) => !n.readFlag).map((n) => markNotificationRead(n.id)));
      setNotifications((prev) => prev.map((n) => ({ ...n, readFlag: true })));
      setUnread(0);
    } catch (e) {
      console.error('Lỗi khi đánh dấu tất cả đã đọc (admin):', e);
      load();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-white text-gray-600 hover:bg-gray-100 transition duration-150 ease-in-out border border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        aria-label="Thông báo"
        aria-expanded={open}
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold ring-2 ring-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-overlay" role="dialog" aria-modal="true">
          <div className="notification-panel">
            <div className="notification-panel__header">
              <div className="flex-1">
                <p className="notification-panel__title">Thông báo hệ thống</p>
                <p className="notification-panel__subtitle">{unread} chưa đọc</p>
              </div>

              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={unread === 0 || loading}
                className={`text-xs font-semibold px-2 py-1 rounded-lg transition ${
                  unread === 0 || loading
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50'
                }`}
              >
                Đánh dấu tất cả đã đọc
              </button>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="ml-3 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition"
                aria-label="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="notification-panel__body">
              {loading && notifications.length === 0 ? (
                <div className="notification-panel__loading flex flex-col items-center">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                  <span className="mt-2">Đang tải thông báo...</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="notification-panel__empty">
                  <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                  Không có thông báo mới nào.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`notification-item ${n.readFlag ? '' : 'notification-item--unread'}`}
                  >
                    <div className="flex-shrink-0 pt-1.5">
                      <span
                        className={`notification-item__dot ${
                          n.readFlag ? 'notification-item__dot--read' : 'notification-item__dot--unread'
                        }`}
                      ></span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleItemClick(n)}
                      className="notification-item__content text-left"
                    >
                      <div className="notification-item__title-row">
                        <p className="notification-item__title">
                          {getTypeConfig(n.type).icon} {n.title}
                        </p>
                        <span className={`notification-item__badge ${getTypeConfig(n.type).color}`}>
                          {getTypeConfig(n.type).label}
                        </span>
                      </div>

                      <p className={`notification-item__message ${n.readFlag ? '' : 'font-medium text-gray-700'}`}>
                        {n.message}
                      </p>

                      <p className="notification-item__meta">{formatTime(n.createdAt)}</p>
                    </button>

                    {!n.readFlag && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemClick(n);
                        }}
                        className="notification-item__mark-read"
                        title="Đánh dấu đã đọc"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="notification-panel__footer">
                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('admin:navigate', { detail: 'notifications' }));
                    setOpen(false);
                  }}
                  className="notification-panel__footer-link"
                >
                  Xem tất cả thông báo
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
