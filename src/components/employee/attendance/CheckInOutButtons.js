// src/components/CheckInOutButtons.jsx
import React, { useState, useEffect } from "react";
import { checkIn, checkOut, getTodayAttendance } from "../api/attendanceApi";
import { CheckCircle, XCircle } from "lucide-react";

// Thêm prop `onCheckStatusChange` để component cha (EmployeeAttendance) cập nhật hiển thị
const CheckInOutButtons = ({ employeeId, onCheckStatusChange }) => {
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchToday = async () => {
    try {
      const res = await getTodayAttendance(employeeId);
      // Kiểm tra nếu body trả về trống (HTTP 204 No Content)
      if (res.status === 204) {
         setTodayAttendance(null);
      } else {
         setTodayAttendance(res.data);
      }
      onCheckStatusChange(res.data);
      setError(null);
    } catch (err) {
      // Xử lý lỗi: không tìm thấy bản ghi hôm nay
      if (err.response && err.response.status === 204) {
         setTodayAttendance(null);
         onCheckStatusChange(null);
      } else {
         console.error("Lỗi khi lấy dữ liệu chấm công hôm nay:", err);
         setError("Không thể tải trạng thái chấm công hôm nay.");
         setTodayAttendance(null);
         onCheckStatusChange(null);
      }
    }
  };

  useEffect(() => {
    fetchToday();
  }, [employeeId]);

  const handleCheckIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await checkIn(employeeId);
      await fetchToday();
      alert(`Check-in thành công lúc ${res.data.checkIn}`);
    } catch (err) {
      const message = err.response?.data?.message || "Lỗi Check-in: Có thể bạn đã Check-in rồi.";
      alert(message);
      setError(message);
    }
    setLoading(false);
  };

  const handleCheckOut = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await checkOut(employeeId);
      await fetchToday();
      alert(`Check-out thành công lúc ${res.data.checkOut}`);
    } catch (err) {
      const message = err.response?.data?.message || "Lỗi Check-out: Có thể bạn chưa Check-in hoặc đã Check-out rồi.";
      alert(message);
      setError(message);
    }
    setLoading(false);
  };
  
  const hasCheckedIn = !!todayAttendance?.checkIn;
  const hasCheckedOut = !!todayAttendance?.checkOut;

  return (
    <div className="flex gap-4">
      {/* Check In Button */}
      <button 
        onClick={handleCheckIn} 
        disabled={loading || hasCheckedIn}
        className={`px-8 py-3 rounded-lg transition font-semibold ${
          hasCheckedIn 
            ? 'bg-white/20 text-white cursor-not-allowed' 
            : 'bg-white text-green-700 hover:bg-green-50'
        }`}
      >
        {loading ? 'Đang xử lý...' : hasCheckedIn ? 'Đã Check In' : 'Check In'}
      </button>

      {/* Check Out Button */}
      <button 
        onClick={handleCheckOut} 
        disabled={loading || hasCheckedOut || !hasCheckedIn}
        className={`px-8 py-3 rounded-lg transition font-semibold ${
          hasCheckedOut || !hasCheckedIn
            ? 'bg-white/10 text-white/50 cursor-not-allowed' 
            : 'bg-white/30 text-white hover:bg-white/40'
        }`}
      >
        {loading ? 'Đang xử lý...' : hasCheckedOut ? 'Đã Check Out' : 'Check Out'}
      </button>
    </div>
  );
};

export default CheckInOutButtons;