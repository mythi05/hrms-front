import React, { useEffect, useState } from 'react';
import { Star, Calendar, User, FileText } from 'lucide-react';
import '../../styles/EmployeePerformance.css';
import performanceApi from '../../api/performanceApi';

export default function EmployeePerformance() {
  const [reviews, setReviews] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await performanceApi.myReviews();
      const data = res.data || [];
      setReviews(data);
      if (!selected && data.length > 0) setSelected(data[0]);
    } catch (e) {
      console.error('Lỗi tải đánh giá hiệu suất:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (review) => {
    try {
      setSelected(review);
      // Nếu cần chi tiết hơn, có thể gọi getMyPerformanceDetail(review.id)
      // const res = await getMyPerformanceDetail(review.id);
      // setSelected(res.data);
    } catch (e) {
      console.error('Lỗi tải chi tiết đánh giá:', e);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusClass = (status) => {
    if (status === 'APPROVED') return 'approved';
    if (status === 'SUBMITTED') return 'submitted';
    return 'draft';
  };

  return (
    <div className="employee-performance-container">
      {/* Danh sách đánh giá */}
      <div className="reviews-panel">
        <div className="reviews-header">
          <h1 className="reviews-title">
            <Star />
            Đánh giá hiệu suất của tôi
          </h1>
          <p className="reviews-description">
            Xem các kỳ đánh giá hiệu suất, điểm số và trạng thái phê duyệt.
          </p>
        </div>

        <div className="reviews-table">
          <div className="reviews-table-header">
            <div>Kỳ đánh giá</div>
            <div>Điểm số</div>
            <div>Trạng thái</div>
          </div>
          <div className="reviews-table-body">
            {loading ? (
              <div className="table-message">Đang tải dữ liệu...</div>
            ) : reviews.length === 0 ? (
              <div className="table-message">Chưa có đánh giá hiệu suất nào.</div>
            ) : (
              reviews.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleSelect(r)}
                  className={`review-row ${selected?.id === r.id ? 'active' : ''}`}
                >
                  <div className="review-cell review-cell-calendar">
                    <Calendar />
                    <span>{r.period}</span>
                  </div>
                  <div className="review-cell review-cell-star">
                    <Star />
                    <span>{r.score != null ? r.score : '-'}</span>
                  </div>
                  <div className="review-cell">
                    <span className={`review-status-badge ${getStatusClass(r.status)}`}>
                      {r.status}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Chi tiết đánh giá */}
      <div className="detail-panel">
        {selected ? (
          <>
            <div className="detail-header">
              <div className="detail-header-left">
                <h2>
                  <FileText />
                  Chi tiết đánh giá {selected.period}
                </h2>
                <p className="detail-reviewer">
                  Người đánh giá: {selected.reviewerName || 'HR/Quản lý'}
                </p>
              </div>
              <div className="detail-header-right">
                <div className="detail-score">
                  <Star />
                  <span className="detail-score-value">
                    {selected.score != null ? selected.score : '-'}
                  </span>
                </div>
                <div className="detail-date">
                  {selected.createdAt ? new Date(selected.createdAt).toLocaleString('vi-VN') : ''}
                </div>
              </div>
            </div>

            <div className="detail-content">
              <div className="detail-section">
                <h3 className="detail-section-title">Mục tiêu / Mô tả</h3>
                <div className="detail-section-content">
                  {selected.goals || 'Chưa có mô tả mục tiêu.'}
                </div>
              </div>

              <div className="detail-section">
                <h3 className="detail-section-title">Nhận xét từ người đánh giá</h3>
                <div className="detail-section-content">
                  {selected.comments || 'Chưa có nhận xét.'}
                </div>
              </div>

              <div className="detail-footer">
                <div className="detail-footer-item">
                  <User />
                  <span className="detail-footer-label">Nhân viên:</span>
                  <span className="detail-footer-value">{selected.employeeName}</span>
                </div>
                <div className="detail-footer-item">
                  <span className="detail-footer-label">Trạng thái:</span>
                  <span className={`review-status-badge ${getStatusClass(selected.status)}`}>
                    {selected.status}
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="detail-empty">
            Chọn một kỳ đánh giá ở bên trái để xem chi tiết.
          </div>
        )}
      </div>
    </div>
  );
}
