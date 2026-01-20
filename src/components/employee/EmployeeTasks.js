import React, { useEffect, useState } from 'react';
import { getMyTasks, updateMyTaskStatus } from '../../api/taskApi';
import { CheckCircle2, Clock, XCircle, ListTodo } from 'lucide-react';

export default function EmployeeTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getMyTasks();
      setTasks(res.data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách công việc:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ================= FIX CORE ================= */
  const handleChangeStatus = async (task, status) => {
    if (task.status === status) return;

    setUpdatingId(task.id);
    try {
      // 👉 BẮT BUỘC gửi object, KHÔNG gửi string
      await updateMyTaskStatus(task.id, {
        status: status
      });
      await loadData();
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái:', err);
      const msg =
        err?.response?.data?.message ||
        'Không thể cập nhật trạng thái công việc';
      alert(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const statusLabel = (s) =>
    ({
      NEW: 'Mới',
      IN_PROGRESS: 'Đang làm',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Hủy'
    }[s] || s);

  const statusColor = (s) =>
    ({
      COMPLETED: 'bg-green-100 text-green-700',
      IN_PROGRESS: 'bg-blue-100 text-blue-700',
      CANCELLED: 'bg-red-100 text-red-700'
    }[s] || 'bg-gray-100 text-gray-700');

  const priorityLabel = (p) =>
    ({
      LOW: 'Thấp',
      MEDIUM: 'Trung bình',
      HIGH: 'Cao'
    }[p] || p);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Công việc được giao</h1>
        <p className="text-gray-600 text-sm">
          Theo dõi và cập nhật trạng thái công việc
        </p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex items-center gap-2">
          <ListTodo size={16} />
          <span className="font-medium">Danh sách công việc</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-left">Tiêu đề</th>
                <th className="p-3 text-left hidden md:table-cell">Mô tả</th>
                <th className="p-3 text-left hidden sm:table-cell">Hạn</th>
                <th className="p-3 text-left hidden sm:table-cell">Ưu tiên</th>
                <th className="p-3 text-left">Trạng thái</th>
                <th className="p-3 text-left">Hành động</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center">
                    Đang tải...
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center">
                    Chưa có công việc nào
                  </td>
                </tr>
              ) : (
                tasks.map((t) => (
                  <tr key={t.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{t.title}</td>
                    <td className="p-3 hidden md:table-cell">
                      {t.description}
                    </td>
                    <td className="p-3 hidden sm:table-cell">
                      {t.dueDate || '-'}
                    </td>
                    <td className="p-3 hidden sm:table-cell">
                      {priorityLabel(t.priority)}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs ${statusColor(
                          t.status
                        )}`}
                      >
                        {t.status === 'COMPLETED' ? (
                          <CheckCircle2 size={14} />
                        ) : t.status === 'CANCELLED' ? (
                          <XCircle size={14} />
                        ) : (
                          <Clock size={14} />
                        )}
                        {statusLabel(t.status)}
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="flex gap-2 flex-wrap">
                        {t.status !== 'COMPLETED' && (
                          <button
                            disabled={updatingId === t.id}
                            onClick={() =>
                              handleChangeStatus(t, 'IN_PROGRESS')
                            }
                            className="px-3 py-1 rounded bg-blue-100 text-blue-700 text-xs"
                          >
                            Đang làm
                          </button>
                        )}
                        {t.status !== 'COMPLETED' && (
                          <button
                            disabled={updatingId === t.id}
                            onClick={() =>
                              handleChangeStatus(t, 'COMPLETED')
                            }
                            className="px-3 py-1 rounded bg-green-100 text-green-700 text-xs"
                          >
                            Hoàn thành
                          </button>
                        )}
                        {t.status !== 'CANCELLED' &&
                          t.status !== 'COMPLETED' && (
                            <button
                              disabled={updatingId === t.id}
                              onClick={() =>
                                handleChangeStatus(t, 'CANCELLED')
                              }
                              className="px-3 py-1 rounded bg-red-100 text-red-700 text-xs"
                            >
                              Hủy
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
