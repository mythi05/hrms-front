import { Calendar, Plus, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createLeaveRequest, getMyLeaveRequests } from '../../api/leaveApi';

export default function EmployeeLeave() {
  const [showModal, setShowModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [form, setForm] = useState({
    type: 'annual',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [leaveStats, setLeaveStats] = useState({
    ANNUAL: { used: 0, total: 12 },
    SICK: { used: 0, total: 10 },
    MARRIAGE: { used: 0, total: 3 },
    OTHER: { used: 0, total: 5 },
  });
  const [calendarStatus, setCalendarStatus] = useState({}); // key: 'yyyy-MM-dd' -> 'APPROVED' | 'PENDING'

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

  const loadRequests = async () => {
    if (!employeeId) return;
    setLoading(true);
    try {
      const res = await getMyLeaveRequests(employeeId);
      const data = res.data || [];
      setRequests(data);

      // Tính số ngày nghỉ đã dùng theo loại, trong năm hiện tại
      const now = new Date();
      const currentYear = now.getFullYear();
      const stats = {
        ANNUAL: { used: 0, total: 12 },
        SICK: { used: 0, total: 10 },
        MARRIAGE: { used: 0, total: 3 },
        OTHER: { used: 0, total: 5 },
      };

      const calendar = {}; // lưu trạng thái từng ngày trong tháng hiện tại

      data.forEach(l => {
        if (!l.leaveType || !l.startDate || !l.endDate) return;

        // Parse dates with better handling
        let start = new Date(l.startDate);
        let end = new Date(l.endDate);
        
        // Handle different date formats
        if (typeof l.startDate === 'string') {
          if (l.startDate.includes('T')) {
            start = new Date(l.startDate.split('T')[0]);
          } else if (l.startDate.includes('-')) {
            start = new Date(l.startDate);
          }
        }
        
        if (typeof l.endDate === 'string') {
          if (l.endDate.includes('T')) {
            end = new Date(l.endDate.split('T')[0]);
          } else if (l.endDate.includes('-')) {
            end = new Date(l.endDate);
          }
        }
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return;

        // Chỉ tính các đơn trong năm hiện tại
        if (start.getFullYear() !== currentYear && end.getFullYear() !== currentYear) return;

        const keyType = l.leaveType.toUpperCase();
        const numDays = typeof l.daysCount === 'number' ? l.daysCount : parseFloat(l.daysCount || '0');
        if (!isNaN(numDays) && stats[keyType]) {
          // Trừ luôn cả APPROVED và PENDING khỏi quota (coi PENDING là đã giữ chỗ)
          stats[keyType].used += numDays;
        }

        // Đánh dấu lên lịch cho tháng hiện tại
        const iter = new Date(start);
        while (iter <= end) {
          const iso = iter.toISOString().slice(0, 10); // yyyy-MM-dd
          const monthMatch = iter.getMonth() === currentMonth.getMonth() && iter.getFullYear() === currentMonth.getFullYear();
          if (monthMatch) {
            // Ưu tiên APPROVED > PENDING
            if (l.status === 'APPROVED') {
              calendar[iso] = 'APPROVED';
            } else if (l.status === 'PENDING' && calendar[iso] !== 'APPROVED') {
              calendar[iso] = 'PENDING';
            }
          }

          iter.setDate(iter.getDate() + 1);
        }
      });

      setLeaveStats(stats);
      setCalendarStatus(calendar);
    } catch (err) {
      console.error('Lỗi tải lịch sử nghỉ phép:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId, currentMonth]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2">Quản lý nghỉ phép</h1>
          <p className="text-gray-600">Đăng ký và theo dõi đơn nghỉ phép</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg shadow hover:bg-green-700 transition"
        >
          <Plus size={20} />
          Tạo đơn xin nghỉ
        </button>
      </div>

      {/* Leave Balance */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <LeaveBalanceCard
          type="Phép năm"
          available={Math.max(leaveStats.ANNUAL.total - leaveStats.ANNUAL.used, 0)}
          total={leaveStats.ANNUAL.total}
          color="blue"
        />
        <LeaveBalanceCard
          type="Phép ốm"
          available={Math.max(leaveStats.SICK.total - leaveStats.SICK.used, 0)}
          total={leaveStats.SICK.total}
          color="green"
        />
        <LeaveBalanceCard
          type="Phép cưới"
          available={Math.max(leaveStats.MARRIAGE.total - leaveStats.MARRIAGE.used, 0)}
          total={leaveStats.MARRIAGE.total}
          color="purple"
        />
        <LeaveBalanceCard
          type="Khác"
          available={Math.max(leaveStats.OTHER.total - leaveStats.OTHER.used, 0)}
          total={leaveStats.OTHER.total}
          color="orange"
        />
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Lịch nghỉ phép</h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                const newMonth = new Date(currentMonth);
                newMonth.setMonth(newMonth.getMonth() - 1);
                setCurrentMonth(newMonth);
              }}
              className="p-2 hover:bg-gray-100 rounded"
            >
              ←
            </button>
            <span className="text-sm font-medium">
              {currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
            </span>
            <button 
              onClick={() => {
                const newMonth = new Date(currentMonth);
                newMonth.setMonth(newMonth.getMonth() + 1);
                setCurrentMonth(newMonth);
              }}
              className="p-2 hover:bg-gray-100 rounded"
            >
              →
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day, index) => (
            <div key={index} className="text-center text-xs text-gray-600 p-2 font-medium">{day}</div>
          ))}
          {(() => {
            const year = currentMonth.getFullYear();
            const month = currentMonth.getMonth();
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const daysInMonth = lastDay.getDate();
            const startDayOfWeek = firstDay.getDay();
            
            const days = [];
            
            // Add empty cells for days before month starts
            for (let i = 0; i < startDayOfWeek; i++) {
              days.push(<div key={`empty-${i}`} className="p-2"></div>);
            }
            
            // Add days of the month
            for (let day = 1; day <= daysInMonth; day++) {
              const dateObj = new Date(year, month, day);
              const iso = dateObj.toISOString().slice(0, 10);
              const status = calendarStatus[iso];
              
              const cls =
                status === 'APPROVED'
                  ? 'bg-green-100 text-green-700 font-medium'
                  : status === 'PENDING'
                  ? 'bg-yellow-100 text-yellow-700 font-medium'
                  : 'hover:bg-gray-50';
              
              days.push(
                <div
                  key={day}
                  className={`text-center p-2 rounded-lg text-sm cursor-pointer ${cls}`}
                >
                  {day}
                </div>
              );
            }
            
            return days;
          })()}
        </div>
        <div className="flex gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 rounded"></div>
            <span className="text-gray-600">Đã duyệt</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 rounded"></div>
            <span className="text-gray-600">Chờ duyệt</span>
          </div>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3>Lịch sử đơn nghỉ phép</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 text-xs text-gray-600">Loại</th>
                <th className="text-left p-4 text-xs text-gray-600">Từ ngày</th>
                <th className="text-left p-4 text-xs text-gray-600">Đến ngày</th>
                <th className="text-left p-4 text-xs text-gray-600">Số ngày</th>
                <th className="text-left p-4 text-xs text-gray-600">Lý do</th>
                <th className="text-left p-4 text-xs text-gray-600">Trạng thái</th>
                <th className="text-left p-4 text-xs text-gray-600">Người duyệt</th>
                <th className="text-left p-4 text-xs text-gray-600">Ghi chú duyệt/Từ chối</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500">Đang tải dữ liệu...</td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500">Chưa có đơn nghỉ phép nào.</td>
                </tr>
              ) : (
                requests.map((leave) => {
                  const typeMap = {
                    ANNUAL: 'Phép năm',
                    SICK: 'Phép ốm',
                    MARRIAGE: 'Phép cưới',
                    MATERNITY: 'Nghỉ thai sản',
                    UNPAID: 'Nghỉ không lương',
                    OTHER: 'Khác',
                  };

                  const status = leave.status;

                  return (
                    <tr key={leave.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 text-gray-700">{typeMap[leave.leaveType] || leave.leaveType}</td>
                      <td className="p-4 text-gray-700">{leave.startDate}</td>
                      <td className="p-4 text-gray-700">{leave.endDate}</td>
                      <td className="p-4 text-gray-700">{leave.daysCount} ngày</td>
                      <td className="p-4 text-gray-700 break-words max-w-xs">{leave.reason}</td>
                      <td className="p-4">
                        {status === 'APPROVED' && (
                          <span className="flex items-center gap-2 text-green-700">
                            <CheckCircle size={16} />
                            <span className="text-xs">Đã duyệt</span>
                          </span>
                        )}
                        {status === 'PENDING' && (
                          <span className="flex items-center gap-2 text-yellow-700">
                            <Clock size={16} />
                            <span className="text-xs">Chờ duyệt</span>
                          </span>
                        )}
                        {status === 'REJECTED' && (
                          <span className="flex items-center gap-2 text-red-700">
                            <XCircle size={16} />
                            <span className="text-xs">Từ chối</span>
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-gray-700">{leave.approverName || '-'}</td>
                      <td className="p-4 text-gray-700 text-xs max-w-xs break-words">{leave.rejectReason || '-'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-green-600 to-green-700">
              <h2 className="text-white">Tạo đơn xin nghỉ phép</h2>
              <button onClick={() => setShowModal(false)} className="text-white hover:bg-white/20 p-2 rounded">×</button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Loại nghỉ phép *</label>
                <select 
                  value={form.type}
                  onChange={(e) => setForm({...form, type: e.target.value})}
                  className="border border-gray-300 p-3 rounded-lg w-full"
                >
                  <option value="annual">Phép năm</option>
                  <option value="sick">Phép ốm</option>
                  <option value="marriage">Phép cưới</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Từ ngày *</label>
                  <input 
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({...form, startDate: e.target.value})}
                    className="border border-gray-300 p-3 rounded-lg w-full"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Đến ngày *</label>
                  <input 
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({...form, endDate: e.target.value})}
                    className="border border-gray-300 p-3 rounded-lg w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Lý do *</label>
                <textarea 
                  value={form.reason}
                  onChange={(e) => setForm({...form, reason: e.target.value})}
                  className="border border-gray-300 p-3 rounded-lg w-full"
                  rows={4}
                  placeholder="Nhập lý do xin nghỉ phép..."
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
                <div className="text-sm text-blue-800">
                  <strong>Lưu ý:</strong> Đơn xin nghỉ phép cần được gửi trước ít nhất 3 ngày. 
                  Quản lý trực tiếp sẽ xem xét và phê duyệt đơn của bạn.
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-6 py-2.5 bg-gray-200 rounded-lg">
                Hủy
              </button>
              <button
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700"
                onClick={async () => {
                  if (!employeeId) {
                    alert('Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.');
                    return;
                  }
                  if (!form.startDate || !form.endDate || !form.reason) {
                    alert('Vui lòng nhập đầy đủ ngày bắt đầu, ngày kết thúc và lý do.');
                    return;
                  }

                  const leaveTypeMap = {
                    annual: 'ANNUAL',
                    sick: 'SICK',
                    marriage: 'MARRIAGE',
                    other: 'OTHER',
                  };

                  try {
                    await createLeaveRequest({
                      employeeId,
                      leaveType: leaveTypeMap[form.type] || 'OTHER',
                      startDate: form.startDate,
                      endDate: form.endDate,
                      reason: form.reason,
                    });
                    setShowModal(false);
                    // Reset form nhẹ
                    setForm({ type: 'annual', startDate: '', endDate: '', reason: '' });
                    await loadRequests();
                  } catch (err) {
                    console.error('Lỗi gửi đơn nghỉ phép:', err);
                    alert(err.response?.data?.message || 'Không thể gửi đơn nghỉ phép');
                  }
                }}
              >
                Gửi đơn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LeaveBalanceCard({ type, available, total, color }) {
  const colors = {
    blue: 'from-blue-500 to-blue-700',
    green: 'from-green-500 to-green-700',
    purple: 'from-purple-500 to-purple-700',
    orange: 'from-orange-500 to-orange-700',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-lg shadow p-6 text-white`}>
      <Calendar size={24} className="mb-3" />
      <div className="text-3xl mb-1">{available}</div>
      <div className="text-white/80 text-sm">/ {total} ngày</div>
      <div className="mt-2 pt-2 border-t border-white/20">
        <div className="text-xs text-white/90">{type}</div>
      </div>
    </div>
  );
}
