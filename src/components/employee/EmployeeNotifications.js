import React, { useEffect, useState } from 'react';
import { AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';
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
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, readFlag: true } : n));
    } catch (e) {
      console.error('Lỗi cập nhật thông báo:', e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Tất cả thông báo</h1>
          <p className="text-sm text-gray-500 mt-1">Danh sách đầy đủ thông báo liên quan đến lương, nghỉ phép và công việc của bạn.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
        {loading && notifications.length === 0 ? (
          <div className="px-8 py-10 flex flex-col items-center text-gray-500 text-sm">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mb-3" />
            Đang tải danh sách thông báo...
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-8 py-10 flex flex-col items-center text-gray-400 text-sm">
            <AlertTriangle className="w-7 h-7 mb-3" />
            Hiện chưa có thông báo nào.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`px-6 py-4 flex items-start gap-4 ${n.readFlag ? 'bg-white' : 'bg-indigo-50'}`}
              >
                <div className="pt-1">
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${
                      n.readFlag ? 'bg-gray-300' : 'bg-indigo-500'
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-sm font-semibold text-gray-900 truncate">{n.title}</h2>
                    <span className="text-[11px] text-gray-400 shrink-0">
                      {n.createdAt ? new Date(n.createdAt).toLocaleString('vi-VN') : ''}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-line break-words">{n.message}</p>
                </div>
                {!n.readFlag && (
                  <button
                    type="button"
                    onClick={() => handleMarkRead(n.id)}
                    className="ml-2 mt-1 inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800"
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
