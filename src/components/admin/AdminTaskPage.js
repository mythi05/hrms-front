import React, { useEffect, useMemo, useState } from 'react';
import { adminGetAllTasks, adminCreateTask, adminUpdateTask, adminDeleteTask } from '../../api/taskApi';
import { employeeApi } from '../../api/employeeApi';
import { departmentApi } from '../../api/departmentApi';
import { Plus, Edit, Trash2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function AdminTaskPage() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    assigneeId: '',
    dueDate: '',
    priority: 'MEDIUM',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [taskRes] = await Promise.all([
        adminGetAllTasks(),
      ]);
      setTasks(taskRes.data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách công việc:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const res = await departmentApi.getAll();
      setDepartments(res.data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách phòng ban:', err);
    }
  };

  useEffect(() => {
    loadData();
    loadDepartments();
  }, []);

  useEffect(() => {
    const loadEmployeesByDepartment = async () => {
      if (!selectedDepartmentId) {
        setEmployees([]);
        return;
      }
      try {
        const res = await employeeApi.getByDepartment(selectedDepartmentId);
        setEmployees(res.data || []);
      } catch (err) {
        console.error('Lỗi tải danh sách nhân viên theo phòng ban:', err);
        setEmployees([]);
      }
    };

    loadEmployeesByDepartment();
  }, [selectedDepartmentId]);

  const openCreate = () => {
    setEditingTask(null);
    setForm({ title: '', description: '', assigneeId: '', dueDate: '', priority: 'MEDIUM' });
    setSelectedDepartmentId('');
    setShowModal(true);
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title || '',
      description: task.description || '',
      assigneeId: task.assigneeId || '',
      dueDate: task.dueDate || '',
      priority: task.priority || 'MEDIUM',
    });
    setSelectedDepartmentId('');
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.assigneeId) {
      alert('Vui lòng nhập tiêu đề và chọn nhân viên.');
      return;
    }
    try {
      const payload = {
        title: form.title,
        description: form.description,
        assigneeId: Number(form.assigneeId),
        dueDate: form.dueDate || null,
        priority: form.priority,
      };
      if (editingTask) {
        await adminUpdateTask(editingTask.id, payload);
      } else {
        await adminCreateTask(payload);
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      console.error('Lỗi lưu công việc:', err);
      alert(err.response?.data?.message || 'Không thể lưu công việc');
    }
  };

  const handleDelete = async (task) => {
    if (!window.confirm(`Xóa công việc "${task.title}"?`)) return;
    try {
      await adminDeleteTask(task.id);
      await loadData();
    } catch (err) {
      console.error('Lỗi xóa công việc:', err);
      alert('Không thể xóa công việc');
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

  const filteredEmployees = useMemo(() => employees || [], [employees]);

  return (
    <div className="space-y-6">
      {/* Header + nút tạo */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Giao việc cho nhân viên</h1>
          <p className="text-gray-600 text-sm">Tạo và phân công công việc cho nhân viên, theo dõi tiến độ thực hiện theo ngày hạn.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow hover:bg-blue-700 hover:shadow-lg transition-all text-sm font-medium"
        >
          <Plus size={18} />
          Tạo công việc
        </button>
      </div>

      {/* Thống kê nhanh */}
      {useMemo(() => {
        const total = tasks.length;
        const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
        const completed = tasks.filter(t => t.status === 'COMPLETED').length;
        const now = new Date();
        const overdue = tasks.filter(t => {
          if (!t.dueDate) return false;
          const d = new Date(t.dueDate);
          return !isNaN(d.getTime()) && d < now && t.status !== 'COMPLETED' && t.status !== 'CANCELLED';
        }).length;

        return (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col justify-between">
              <div className="text-xs font-medium text-gray-500 mb-2">Tổng công việc</div>
              <div className="flex items-end justify-between">
                <div className="text-2xl font-semibold text-gray-900">{total}</div>
                <div className="text-xs text-gray-500">Tất cả trạng thái</div>
              </div>
            </div>
            <div className="bg-blue-50 rounded-xl shadow-sm border border-blue-100 p-4 flex flex-col justify-between">
              <div className="text-xs font-medium text-blue-700 mb-2">Đang thực hiện</div>
              <div className="flex items-end justify-between">
                <div className="text-2xl font-semibold text-blue-800">{inProgress}</div>
                <div className="text-xs text-blue-600 flex items-center gap-1">
                  <Clock size={14} />
                  Đúng hạn / trễ hạn
                </div>
              </div>
            </div>
            <div className="bg-green-50 rounded-xl shadow-sm border border-green-100 p-4 flex flex-col justify-between">
              <div className="text-xs font-medium text-green-700 mb-2">Đã hoàn thành</div>
              <div className="flex items-end justify-between">
                <div className="text-2xl font-semibold text-green-800">{completed}</div>
                <div className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 size={14} />
                  Đúng cam kết
                </div>
              </div>
            </div>
            <div className="bg-red-50 rounded-xl shadow-sm border border-red-100 p-4 flex flex-col justify-between">
              <div className="text-xs font-medium text-red-700 mb-2">Quá hạn</div>
              <div className="flex items-end justify-between">
                <div className="text-2xl font-semibold text-red-800">{overdue}</div>
                <div className="text-xs text-red-600">Cần nhắc nhở</div>
              </div>
            </div>
          </div>
        );
      }, [tasks])}

      {/* Bảng công việc chi tiết */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="font-semibold text-gray-900 text-sm">Danh sách công việc</h3>
            <p className="text-xs text-gray-500 mt-0.5">Theo dõi trạng thái từng công việc theo nhân viên</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 text-xs text-gray-600">Tiêu đề</th>
                <th className="text-left p-3 text-xs text-gray-600">Nhân viên</th>
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
                  <td colSpan={7} className="p-4 text-center text-gray-500">Chưa có công việc nào.</td>
                </tr>
              ) : (
                tasks.map((t) => (
                  <tr key={t.id} className="border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                    <td className="p-3 text-gray-900 font-medium max-w-xs break-words">{t.title}</td>
                    <td className="p-3 text-gray-700 text-sm">{t.assigneeName || `#${t.assigneeId}`}</td>
                    <td className="p-3 text-gray-700 text-sm">{t.dueDate || '-'}</td>
                    <td className="p-3 text-gray-700">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-indigo-50 text-indigo-700">
                        {priorityLabel(t.priority)}
                      </span>
                    </td>
                    <td className="p-3 text-gray-700">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                        {t.status === 'COMPLETED' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                        {statusLabel(t.status)}
                      </span>
                    </td>
                    <td className="p-3 text-gray-700 text-sm">{t.createdByName || '-'}</td>
                    <td className="p-3 flex gap-2 justify-start">
                      <button
                        onClick={() => openEdit(t)}
                        className="px-2.5 py-1 rounded-lg bg-yellow-50 text-yellow-800 hover:bg-yellow-100 border border-yellow-100 text-xs flex items-center gap-1"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(t)}
                        className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-100 text-xs flex items-center gap-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3 border-b bg-gradient-to-r from-blue-600 to-blue-700">
              <h2 className="text-white text-lg font-semibold">
                {editingTask ? 'Cập nhật công việc' : 'Tạo công việc mới'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="VD: Báo cáo doanh số tháng 12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Mô tả chi tiết nội dung công việc, đầu ra mong đợi..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phòng ban *</label>
                  <select
                    value={selectedDepartmentId}
                    onChange={(e) => {
                      const v = e.target.value;
                      setSelectedDepartmentId(v);
                      setForm({ ...form, assigneeId: '' });
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">-- Chọn phòng ban --</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name || d.departmentName || `#${d.id}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhân viên *</label>
                  <select
                    value={form.assigneeId}
                    onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    disabled={!selectedDepartmentId}
                  >
                    <option value="">-- Chọn nhân viên --</option>
                    {filteredEmployees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.fullName || e.username} ({e.employeeCode || e.id})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hạn hoàn thành</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ưu tiên</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="LOW">Thấp</option>
                    <option value="MEDIUM">Trung bình</option>
                    <option value="HIGH">Cao</option>
                  </select>
                </div>
                {editingTask && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái hiện tại</label>
                    <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                      <AlertCircle size={14} className="text-gray-400" />
                      <span>{statusLabel(editingTask.status)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 py-3 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                className="px-5 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                {editingTask ? 'Lưu thay đổi' : 'Tạo công việc'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
