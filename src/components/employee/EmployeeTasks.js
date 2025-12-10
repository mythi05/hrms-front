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
      alert('Không thể cập nhật trạng thái công việc');
    }
  };

  const statusLabel = (status) => {
    switch (status) {
      case 'NEW':
        return 'Mới';
      case 'IN_PROGRESS':
        return 'Đang làm';
      case 'COMPLETED':
        return 'Hoàn thành';
      case 'CANCELLED':
        return 'Hủy';
      default:
        return status;
    }
  };

  const statusColor = (s) => {
    switch (s) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const priorityLabel = (p) => {
    switch (p) {
      case 'LOW':
        return 'Thấp';
      case 'MEDIUM':
        return 'Trung bình';
      case 'HIGH':
        return 'Cao';
      default:
        return p;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-1">Công việc được giao</h1>
          <p className="text-gray-600 text-sm">Theo dõi công việc được giao và cập nhật trạng thái thực hiện</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-700 text-sm">
            <ListTodo size={18} />
            <span>Danh sách công việc</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 text-xs text-gray-600">Tiêu đề</th>
                <th className="text-left p-3 text-xs text-gray-600">Mô tả</th>
                <th className="text-left p-3 text-xs text-gray-600">Hạn hoàn thành</th>
                <th className="text-left p-3 text-xs text-gray-600">Ưu tiên</th>
                <th className="text-left p-3 text-xs text-gray-600">Trạng thái</th>
                <th className="text-left p-3 text-xs text-gray-600">Người giao</th>
                <th className="text-left p-3 text-xs text-gray-600">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">Đang tải...</td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">Hiện chưa có công việc nào được giao.</td>
                </tr>
              ) : (
                tasks.map((t) => (
                  <tr key={t.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-gray-800 font-medium">{t.title}</td>
                    <td className="p-3 text-gray-700 max-w-xs break-words">{t.description}</td>
                    <td className="p-3 text-gray-700">{t.dueDate || '-'}</td>
                    <td className="p-3 text-gray-700">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-indigo-50 text-indigo-700">
                        {priorityLabel(t.priority)}
                      </span>
                    </td>
                    <td className="p-3 text-gray-700">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs ${statusColor(t.status)}`}>
                        {t.status === 'COMPLETED' ? <CheckCircle2 size={14} /> : t.status === 'CANCELLED' ? <XCircle size={14} /> : <Clock size={14} />}
                        {statusLabel(t.status)}
                      </span>
                    </td>
                    <td className="p-3 text-gray-700">{t.createdByName || '-'}</td>
                    <td className="p-3 flex flex-wrap gap-2">
                      {t.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleChangeStatus(t, 'IN_PROGRESS')}
                          className="px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs"
                        >
                          Đang làm
                        </button>
                      )}
                      {t.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleChangeStatus(t, 'COMPLETED')}
                          className="px-3 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 text-xs"
                        >
                          Hoàn thành
                        </button>
                      )}
                      {t.status !== 'CANCELLED' && t.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleChangeStatus(t, 'CANCELLED')}
                          className="px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 text-xs"
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
    </div>
  );
}
