import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit2, Star, User, Calendar, CheckCircle2 } from 'lucide-react';
import '../../styles/AdminPerformancePage.css';
import performanceApi from '../../api/performanceApi';
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
      // Mock data - Replace with actual API call
      const mockEmployees = [
        { id: 1, fullName: 'Nguyễn Văn A' },
        { id: 2, fullName: 'Trần Thị B' },
        { id: 3, fullName: 'Lê Văn C' },
        { id: 4, fullName: 'Phạm Thị D' },
      ];
      setEmployees(mockEmployees);
      const res = await employeeApi.getAll();
      setEmployees(res.data || []);
    } catch (e) {
      console.error('Lỗi tải danh sách nhân viên:', e);
    }
  };

  const loadReviews = async () => {
    try {
      setLoading(true);
      // Mock data - Replace with actual API call
      const params = {};
      if (filter.employeeId) params.employeeId = filter.employeeId;
      if (filter.period) params.period = filter.period;
      const res = await performanceApi.list(params);
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
      // const payload = {
      //   id: form.id,
      //   employeeId: Number(form.employeeId),
      //   period: form.period,
      //   goals: form.goals,
      //   score: form.score ? Number(form.score) : null,
      //   comments: form.comments,
      //   status: form.status,
      // };
      // await adminCreateOrUpdatePerformance(payload);
      console.log('Saving performance review:', form);
      resetForm();
      await loadReviews();
      alert('Lưu đánh giá hiệu suất thành công');
      const payload = {
        id: form.id,
        employeeId: Number(form.employeeId),
        period: form.period,
        goals: form.goals,
        score: form.score ? Number(form.score) : null,
        comments: form.comments,
        status: form.status,
      };
      const res = await performanceApi.createOrUpdateAdmin(payload);
      setForm((prev) => ({ ...prev, id: res.data?.id ?? prev.id }));
    } catch (e) {
      console.error('Lỗi lưu đánh giá hiệu suất:', e);
      alert('Không thể lưu đánh giá. Vui lòng kiểm tra lại.');
    }
  };

  const handleApprove = async () => {
    if (!form.id) return alert('Chọn đánh giá để phê duyệt');
    try {
      await performanceApi.approve(form.id);
      alert('Phê duyệt thành công');
      await loadReviews();
    } catch (e) {
      console.error('Lỗi phê duyệt:', e);
      alert('Không thể phê duyệt');
    }
  };

  const handleSubmitReview = async () => {
    if (!form.id) return alert('Chọn đánh giá để nộp');
    try {
      await performanceApi.submit(form.id);
      alert('Nộp đánh giá thành công');
      await loadReviews();
    } catch (e) {
      console.error('Lỗi nộp đánh giá:', e);
      alert('Không thể nộp đánh giá');
    }
  };

  const handleDelete = async () => {
    if (!form.id) return alert('Chọn đánh giá để xóa');
    if (!window.confirm('Xác nhận xóa đánh giá này?')) return;
    try {
      await performanceApi.remove(form.id);
      alert('Xóa thành công');
      resetForm();
      await loadReviews();
    } catch (e) {
      console.error('Lỗi xóa:', e);
      alert('Không thể xóa đánh giá');
    }
  };

  const getEmployeeName = (id) => {
    const emp = employees.find((e) => e.id === id);
    return emp ? emp.fullName : '---';
  };

  const getStatusClass = (status) => {
    if (status === 'APPROVED') return 'approved';
    if (status === 'SUBMITTED') return 'submitted';
    return 'draft';
  };

  return (
    <div className="admin-performance-container">
      {/* Danh sách đánh giá */}
      <div className="admin-list-panel">
        <div className="panel-header">
          <div className="panel-header-content">
            <h1>
              <Star />
              Đánh giá hiệu suất
            </h1>
            <p>Quản lý đánh giá hiệu suất theo nhân viên và kỳ đánh giá.</p>
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="btn-create"
          >
            <Plus />
            Tạo mới
          </button>
        </div>

        {/* Bộ lọc */}
        <div className="filter-section">
          <div className="filter-group">
            <label>Nhân viên</label>
            <select
              className="filter-select"
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
          <div className="filter-group">
            <label>Kỳ đánh giá</label>
            <input
              type="text"
              placeholder="VD: 2025-Q1"
              className="filter-input"
              value={filter.period}
              onChange={(e) => setFilter((prev) => ({ ...prev, period: e.target.value }))}
            />
          </div>
          <div className="filter-button-wrapper">
            <button
              type="button"
              onClick={loadReviews}
              className="btn-filter"
            >
              <Search />
              Lọc
            </button>
          </div>
        </div>

        <div className="admin-table">
          <div className="admin-table-header">
            <div>Nhân viên</div>
            <div>Kỳ</div>
            <div>Điểm</div>
            <div>Trạng thái</div>
            <div>Ngày tạo</div>
          </div>
          <div className="admin-table-body">
            {loading ? (
              <div className="table-message">Đang tải dữ liệu...</div>
            ) : reviews.length === 0 ? (
              <div className="table-message">Chưa có đánh giá nào.</div>
            ) : (
              reviews.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleSelectReview(r)}
                  className={`admin-row ${selectedReview?.id === r.id ? 'active' : ''}`}
                >
                  <div className="admin-cell">
                    <User />
                    <span>{r.employeeName || getEmployeeName(r.employeeId)}</span>
                  </div>
                  <div className="admin-cell">
                    <Calendar />
                    <span>{r.period}</span>
                  </div>
                  <div className="admin-cell admin-cell-star">
                    <Star />
                    <span>{r.score != null ? r.score : '-'}</span>
                  </div>
                  <div className="admin-cell">
                    <span className={`review-status-badge ${getStatusClass(r.status)}`}>
                      {r.status}
                    </span>
                  </div>
                  <div className="admin-cell admin-cell-date">
                    {r.createdAt ? new Date(r.createdAt).toLocaleString('vi-VN') : ''}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Form tạo/cập nhật đánh giá */}
      <div className="admin-form-panel">
        <div className="form-header">
          <h2>
            <Edit2 />
            {form.id ? 'Cập nhật đánh giá' : 'Tạo đánh giá mới'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="performance-form">
          <div className="form-field">
            <label>Nhân viên</label>
            <select
              className="filter-select"
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

          <div className="form-field">
            <label>Kỳ đánh giá</label>
            <input
              type="text"
              placeholder="VD: 2025-Q1, 2025"
              value={form.period}
              onChange={(e) => setForm((prev) => ({ ...prev, period: e.target.value }))}
              required
            />
          </div>

          <div className="form-field">
            <label>Mục tiêu / Mô tả</label>
            <textarea
              rows={3}
              value={form.goals}
              onChange={(e) => setForm((prev) => ({ ...prev, goals: e.target.value }))}
              placeholder="Tổng hợp mục tiêu công việc, KPI, OKR..."
            />
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label>Điểm tổng</label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.score}
                onChange={(e) => setForm((prev) => ({ ...prev, score: e.target.value }))}
                placeholder="0 - 100"
              />
            </div>
            <div className="form-field">
              <label>Trạng thái</label>
              <select
                value={form.status}
                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
              >
                <option value="DRAFT">DRAFT</option>
                <option value="SUBMITTED">SUBMITTED</option>
                <option value="APPROVED">APPROVED</option>
              </select>
            </div>
          </div>

          <div className="form-field">
            <label>Nhận xét</label>
            <textarea
              rows={3}
              value={form.comments}
              onChange={(e) => setForm((prev) => ({ ...prev, comments: e.target.value }))}
              placeholder="Nhận xét chi tiết về kết quả công việc, điểm mạnh, điểm cần cải thiện..."
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={resetForm}
              className="btn-reset"
            >
              Đặt lại
            </button>
            <button
              type="submit"
              className="btn-submit"
            >
              <CheckCircle2 />
              Lưu đánh giá
            </button>
            {form.id && (
              <>
                <button type="button" onClick={handleSubmitReview} className="btn-submit" style={{marginLeft:8}}>
                  Nộp
                </button>
                <button type="button" onClick={handleApprove} className="btn-submit" style={{marginLeft:8}}>
                  Phê duyệt
                </button>
                <button type="button" onClick={handleDelete} className="btn-reset" style={{marginLeft:8}}>
                  Xóa
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
