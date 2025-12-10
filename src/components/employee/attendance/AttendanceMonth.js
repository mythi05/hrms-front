// src/pages/EmployeeAttendance.jsx (Hoặc tên file tương ứng)
import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import CheckInOutButtons from '../components/CheckInOutButtons'; 
import AttendanceHistory from '../components/AttendanceHistory';
import { getEmployeeStats } from '../api/attendanceApi'; // Giả định hàm lấy thống kê

// Component phụ cho thẻ thống kê
function StatCard({ title, value, color, icon: Icon }) {
  const colors = {
    blue: 'border-blue-500 bg-blue-50',
    green: 'border-green-500 bg-green-50',
    red: 'border-red-500 bg-red-50',
    purple: 'border-purple-500 bg-purple-50',
  };

  return (
    <div className={`bg-white rounded-lg shadow p-4 border-l-4 ${colors[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <Icon size={20} className="text-gray-400" />
      </div>
      <div className="text-2xl text-gray-900 mb-1 font-bold">{value}</div>
      <div className="text-xs text-gray-600">{title}</div>
    </div>
  );
}

export default function EmployeeAttendance() {
  const employeeId = 1; // Thay bằng ID nhân viên thực tế
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('vi-VN'));
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [stats, setStats] = useState({});

  // Cập nhật đồng hồ live
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString('vi-VN')), 1000);
    return () => clearInterval(timer);
  }, []);

  // Lấy thống kê
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getEmployeeStats(employeeId);
        setStats(res.data);
      } catch (err) {
        console.error("Lỗi khi tải thống kê:", err);
      }
    };
    fetchStats();
  }, [employeeId]);
  
  // Hàm cập nhật trạng thái chấm công hôm nay từ CheckInOutButtons
  const handleCheckStatusChange = (attendance) => {
    setTodayAttendance(attendance);
  };
  
  // Format ngày tháng năm
  const todayDateStr = new Date().toLocaleDateString('vi-VN', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
  
  const checkInTime = todayAttendance?.checkIn || '--:--';
  const checkOutTime = todayAttendance?.checkOut || '--:--';
  const totalHours = todayAttendance?.totalHours || '0h';

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-2xl font-bold">Hệ thống chấm công</h1>
        <p className="text-gray-600">Quản lý thời gian làm việc của bạn</p>
      </div>

      {/* Check In/Out Card */}
      <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-lg shadow-lg p-8 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Clock size={32} />
              <div>
                <h2 className="text-xl font-semibold text-white">Chấm công hôm nay</h2>
                <p className="text-green-100 text-sm">{todayDateStr}</p>
              </div>
            </div>

            <div className="text-6xl mb-4 font-light">{currentTime}</div>

            {/* Sử dụng component CheckInOutButtons đã kết nối API */}
            <CheckInOutButtons employeeId={employeeId} onCheckStatusChange={handleCheckStatusChange} />
          </div>

          {/* Trạng thái hôm nay */}
          <div className="space-y-4">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-green-100 text-sm mb-1">Check In</div>
              <div className="text-2xl font-bold">{checkInTime}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-green-100 text-sm mb-1">Check Out</div>
              <div className="text-2xl font-bold">{checkOutTime}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-green-100 text-sm mb-1">Tổng giờ</div>
              <div className="text-2xl font-bold">{totalHours}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Giờ làm tuần này" value={stats.weeklyHours || '0h'} color="blue" icon={Clock} />
        <StatCard title="Đúng giờ" value={stats.onTime || '0/0'} color="green" icon={CheckCircle} />
        <StatCard title="Đi muộn" value={stats.lateCount || '0'} color="red" icon={XCircle} />
        <StatCard title="Tăng ca" value={stats.overtime || '0h'} color="purple" icon={TrendingUp} />
      </div>

      {/* History */}
      <AttendanceHistory employeeId={employeeId} />
    </div>
  );
}