import React, { useEffect, useState } from 'react';
import { Star, Calendar, User, FileText } from 'lucide-react';
import { getMyPerformanceReviews, getMyPerformanceDetail } from '../../api/performanceApi';

export default function EmployeePerformance() {
  const [reviews, setReviews] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getMyPerformanceReviews();
      setReviews(res.data || []);
      if (!selected && res.data && res.data.length > 0) {
        setSelected(res.data[0]);
      }
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

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Danh sách đánh giá */}
      <div className="lg:w-2/5 bg-white rounded-xl shadow border border-gray-100 p-5">
        <h1 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          Đánh giá hiệu suất của tôi
        </h1>
        <p className="text-xs text-gray-500 mb-4">
          Xem các kỳ đánh giá hiệu suất, điểm số và trạng thái phê duyệt.
        </p>

        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-3 bg-gray-50 text-xs font-semibold text-gray-500 px-4 py-2">
            <div>Kỳ</div>
            <div>Điểm</div>
            <div>Trạng thái</div>
          </div>
          <div className="max-h-[420px] overflow-y-auto text-sm">
            {loading ? (
              <div className="p-4 text-center text-gray-500 text-xs">Đang tải...</div>
            ) : reviews.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-xs">Chưa có đánh giá hiệu suất nào.</div>
            ) : (
              reviews.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleSelect(r)}
                  className={`w-full grid grid-cols-3 px-4 py-2 border-t border-gray-100 text-left hover:bg-indigo-50 ${
                    selected?.id === r.id ? 'bg-indigo-50' : 'bg-white'
                  }`}
                >
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
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Chi tiết đánh giá */}
      <div className="lg:w-3/5 bg-white rounded-xl shadow border border-gray-100 p-5">
        {selected ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Chi tiết đánh giá {selected.period}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Người đánh giá: {selected.reviewerName || 'HR/Quản lý'}
                </p>
              </div>
              <div className="flex flex-col items-end text-sm">
                <div className="flex items-center gap-1 text-gray-800">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold text-lg">{selected.score != null ? selected.score : '-'}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {selected.createdAt ? new Date(selected.createdAt).toLocaleString('vi-VN') : ''}
                </div>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <h3 className="text-xs font-semibold text-gray-500 mb-1">Mục tiêu / Mô tả</h3>
                <p className="text-gray-800 whitespace-pre-line border border-gray-100 rounded-lg p-3 bg-gray-50 min-h-[60px]">
                  {selected.goals || 'Chưa có mô tả mục tiêu.'}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-gray-500 mb-1">Nhận xét từ người đánh giá</h3>
                <p className="text-gray-800 whitespace-pre-line border border-gray-100 rounded-lg p-3 bg-gray-50 min-h-[60px]">
                  {selected.comments || 'Chưa có nhận xét.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3 text-gray-400" />
                  <span>Nhân viên: <span className="font-medium text-gray-800">{selected.employeeName}</span></span>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <span>Trạng thái: </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      selected.status === 'APPROVED'
                        ? 'bg-green-50 text-green-700'
                        : selected.status === 'SUBMITTED'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-gray-50 text-gray-600'
                    }`}
                  >
                    {selected.status}
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-gray-500">
            Chọn một kỳ đánh giá ở bên trái để xem chi tiết.
          </div>
        )}
      </div>
    </div>
  );
}
