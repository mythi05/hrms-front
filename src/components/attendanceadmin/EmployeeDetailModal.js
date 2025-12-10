import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, User, AlertCircle, TrendingUp } from "lucide-react";
import { getAttendanceOfMonth, formatAttendanceRecords } from "../../api/attendanceApi";
import { employeeApi } from "../../api/employeeApi";

export default function EmployeeDetailModal({ isOpen, onClose }) {
  const [detailEmpId, setDetailEmpId] = useState("");
  const [detailMonth, setDetailMonth] = useState(12); // December
  const [detailYear, setDetailYear] = useState(2025); // 2025
  const [detailRecords, setDetailRecords] = useState([]);
  const [detailSummary, setDetailSummary] = useState({
    totalHours: 0,
    workedDays: 0,
    lateDays: 0,
    offDays: 0,
  });
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [loadingEmployee, setLoadingEmployee] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  // Lấy thông tin nhân viên khi nhập ID
  const fetchEmployeeInfo = async (empId) => {
    if (!empId) {
      setEmployeeInfo(null);
      return;
    }
    
    setLoadingEmployee(true);
    try {
      const res = await employeeApi.getById(empId);
      setEmployeeInfo(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy thông tin nhân viên:", err);
      setEmployeeInfo(null);
    } finally {
      setLoadingEmployee(false);
    }
  };

  // Fetch employee info khi ID thay đổi
  useEffect(() => {
    if (detailEmpId) {
      fetchEmployeeInfo(detailEmpId);
    } else {
      setEmployeeInfo(null);
    }
  }, [detailEmpId]);

  // Lấy chi tiết chấm công theo nhân viên + tháng/năm
  const fetchEmployeeDetail = async () => {
    if (!detailEmpId) {
      alert("Vui lòng nhập ID nhân viên để xem chi tiết chấm công.");
      return;
    }
    
    // Đợi employee info load xong trước khi fetch attendance
    if (!employeeInfo) {
      await fetchEmployeeInfo(detailEmpId);
      // Chờ một chút để state update
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Kiểm tra lại employee info sau khi fetch
    if (!employeeInfo) {
      alert("Không tìm thấy thông tin nhân viên. Vui lòng kiểm tra lại ID.");
      return;
    }
    
    setLoadingAttendance(true);
    try {
      const res = await getAttendanceOfMonth(Number(detailEmpId), Number(detailMonth), Number(detailYear));
      const raw = res.data || [];
      const formatted = formatAttendanceRecords(raw);
      setDetailRecords(formatted);

      // Tính tổng giờ và thống kê cho nhân viên đó trong tháng
      let totalHours = 0;
      let workedDays = 0;
      let lateDays = 0;
      let offDays = 0;

      raw.forEach(r => {
        if (r.totalHours) {
          const num = typeof r.totalHours === 'number' ? r.totalHours : parseFloat(r.totalHours);
          if (!isNaN(num)) totalHours += num;
        }
        if (r.status === 'PRESENT' || r.status === 'LATE') workedDays++;
        if (r.status === 'LATE') lateDays++;
        if (r.status === 'LEAVE' || r.status === 'ABSENT' || r.status === 'HOLIDAY') offDays++;
      });

      setDetailSummary({ totalHours, workedDays, lateDays, offDays });
    } catch (err) {
      console.error("Lỗi khi tải chi tiết chấm công nhân viên:", err);
      alert("Không thể tải chi tiết chấm công của nhân viên này.");
      setDetailRecords([]);
      setDetailSummary({ totalHours: 0, workedDays: 0, lateDays: 0, offDays: 0 });
    } finally {
      setLoadingAttendance(false);
    }
  };

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <style dangerouslySetInnerHTML={{
        __html: `
          .modal-content {
            height: 90vh;
            overflow-y: auto;
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
          }
          .modal-content::-webkit-scrollbar {
            width: 6px;
          }
          .modal-content::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 3px;
          }
          .modal-content::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 3px;
          }
          .modal-content::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
          * {
            box-sizing: border-box;
          }
        `
      }} />
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col backdrop-blur-sm">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <User className="text-white" size={24} />
            <h2 className="text-xl font-semibold text-white">Chi tiết Chấm công Nhân viên</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-all duration-200 hover:rotate-90"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="modal-content p-6 flex-1">
          {/* Search Section */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">ID Nhân viên</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={detailEmpId}
                    onChange={e => setDetailEmpId(e.target.value)}
                    placeholder="Nhập ID nhân viên"
                  />
                  {loadingEmployee && (
                    <div className="text-sm text-gray-500 animate-pulse">Đang tải...</div>
                  )}
                </div>
                {employeeInfo && (
                  <div className="text-sm text-green-600 mt-2 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    {employeeInfo.fullName} - {employeeInfo.department || 'Chưa có phòng ban'}
                  </div>
                )}
                {!loadingEmployee && detailEmpId && !employeeInfo && (
                  <div className="text-sm text-red-500 mt-2 flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Không tìm thấy nhân viên
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tháng</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-20 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={detailMonth}
                  onChange={e => setDetailMonth(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Năm</label>
                <input
                  type="number"
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={detailYear}
                  onChange={e => setDetailYear(e.target.value)}
                />
              </div>
              
              <button
                onClick={fetchEmployeeDetail}
                disabled={!detailEmpId || loadingEmployee || loadingAttendance}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg text-sm hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loadingAttendance ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang tải...
                  </span>
                ) : loadingEmployee ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang tải thông tin...
                  </span>
                ) : 'Xem chi tiết'}
              </button>
            </div>
          </div>

          {/* Results Section */}
          {employeeInfo && detailRecords.length > 0 && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="text-blue-600" size={20} />
                    <span className="text-sm font-medium text-blue-800">Tổng giờ làm</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    {detailSummary.totalHours.toFixed ? detailSummary.totalHours.toFixed(2) : detailSummary.totalHours}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">giờ</div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="text-green-600" size={20} />
                    <span className="text-sm font-medium text-green-800">Ngày đi làm</span>
                  </div>
                  <div className="text-2xl font-bold text-green-900">{detailSummary.workedDays}</div>
                  <div className="text-xs text-green-600 mt-1">ngày</div>
                </div>
                
                <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="text-red-600" size={20} />
                    <span className="text-sm font-medium text-red-800">Ngày đi muộn</span>
                  </div>
                  <div className="text-2xl font-bold text-red-900">{detailSummary.lateDays}</div>
                  <div className="text-xs text-red-600 mt-1">ngày</div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="text-purple-600" size={20} />
                    <span className="text-sm font-medium text-purple-800">Ngày nghỉ</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-900">{detailSummary.offDays}</div>
                  <div className="text-xs text-purple-600 mt-1">ngày</div>
                </div>
              </div>

              {/* Employee Info Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-4 shadow-sm">
                <div className="text-sm font-medium text-gray-700">
                  Chi tiết chấm công cho: <span className="text-blue-600 font-semibold">{employeeInfo.fullName}</span>
                  <span className="text-gray-500 ml-2">({employeeInfo.department || 'Chưa có phòng ban'})</span>
                </div>
              </div>

              {/* Attendance Table */}
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm mb-6">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                      <tr>
                        <th className="text-left p-4 text-xs text-gray-600 font-medium whitespace-nowrap">Ngày</th>
                        <th className="text-left p-4 text-xs text-gray-600 font-medium whitespace-nowrap">Check In</th>
                        <th className="text-left p-4 text-xs text-gray-600 font-medium whitespace-nowrap">Check Out</th>
                        <th className="text-left p-4 text-xs text-gray-600 font-medium whitespace-nowrap">Tổng giờ</th>
                        <th className="text-left p-4 text-xs text-gray-600 font-medium whitespace-nowrap">Trạng thái</th>
                        <th className="text-left p-4 text-xs text-gray-600 font-medium whitespace-nowrap">Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailRecords.map((r, index) => (
                        <tr key={r.id} className={`border-b hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <td className="p-4 text-gray-700 text-sm font-medium whitespace-nowrap">{r.date}</td>
                          <td className="p-4 text-gray-700 text-sm whitespace-nowrap">{r.checkIn || '--:--'}</td>
                          <td className="p-4 text-gray-700 text-sm whitespace-nowrap">{r.checkOut || '--:--'}</td>
                          <td className="p-4 text-gray-700 text-sm font-semibold whitespace-nowrap">{r.totalHours ?? '0h'}</td>
                          <td className="p-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(r.status)}`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="p-4 text-gray-500 text-sm whitespace-nowrap">{r.note || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
              )}

          {employeeInfo && !loadingAttendance && detailRecords.length === 0 && (
            <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
              <AlertCircle className="text-gray-400 mx-auto mb-4" size={64} />
              <p className="text-gray-600 text-lg font-medium mb-2">Không có dữ liệu chấm công</p>
              <p className="text-gray-500 text-sm">Thử kiểm tra lại tháng/năm hoặc đảm bảo có dữ liệu chấm công cho nhân viên này</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
