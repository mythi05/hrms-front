// src/components/AttendanceHistory.jsx
import React, { useEffect, useState } from "react";
import { getAttendanceHistory, formatAttendanceRecords } from "../api/attendanceApi";
import { Clock, Calendar, TrendingUp, CheckCircle, XCircle } from 'lucide-react';

const AttendanceHistory = ({ employeeId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getAttendanceHistory(employeeId);
        // Định dạng lại dữ liệu trước khi set state
        setHistory(formatAttendanceRecords(res.data));
      } catch (err) {
        console.error("Lỗi khi tải lịch sử chấm công:", err);
        setError("Không thể tải lịch sử chấm công.");
      }
      setLoading(false);
    };
    fetchHistory();
  }, [employeeId]);
  
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Đúng giờ':
        return 'bg-green-100 text-green-700';
      case 'Đi muộn':
        return 'bg-red-100 text-red-700';
      case 'Đang làm':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) return <div className="p-4 text-center">Đang tải lịch sử...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-800">Lịch sử chấm công</h3>
        <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm">
          <option>Tháng này</option>
          <option>Tháng trước</option>
          {/* Thêm tùy chọn khác nếu cần */}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 text-xs text-gray-600">Ngày</th>
              <th className="text-left p-4 text-xs text-gray-600">Giờ vào</th>
              <th className="text-left p-4 text-xs text-gray-600">Giờ ra</th>
              <th className="text-left p-4 text-xs text-gray-600">Tổng giờ</th>
              <th className="text-left p-4 text-xs text-gray-600">Trạng thái</th>
              <th className="text-left p-4 text-xs text-gray-600">Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {history.length > 0 ? (
              history.map((record) => (
                <tr key={record.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-gray-700">{record.date || '-'}</td>
                  <td className="p-4 text-gray-700">{record.checkIn || '--:--'}</td>
                  <td className="p-4 text-gray-700">{record.checkOut || '--:--'}</td>
                  <td className="p-4 text-gray-700">{record.totalHours || '0h'}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(record.status)}`}>
                      {record.status || 'Chưa rõ'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 text-sm">{record.note || ''}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  Không có dữ liệu lịch sử chấm công.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceHistory;