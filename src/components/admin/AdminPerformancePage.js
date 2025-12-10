import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit2, Star, User, Calendar, CheckCircle2 } from 'lucide-react';
import { adminGetPerformanceReviews, adminCreateOrUpdatePerformance } from '../../api/performanceApi';
import { employeeApi } from '../../api/employeeApi';

export default function AdminPerformancePage() {
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [form, setForm] = useState({
    id: null,
    employeeId: '',
    period: '',
    goals: '',
    score: '',
    comments: '',
    status: 'SUBMITTED',
  });
  const [filter, setFilter] = useState({ employeeId: '', period: '' });

  const loadEmployees = async () => {
    try {
      const res = await employeeApi.getAll();
      setEmployees(res.data || []);
    } catch (e) {
      console.error('Lỗi tải danh sách nhân viên:', e);
    }
  };

  const loadReviews = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter.employeeId) params.employeeId = filter.employeeId;
      if (filter.period) params.period = filter.period;
      const res = await adminGetPerformanceReviews(params);
      setReviews(res.data || []);
    } catch (e) {
      console.error('Lỗi tải đánh giá hiệu suất:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter.employeeId, filter.period]);

  const handleSelectReview = (review) => {
    setSelectedReview(review);
    setForm({
      id: review.id,
      employeeId: review.employeeId || '',
      period: review.period || '',
      goals: review.goals || '',
      score: review.score ?? '',
      comments: review.comments || '',
      status: review.status || 'SUBMITTED',
    });
  };

  const resetForm = () => {
    setSelectedReview(null);
    setForm({
      id: null,
      employeeId: '',
      period: '',
      goals: '',
      score: '',
      comments: '',
      status: 'SUBMITTED',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.employeeId || !form.period) {
      alert('Vui lòng chọn nhân viên và kỳ đánh giá');
      return;
    }
    try {
      const payload = {
        id: form.id,
        employeeId: Number(form.employeeId),
        period: form.period,
        goals: form.goals,
        score: form.score ? Number(form.score) : null,
        comments: form.comments,
        status: form.status,
      };
      await adminCreateOrUpdatePerformance(payload);
      resetForm();
      await loadReviews();
      alert('Lưu đánh giá hiệu suất thành công');
    } catch (e) {
      console.error('Lỗi lưu đánh giá hiệu suất:', e);
      alert('Không thể lưu đánh giá. Vui lòng kiểm tra lại.');
    }
  };

  const getEmployeeName = (id) => {
    const emp = employees.find((e) => e.id === id);
    return emp ? emp.fullName : '---';
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Danh sách đánh giá */}
      <div className="lg:w-2/3 bg-white rounded-xl shadow border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Đánh giá hiệu suất
            </h1>
            <p className="text-xs text-gray-500 mt-1">Quản lý đánh giá hiệu suất theo nhân viên và kỳ đánh giá.</p>
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Tạo mới
          </button>
        </div>

        {/* Bộ lọc */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs text-gray-500 mb-1">Nhân viên</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={filter.employeeId}
              onChange={(e) => setFilter((prev) => ({ ...prev, employeeId: e.target.value }))}
            >
              <option value="">Tất cả</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs text-gray-500 mb-1">Kỳ đánh giá</label>
            <input
              type="text"
              placeholder="VD: 2025-Q1"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={filter.period}
              onChange={(e) => setFilter((prev) => ({ ...prev, period: e.target.value }))}
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={loadReviews}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Search className="w-4 h-4" />
              Lọc
            </button>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-5 bg-gray-50 text-xs font-semibold text-gray-500 px-4 py-2">
            <div>Nhân viên</div>
            <div>Kỳ</div>
            <div>Điểm</div>
            <div>Trạng thái</div>
            <div>Ngày tạo</div>
          </div>
          <div className="max-h-[420px] overflow-y-auto text-sm">
            {loading ? (
              <div className="p-4 text-center text-gray-500 text-xs">Đang tải...</div>
            ) : reviews.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-xs">Chưa có đánh giá nào.</div>
            ) : (
              reviews.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleSelectReview(r)}
                  className={`w-full grid grid-cols-5 px-4 py-2 border-t border-gray-100 text-left hover:bg-blue-50 ${
                    selectedReview?.id === r.id ? 'bg-blue-50' : 'bg-white'
                  }`}
                >
                  <div className="truncate flex items-center gap-1">
                    <User className="w-3 h-3 text-gray-400" />
                    <span>{r.employeeName || getEmployeeName(r.employeeId)}</span>
                  </div>
                  <div className="truncate flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span>{r.period}</span>
                  </div>
                  <div className="truncate flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span>{r.score != null ? r.score : '-'}</span>
                  </div>
                  <div className="truncate">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        r.status === 'APPROVED'
                          ? 'bg-green-50 text-green-700'
                          : r.status === 'SUBMITTED'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-gray-50 text-gray-600'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <div className="truncate text-xs text-gray-500">
                    {r.createdAt ? new Date(r.createdAt).toLocaleString('vi-VN') : ''}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Form tạo/cập nhật đánh giá */}
      <div className="lg:w-1/3 bg-white rounded-xl shadow border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Edit2 className="w-4 h-4 text-blue-600" />
            {form.id ? 'Cập nhật đánh giá' : 'Tạo đánh giá mới'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Nhân viên</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={form.employeeId}
              onChange={(e) => setForm((prev) => ({ ...prev, employeeId: e.target.value }))}
              required
            >
              <option value="">Chọn nhân viên</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Kỳ đánh giá</label>
            <input
              type="text"
              placeholder="VD: 2025-Q1, 2025"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={form.period}
              onChange={(e) => setForm((prev) => ({ ...prev, period: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1 flex items-center justify-between">
              Mục tiêu / Mô tả
            </label>
            <textarea
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
              value={form.goals}
              onChange={(e) => setForm((prev) => ({ ...prev, goals: e.target.value }))}
              placeholder="Tổng hợp mục tiêu công việc, KPI, OKR..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1">
                Điểm tổng
              </label>
              <input
                type="number"
                min="0"
                max="100"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={form.score}
                onChange={(e) => setForm((prev) => ({ ...prev, score: e.target.value }))}
                placeholder="0 - 100"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Trạng thái</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={form.status}
                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
              >
                <option value="DRAFT">DRAFT</option>
                <option value="SUBMITTED">SUBMITTED</option>
                <option value="APPROVED">APPROVED</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Nhận xét</label>
            <textarea
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
              value={form.comments}
              onChange={(e) => setForm((prev) => ({ ...prev, comments: e.target.value }))}
              placeholder="Nhận xét chi tiết về kết quả công việc, điểm mạnh, điểm cần cải thiện..."
            />
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-3 py-2 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Đặt lại
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              <CheckCircle2 className="w-4 h-4" />
              Lưu đánh giá
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
