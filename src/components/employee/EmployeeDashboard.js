import { Clock, Calendar, DollarSign, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { getEmployeeStats, getEmployeePayrollTrends } from '../../api/dashboardApi';
import { getTodayAttendance, getAttendanceHistory } from '../../api/attendanceApi';
import { getMyLeaveRequests } from '../../api/leaveApi';
import { getMyCurrentPayroll } from '../../api/payrollApi';
import { PayrollTrendChart } from '../charts/PayrollTrendChart';

// Export default để dễ import
export default function EmployeeDashboard({ setCurrentPage }) {
  const [stats, setStats] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [currentPayroll, setCurrentPayroll] = useState(null);
  const [payrollTrends, setPayrollTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentUser = useMemo(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser?.id) {
        setError('Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [statsRes, todayRes, historyRes, leaveRes, payrollRes, payrollTrendsRes] = await Promise.all([
          getEmployeeStats(currentUser.id),
          getTodayAttendance(currentUser.id),
          getAttendanceHistory(currentUser.id),
          getMyLeaveRequests(currentUser.id),
          getMyCurrentPayroll(currentUser.id),
          getEmployeePayrollTrends(currentUser.id)
        ]);
        
        setStats(statsRes.data);
        setTodayAttendance(todayRes.data);
        setAttendanceHistory(historyRes.data || []);
        setLeaveRequests(leaveRes.data || []);
        setCurrentPayroll(payrollRes.data);
        setPayrollTrends(payrollTrendsRes.data || []);
      } catch (err) {
        console.error('Error loading employee dashboard data:', err);
        setError('Không thể tải dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  const formatMoney = (v) => {
    if (v == null) return '0đ';
    const num = Number(v);
    if (Number.isNaN(num)) return `${v}đ`;
    return num.toLocaleString('vi-VN') + 'đ';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickAction 
          title="Check In/Out"
          subtitle={todayAttendance?.checkIn && !todayAttendance?.checkOut ? "Đã check in" : todayAttendance?.checkOut ? "Đã check out" : "Chưa chấm công"}
          icon={Clock}
          color="blue"
          buttonText={todayAttendance?.checkIn && !todayAttendance?.checkOut ? "Check Out" : "Check In"}
          onClick={() => setCurrentPage('attendance')}
        />
        <QuickAction 
          title="Xin nghỉ phép"
          subtitle={`${stats?.remainingLeaveDays || 0} ngày còn lại`}
          icon={Calendar}
          color="orange"
          buttonText="Tạo đơn"
          onClick={() => setCurrentPage('leave')}
        />
        <QuickAction 
          title="Phiếu lương"
          subtitle={currentPayroll ? `Tháng ${String(currentPayroll.month).padStart(2, '0')}` : "Chưa có dữ liệu"}
          icon={DollarSign}
          color="green"
          buttonText="Xem chi tiết"
          onClick={() => setCurrentPage('payroll')}
        />
        <QuickAction 
          title="Hiệu suất"
          subtitle={`${stats?.presentDays || 0}/${stats?.totalDays || 0} ngày đi làm`}
          icon={TrendingUp}
          color="purple"
          buttonText="Xem điểm"
          onClick={() => setCurrentPage('performance')}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          title="Giờ làm tháng này" 
          value={`${stats?.presentDays || 0} ngày`} 
          subtitle={`/ ${stats?.totalDays || 0} ngày`} 
          color="blue" 
          onClick={() => setCurrentPage('attendance')}
        />
        <StatCard 
          title="Ngày phép còn lại" 
          value={stats?.remainingLeaveDays || 0} 
          subtitle="ngày" 
          color="green" 
          onClick={() => setCurrentPage('leave')}
        />
        <StatCard 
          title="Đi muộn" 
          value={stats?.lateDays || 0} 
          subtitle="lần" 
          color="red" 
          onClick={() => setCurrentPage('attendance')}
        />
        <StatCard 
          title="Tăng ca" 
          value={`${stats?.overtimeHours || 0}h`} 
          subtitle="tháng này" 
          color="purple" 
          onClick={() => setCurrentPage('attendance')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance This Week */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentPage('attendance')}>
          <h3 className="mb-4">Lịch sử chấm công tuần này</h3>
          <div className="space-y-3">
            {attendanceHistory.length === 0 ? (
              <div className="text-gray-500 text-sm">Chưa có dữ liệu chấm công</div>
            ) : (
              attendanceHistory.slice(0, 5).map((record, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-center gap-4">
                    {record.isLate ? (
                      <XCircle size={20} className="text-red-500" />
                    ) : record.checkIn ? (
                      <CheckCircle size={20} className="text-green-500" />
                    ) : (
                      <XCircle size={20} className="text-gray-400" />
                    )}
                    <div>
                      <div className="text-gray-800">
                        {new Date(record.date).toLocaleDateString('vi-VN', { weekday: 'long' })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(record.date).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-800">
                      {record.checkIn ? new Date(record.checkIn).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--'} 
                      {' - '}
                      {record.checkOut ? new Date(record.checkOut).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </div>
                    <div className={`text-xs ${
                      record.isLate ? 'text-red-600' : 
                      record.checkIn && !record.checkOut ? 'text-blue-600' : 
                      record.checkIn ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {record.isLate ? 'Đi muộn' : 
                       record.checkIn && !record.checkOut ? 'Đang làm' :
                       record.checkIn ? 'Đúng giờ' : 'Vắng mặt'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Events & Leave */}
        <div className="space-y-6">
          {/* Leave Balance */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg shadow p-6 text-white cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentPage('leave')}>
            <h3 className="mb-4 text-white">Số ngày phép</h3>
            <div className="text-center">
              <div className="text-5xl mb-2">{stats?.remainingLeaveDays || 0}</div>
              <div className="text-blue-100">ngày còn lại</div>
              <div className="mt-4 pt-4 border-t border-blue-400">
                <div className="flex justify-between text-sm">
                  <span>Tổng phép năm:</span>
                  <span>{stats?.totalLeaveDays || 12} ngày</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span>Đã sử dụng:</span>
                  <span>{stats?.usedLeaveDays || 0} ngày</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="mb-4">Thông báo</h3>
            <div className="space-y-3">
              {leaveRequests.filter(lr => lr.status === 'APPROVED').slice(0, 3).map((request, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 rounded-full mt-2 bg-green-500"></div>
                  <div className="flex-1">
                    <div className="text-gray-800 text-sm">Đơn nghỉ phép đã duyệt</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(request.startDate).toLocaleDateString('vi-VN')} - {new Date(request.endDate).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
              ))}
              {currentPayroll && (
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 rounded-full mt-2 bg-blue-500"></div>
                  <div className="flex-1">
                    <div className="text-gray-800 text-sm">Phiếu lương tháng {String(currentPayroll.month).padStart(2, '0')}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Lương: {formatMoney(currentPayroll.netSalary)}
                    </div>
                  </div>
                </div>
              )}
              {leaveRequests.filter(lr => lr.status === 'APPROVED').length === 0 && !currentPayroll && (
                <div className="text-gray-500 text-sm">Không có thông báo mới</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Biểu đồ xu hướng lương */}
      <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentPage('payroll')}>
        <h3 className="mb-4">Xu hướng lương 6 tháng gần nhất</h3>
        <PayrollTrendChart data={payrollTrends} />
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="mb-4">Hoạt động gần đây</h3>
        <div className="space-y-3">
          {attendanceHistory.slice(0, 3).map((record, index) => {
            const isToday = new Date(record.date).toDateString() === new Date().toDateString();
            return (
              <div key={index} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Clock size={18} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="text-gray-800">
                    {record.checkIn ? 'Chấm công vào' : 'Vắng mặt'}
                    {isToday && ' (hôm nay)'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {record.checkIn ? new Date(record.checkIn).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--'} - 
                    {new Date(record.date).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>
            );
          })}
          {attendanceHistory.length === 0 && (
            <div className="text-gray-500 text-sm">Chưa có hoạt động nào</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Inner Components ----------
function QuickAction({ title, subtitle, icon: Icon, color, buttonText, onClick }) {
  const colors = {
    blue: 'from-blue-500 to-blue-700',
    orange: 'from-orange-500 to-orange-700',
    green: 'from-green-500 to-green-700',
    purple: 'from-purple-500 to-purple-700',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-lg shadow p-6 text-white cursor-pointer hover:shadow-lg transition-shadow`} onClick={onClick}>
      <Icon size={32} className="mb-3" />
      <h3 className="text-white mb-1">{title}</h3>
      <p className="text-white/80 text-xs mb-4">{subtitle}</p>
      <button className="w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg transition text-sm">
        {buttonText}
      </button>
    </div>
  );
}

function StatCard({ title, value, subtitle, color, onClick }) {
  const colors = {
    blue: 'border-blue-500 bg-blue-50',
    green: 'border-green-500 bg-green-50',
    red: 'border-red-500 bg-red-50',
    purple: 'border-purple-500 bg-purple-50',
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow p-4 border-l-4 ${colors[color]} cursor-pointer hover:shadow-md transition-shadow`} 
      onClick={onClick}
    >
      <div className="text-xs text-gray-600 mb-1">{title}</div>
      <div className="flex items-end gap-2">
        <div className="text-2xl text-gray-900">{value}</div>
        <div className="text-xs text-gray-500 mb-1">{subtitle}</div>
      </div>
    </div>
  );
}
