import React, { useEffect, useState } from 'react';
import { AlertTriangle, Loader2, CheckCircle2, Bell } from 'lucide-react';
import { getMyNotifications, markNotificationRead } from '../../api/notificationApi';

export default function EmployeeNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getMyNotifications();
      setNotifications(res.data || []);
    } catch (e) {
      console.error('Lỗi tải danh sách thông báo:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, readFlag: true } : n))
      );
    } catch (e) {
      console.error('Lỗi cập nhật thông báo:', e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-0">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
          <Bell className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Thông báo</h1>
          <p className="text-sm text-gray-500">
            Cập nhật liên quan đến lương, nghỉ phép và công việc
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading && notifications.length === 0 ? (
          <div className="px-8 py-16 flex flex-col items-center text-gray-500 text-sm">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-500 mb-4" />
            Đang tải thông báo...
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-8 py-16 flex flex-col items-center text-gray-400 text-sm">
            <AlertTriangle className="w-8 h-8 mb-4" />
            Hiện chưa có thông báo nào
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`group transition px-5 py-4 flex gap-4
                  ${n.readFlag
                    ? 'bg-white hover:bg-gray-50'
                    : 'bg-indigo-50/60 hover:bg-indigo-50'
                  }`}
              >
                {/* Status icon */}
                <div className="pt-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center
                      ${n.readFlag
                        ? 'bg-gray-100 text-gray-400'
                        : 'bg-indigo-100 text-indigo-600'
                      }`}
                  >
                    <Bell className="w-4 h-4" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <h2 className="text-sm font-semibold text-gray-900 truncate">
                      {n.title}
                    </h2>
                    <span className="text-xs text-gray-400">
                      {n.createdAt
                        ? new Date(n.createdAt).toLocaleString('vi-VN')
                        : ''}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-line leading-relaxed">
                    {n.message}
                  </p>
                </div>

                {/* Action */}
                {!n.readFlag && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="self-start mt-1 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs
                      bg-indigo-600 text-white hover:bg-indigo-700 transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Đã đọc
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
