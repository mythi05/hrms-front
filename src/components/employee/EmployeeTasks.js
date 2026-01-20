import React, { useEffect, useState } from 'react';
import { getMyTasks, updateMyTaskStatus } from '../../api/taskApi';
import { CheckCircle2, Clock, XCircle, ListTodo } from 'lucide-react';

export default function EmployeeTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const handleChangeStatus = async (task, status) => {
    try {
      await updateMyTaskStatus(task.id, status);
      await loadData();
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái công việc:', err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        'Không thể cập nhật trạng thái công việc';
      alert(msg);
    }
  };

  const statusLabel = (status) => {
    switch (status) {
      case 'NEW': return 'Mới';
      case 'IN_PROGRESS': return 'Đang làm';
      case 'COMPLETED': return 'Hoàn thành';
      case 'CANCELLED': return 'Hủy';
      default: return status;
    }
  };

  const statusColor = (s) => {
    switch (s) {
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const priorityLabel = (p) => {
    switch (p) {
      case 'LOW': return 'Thấp';
      case 'MEDIUM': return 'Trung bình';
      case 'HIGH': return 'Cao';
      default: return p;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Công việc được giao</h1>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3 text-left">Tiêu đề</th>
              <th className="p-3 text-left">Mô tả</th>
              <th className="p-3 text-left">Hạn</th>
              <th className="p-3 text-left">Ưu tiên</th>
              <th className="p-3 text-left">Trạng thái</th>
              <th className="p-3 text-left">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-4 text-center">Đang tải...</td>
              </tr>
            ) : tasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center">Chưa có công việc</td>
              </tr>
            ) : (
              tasks.map(t => (
                <tr key={t.id} className="border-b">
                  <td className="p-3 font-medium">{t.title}</td>
                  <td className="p-3">{t.description}</td>
                  <td className="p-3">{t.dueDate || '-'}</td>
                  <td className="p-3">{priorityLabel(t.priority)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${statusColor(t.status)}`}>
                      {statusLabel(t.status)}
                    </span>
                  </td>
                  <td className="p-3 space-x-2">
                    {t.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleChangeStatus(t, 'IN_PROGRESS')}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                      >
                        Đang làm
                      </button>
                    )}
                    {t.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleChangeStatus(t, 'COMPLETED')}
                        className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs"
                      >
                        Hoàn thành
                      </button>
                    )}
                    {t.status !== 'CANCELLED' && t.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleChangeStatus(t, 'CANCELLED')}
                        className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs"
                      >
                        Hủy
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
