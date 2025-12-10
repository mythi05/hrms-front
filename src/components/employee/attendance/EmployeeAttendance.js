import React, { useState, useEffect } from 'react';
import { Clock, Calendar, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { 
  checkIn,
  checkOut,
  getTodayAttendance,
  getAttendanceHistory,
  formatAttendanceRecords
} from '../../../api/attendanceApi';

export default function EmployeeAttendance() {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('vi-VN'));
  const [today, setToday] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ weeklyHours: '0h', onTime: '0/0', lateCount: '0', overtime: '0h' });
  const [loading, setLoading] = useState(false);

  const employeeId = (() => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return null;
      const u = JSON.parse(raw);
      return u.id || null;
    } catch {
      return null;
    }
  })();

  // Đồng hồ realtime
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString('vi-VN')), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    if (!employeeId) return;
    setLoading(true);
    try {
      const [todayRes, historyRes] = await Promise.all([
        getTodayAttendance(employeeId).catch(() => ({ data: null })),
        getAttendanceHistory(employeeId).catch(() => ({ data: [] }))
      ]);

      const rawHistory = historyRes.data || [];
      setToday(todayRes.data || null);
      setHistory(formatAttendanceRecords(rawHistory));

      // Tính thống kê 7 ngày gần nhất từ dữ liệu thật
      const now = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 6);

      let totalMinutes = 0;
      let onTimeDays = 0;
      let workDays = 0;
      let lateDays = 0;

      rawHistory.forEach(r => {
        if (!r.date) return;
        const d = new Date(r.date);
        if (isNaN(d.getTime())) return;
        if (d < sevenDaysAgo || d > now) return;

        if (r.totalHours) {
          const num = typeof r.totalHours === 'number' ? r.totalHours : parseFloat(r.totalHours);
          if (!isNaN(num)) totalMinutes += num * 60;
        }

        if (r.status === 'PRESENT' || r.status === 'LATE') {
          workDays++;
          if (r.status === 'PRESENT') onTimeDays++;
          if (r.status === 'LATE') lateDays++;
        }
      });

      const weeklyHours = (totalMinutes / 60).toFixed(2) + 'h';
      const onTime = `${onTimeDays}/${workDays || 0}`;
      const lateCount = String(lateDays);

      // Tạm thời chưa tính OT thật, để 0h
      setStats({ weeklyHours, onTime, lateCount, overtime: '0h' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  const handleCheckIn = async () => {
    if (!employeeId) {
      alert('Không tìm thấy thông tin nhân viên (user.id). Vui lòng đăng nhập lại.');
      return;
    }
    try {
      await checkIn(employeeId);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data || 'Không thể check-in');
    }
  };

  const handleCheckOut = async () => {
    if (!employeeId) {
      alert('Không tìm thấy thông tin nhân viên (user.id). Vui lòng đăng nhập lại.');
      return;
    }
    try {
      await checkOut(employeeId);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data || 'Không thể check-out');
    }
  };

  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : '—');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2">Chấm công</h1>
        <p className="text-gray-600">Quản lý thời gian làm việc của bạn</p>
      </div>

      {/* Check In/Out Card */}
      <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-lg shadow-lg p-8 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Clock size={32} />
              <div>
                <h2 className="text-white">Chấm công hôm nay</h2>
                <p className="text-green-100 text-sm">{new Date().toLocaleDateString('vi-VN')}</p>
              </div>
            </div>

            <div className="text-6xl mb-4">{currentTime}</div>

            <div className="flex gap-4">
              <button
                className="bg-white text-green-700 px-8 py-3 rounded-lg hover:bg-green-50 transition"
                onClick={handleCheckIn}
                disabled={loading}
              >
                Check In
              </button>
              <button
                className="bg-white/20 text-white px-8 py-3 rounded-lg hover:bg-white/30 transition"
                onClick={handleCheckOut}
                disabled={loading}
              >
                Check Out
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-green-100 text-sm mb-1">Check In</div>
              <div className="text-2xl">{today?.checkIn || '--:--'}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-green-100 text-sm mb-1">Check Out</div>
              <div className="text-2xl">{today?.checkOut || '--:--'}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-green-100 text-sm mb-1">Tổng giờ</div>
              <div className="text-2xl">{today?.totalHours ?? '0h'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Giờ làm tuần này" value={stats.weeklyHours} color="blue" icon={Clock} />
        <StatCard title="Đúng giờ" value={stats.onTime} color="green" icon={CheckCircle} />
        <StatCard title="Đi muộn" value={stats.lateCount} color="red" icon={XCircle} />
        <StatCard title="Tăng ca" value={stats.overtime} color="purple" icon={TrendingUp} />
      </div>

      {/* History */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b flex items-center justify-between">
          <h3>Lịch sử chấm công</h3>
          <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm">
            <option>Tháng này</option>
            <option>Tháng trước</option>
            <option>3 tháng</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 text-xs text-gray-600">Ngày</th>
                <th className="text-left p-4 text-xs text-gray-600">Check In</th>
                <th className="text-left p-4 text-xs text-gray-600">Check Out</th>
                <th className="text-left p-4 text-xs text-gray-600">Tổng giờ</th>
                <th className="text-left p-4 text-xs text-gray-600">Trạng thái</th>
                <th className="text-left p-4 text-xs text-gray-600">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-500">Không có lịch sử chấm công.</td>
                </tr>
              ) : (
                history.map((record, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-4 text-gray-700">{record.date}</td>
                    <td className="p-4 text-gray-700">{record.checkIn || '--:--'}</td>
                    <td className="p-4 text-gray-700">{record.checkOut || '--:--'}</td>
                    <td className="p-4 text-gray-700">{record.totalHours ?? '0h'}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        record.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                        record.status === 'LATE' ? 'bg-red-100 text-red-700' :
                        record.status === 'LEAVE' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 text-sm">{record.note}</td>
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
      <div className="text-2xl text-gray-900 mb-1">{value}</div>
      <div className="text-xs text-gray-600">{title}</div>
    </div>
  );
}
