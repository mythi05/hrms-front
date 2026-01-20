import React, { useEffect, useState, useRef } from 'react';
import { Bell, CheckCircle2, X, AlertTriangle, Loader2 } from 'lucide-react';
import { getMyNotifications, getUnreadCount, markNotificationRead } from '../../api/notificationApi';
import './index.css';

// Cấu hình loại thông báo (giữ nguyên logic)
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

// Hàm định dạng thời gian
const formatTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  // Hiển thị thời gian ngắn gọn hơn: "dd/MM/yyyy HH:mm"
  return date.toLocaleDateString('vi-VN', { 
    hour: '2-digit', 
    minute: '2-digit', 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
};


export default function EmployeeNotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Điều hướng (giữ nguyên logic)
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
        page = 'tasks';
        break;
      default:
        page = 'dashboard';
    }

    window.dispatchEvent(new CustomEvent('employee:navigate', { detail: page }));
  };

  // Xử lý khi click vào thông báo (Cải thiện)
  const handleItemClick = async (n) => {
    try {
      if (!n.readFlag) {
        await markNotificationRead(n.id);
      }
      navigateByType(n.type);
      setOpen(false);
      // Cập nhật ngay trạng thái thông báo và số lượng chưa đọc
      setNotifications(prev => 
        prev.map(notif => notif.id === n.id ? { ...notif, readFlag: true } : notif)
      );
      setUnread(prev => (n.readFlag ? prev : prev - 1));
      
    } catch (e) {
      console.error('Lỗi khi xử lý thông báo:', e);
    }
  };

  // Tải dữ liệu thông báo và số lượng chưa đọc
  const load = async () => {
    try {
      // Chỉ hiển thị loading spinner khi load lần đầu hoặc khi click vào chuông
      if (!notifications.length) setLoading(true); 

      const [listRes, countRes] = await Promise.all([
        getMyNotifications(),
        getUnreadCount(),
      ]);
      setNotifications(listRes.data || []);
      setUnread(countRes.data || 0);
    } catch (e) {
      console.error('Lỗi tải thông báo:', e);
    } finally {
      setLoading(false);
    }
  };

  // Tải dữ liệu lần đầu và thiết lập interval tải lại
  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // Tải lại sau mỗi 30 giây
    return () => clearInterval(interval);
  }, []);

  // Xử lý đóng dropdown khi click ra ngoài
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


  // Đánh dấu tất cả là đã đọc
  const handleMarkAllRead = async () => {
    try {
      if (unread === 0) return;
      // Dùng API đánh dấu đã đọc cho tất cả (nếu API có hỗ trợ)
      // Hiện tại không thấy hàm markAllRead, sử dụng hàm markNotificationRead
      await Promise.all(notifications
        .filter(n => !n.readFlag)
        .map(n => markNotificationRead(n.id))
      );
      
      // Cập nhật UI ngay lập tức
      setNotifications(prev => prev.map(n => ({ ...n, readFlag: true })));
      setUnread(0);
      
    } catch (e) {
      console.error('Lỗi khi đánh dấu tất cả đã đọc:', e);
      // Nếu lỗi, tải lại dữ liệu để đồng bộ trạng thái
      load(); 
    }
  };


  return (
    <div className="relative" ref={dropdownRef}>
      {/* Nút Chuông Đã Cải Tiến */}
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

      {/* Dropdown Thông báo */}
      {open && (
        <div className="notification-overlay" role="dialog" aria-modal="true">
          <div className="notification-panel">
            {/* Header Thông báo */}
            <div className="notification-panel__header">
              <div className="flex-1">
                <p className="notification-panel__title">Thông báo của bạn</p>
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

            {/* Nội dung Danh sách Thông báo */}
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
                    {/* Trạng thái đã đọc/chưa đọc */}
                    <div className="flex-shrink-0 pt-1.5">
                      <span
                        className={`notification-item__dot ${
                          n.readFlag ? 'notification-item__dot--read' : 'notification-item__dot--unread'
                        }`}
                      ></span>
                    </div>

                    {/* Nội dung Thông báo */}
                    <button
                      type="button"
                      onClick={() => handleItemClick(n)}
                      className="notification-item__content text-left"
                    >
                      <div className="notification-item__title-row">
                        <p className="notification-item__title">
                          {getTypeConfig(n.type).icon} {n.title}
                        </p>
                        <span
                          className={`notification-item__badge ${getTypeConfig(n.type).color}`}
                        >
                          {getTypeConfig(n.type).label}
                        </span>
                      </div>

                      <p
                        className={`notification-item__message ${
                          n.readFlag ? '' : 'font-medium text-gray-700'
                        }`}
                      >
                        {n.message}
                      </p>

                      <p className="notification-item__meta">{formatTime(n.createdAt)}</p>
                    </button>

                    {/* Nút đánh dấu đã đọc (chỉ hiện khi chưa đọc) */}
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

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="notification-panel__footer">
                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('employee:navigate', { detail: 'notifications' }));
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