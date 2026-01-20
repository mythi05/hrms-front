import React, {
  useEffect,
  useState,
  useRef,
  useCallback
} from 'react';
import {
  Bell,
  CheckCircle2,
  X,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import {
  getMyNotifications,
  getUnreadCount,
  markNotificationRead
} from '../../api/notificationApi';
import './index.css';

/* ================= CONFIG ================= */

const getTypeConfig = (type) => {
  switch (type) {
    case 'PAYROLL':
      return { label: 'Lương', color: 'bg-emerald-100 text-emerald-700', icon: '💸' };
    case 'PAYROLL_UPDATED':
      return { label: 'Cập nhật lương', color: 'bg-emerald-50 text-emerald-700', icon: '🔄' };
    case 'LEAVE_APPROVED':
      return { label: 'Nghỉ phép', color: 'bg-blue-50 text-blue-700', icon: '✅' };
    case 'LEAVE_REJECTED':
      return { label: 'Nghỉ phép', color: 'bg-red-50 text-red-700', icon: '❌' };
    case 'LEAVE_REQUEST_CREATED':
      return { label: 'Nghỉ phép', color: 'bg-blue-50 text-blue-700', icon: '📝' };
    case 'TASK_ASSIGNED':
      return { label: 'Công việc mới', color: 'bg-indigo-50 text-indigo-700', icon: '📌' };
    case 'TASK_UPDATED':
      return { label: 'Cập nhật công việc', color: 'bg-indigo-100 text-indigo-700', icon: '📝' };
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

/* ================= COMPONENT ================= */

export default function EmployeeNotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  /* ---------- navigation ---------- */
  const navigateByType = (type) => {
    let page = 'dashboard';

    switch (type) {
      case 'PAYROLL':
      case 'PAYROLL_UPDATED':
        page = 'payroll';
        break;
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

    window.dispatchEvent(
      new CustomEvent('employee:navigate', { detail: page })
    );
  };

  /* ---------- LOAD DATA (FIX ESLINT) ---------- */
  const load = useCallback(async () => {
    try {
      if (!notifications.length) setLoading(true);

      const [listRes, countRes] = await Promise.all([
        getMyNotifications(),
        getUnreadCount()
      ]);

      setNotifications(listRes.data || []);
      setUnread(countRes.data || 0);
    } catch (e) {
      console.error('Lỗi tải thông báo:', e);
    } finally {
      setLoading(false);
    }
  }, [notifications.length]);

  /* ---------- first load + interval ---------- */
  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  /* ---------- click outside ---------- */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  /* ---------- handlers ---------- */
  const handleItemClick = async (n) => {
    try {
      if (!n.readFlag) {
        await markNotificationRead(n.id);
      }

      setNotifications((prev) =>
        prev.map((i) =>
          i.id === n.id ? { ...i, readFlag: true } : i
        )
      );
      setUnread((prev) => (n.readFlag ? prev : prev - 1));

      navigateByType(n.type);
      setOpen(false);
    } catch (e) {
      console.error('Lỗi xử lý thông báo:', e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      if (unread === 0) return;

      await Promise.all(
        notifications
          .filter((n) => !n.readFlag)
          .map((n) => markNotificationRead(n.id))
      );

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readFlag: true }))
      );
      setUnread(0);
    } catch (e) {
      console.error('Lỗi mark all read:', e);
      load();
    }
  };

  /* ================= UI ================= */

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 shadow-sm"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="notification-overlay">
          <div className="notification-panel">
            {/* Header */}
            <div className="notification-panel__header">
              <div>
                <p className="notification-panel__title">Thông báo</p>
                <p className="notification-panel__subtitle">{unread} chưa đọc</p>
              </div>

              <button
                type="button"
                disabled={unread === 0 || loading}
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-indigo-600"
              >
                Đánh dấu tất cả
              </button>

              <button onClick={() => setOpen(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="notification-panel__body">
              {loading && notifications.length === 0 ? (
                <div className="text-center py-6">
                  <Loader2 className="animate-spin mx-auto" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <AlertTriangle className="mx-auto mb-2" />
                  Không có thông báo
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`notification-item ${
                      n.readFlag ? '' : 'notification-item--unread'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleItemClick(n)}
                      className="notification-item__content"
                    >
                      <div className="flex items-center gap-2">
                        <span>{getTypeConfig(n.type).icon}</span>
                        <span className={`text-xs px-2 rounded ${getTypeConfig(n.type).color}`}>
                          {getTypeConfig(n.type).label}
                        </span>
                      </div>
                      <p className="font-medium">{n.title}</p>
                      <p className="text-sm">{n.message}</p>
                      <p className="text-xs text-gray-400">{formatTime(n.createdAt)}</p>
                    </button>

                    {!n.readFlag && (
                      <button onClick={() => handleItemClick(n)}>
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
