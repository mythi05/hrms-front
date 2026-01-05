// src/pages/EmployeeAttendanceAdmin.jsx (Bản dành cho Admin)
import React, { useState, useEffect } from "react";
import { Clock, TrendingUp, CheckCircle, XCircle, Trash2, Edit, Upload, Download, User, Plus } from "lucide-react";
import { adminGetAllAttendance, adminDeleteAttendance, adminDeleteAllAttendance, formatAttendanceRecords } from "../../api/attendanceApi";
import { createAttendanceQR, getAttendanceQRsByDate, getRecentQRScans, getQRImageBlob, getQRImageUrl } from "../../api/qrAttendanceApi";
import AttendanceModal from "./AttendanceModal";
import EmployeeDetailModal from "./EmployeeDetailModal";

// Component phụ cho thẻ thống kê (giữ nguyên từ bản Employee)
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

export default function EmployeeAttendanceAdmin() {
  const [allAttendance, setAllAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('vi-VN'));
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState({
    totalToday: 0,
    onTimeToday: 0,
    lateToday: 0,
    absentToday: 0,
    workedMonth: 0,
    lateMonth: 0,
    offMonth: 0,
  });

  const [qrForm, setQrForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    shiftType: "FULL_TIME",
    scanType: "CHECK_IN",
    validFrom: "00:00",
    validTo: "23:59",
  });
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState("");
  const [qrList, setQrList] = useState([]);
  const [qrImageMap, setQrImageMap] = useState({});

  const [recentScans, setRecentScans] = useState([]);
  const [recentLoading, setRecentLoading] = useState(false);

  // Modal states
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Cập nhật đồng hồ live
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString('vi-VN')), 1000);
    return () => clearInterval(timer);
  }, []);

  // Lấy toàn bộ dữ liệu chấm công cho Admin
  const fetchAllAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminGetAllAttendance();
      const raw = res.data || [];
      // Lưu bảng đã format cho hiển thị
      setAllAttendance(formatAttendanceRecords(raw));

      // Tính thống kê thật cho hôm nay
      const now = new Date();
      const todayIso = now.toISOString().slice(0, 10); // yyyy-MM-dd
      const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`; // yyyy-MM

      const todayRecords = raw.filter(r => r.date === todayIso);
      const monthRecords = raw.filter(r => (r.date || '').startsWith(monthPrefix));

      const totalToday   = todayRecords.length;
      const onTimeToday  = todayRecords.filter(r => r.status === 'PRESENT').length;
      const lateToday    = todayRecords.filter(r => r.status === 'LATE').length;
      const absentToday  = todayRecords.filter(r => r.status === 'LEAVE' || r.status === 'ABSENT' || r.status === 'HOLIDAY').length;

      // Thống kê theo tháng: tính trên số bản ghi chấm công trong tháng
      const workedMonth  = monthRecords.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
      const lateMonth    = monthRecords.filter(r => r.status === 'LATE').length;
      const offMonth     = monthRecords.filter(r => r.status === 'LEAVE' || r.status === 'ABSENT' || r.status === 'HOLIDAY').length;

      setStats({ totalToday, onTimeToday, lateToday, absentToday, workedMonth, lateMonth, offMonth });
    } catch (err) {
      console.error("Lỗi khi tải toàn bộ dữ liệu chấm công:", err);
      setError("Không thể tải dữ liệu chấm công cho Admin.");
    }
    setLoading(false);
  };

  const loadQRForToday = async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const res = await getAttendanceQRsByDate(today);
      setQrList(res.data || []);
    } catch (err) {
      console.error("Lỗi tải QR chấm công:", err);
    }
  };

  useEffect(() => {
    // cleanup old object urls when qrList changes
    return () => {
      try {
        Object.values(qrImageMap).forEach((u) => {
          if (typeof u === 'string' && u.startsWith('blob:')) URL.revokeObjectURL(u);
        });
      } catch {
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrList]);

  const ensureBlobImage = async (qrCode) => {
    if (!qrCode) return;
    if (qrImageMap[qrCode]) return;
    try {
      const res = await getQRImageBlob(qrCode, 260, 260);
      const url = URL.createObjectURL(res.data);
      setQrImageMap((prev) => ({ ...prev, [qrCode]: url }));
    } catch (e) {
      // keep silent; UI will continue showing broken image if both methods fail
    }
  };

  const loadRecent = async (withLoading = true) => {
    if (withLoading) setRecentLoading(true);
    try {
      const res = await getRecentQRScans(20);
      setRecentScans(res.data || []);
    } catch (err) {
      console.error("Lỗi tải lịch sử quét QR:", err);
    }
    if (withLoading) setRecentLoading(false);
  };

  const handleQrFormChange = (e) => {
    const { name, value } = e.target;
    setQrForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitCreateQR = async () => {
    setQrLoading(true);
    setQrError("");
    try {
      const payload = {
        date: qrForm.date,
        shiftType: qrForm.shiftType,
        scanType: qrForm.scanType,
        validFrom: qrForm.validFrom,
        validTo: qrForm.validTo,
      };
      await createAttendanceQR(payload);
      await loadQRForToday();
      alert("Tạo QR chấm công thành công!");
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "Không thể tạo QR";
      setQrError(String(msg));
    } finally {
      setQrLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAttendance();
    loadQRForToday();
    loadRecent();

    const interval = setInterval(() => {
      loadRecent(false);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Các hàm xử lý admin (cần được implement đầy đủ)
  const handleDelete = async (id) => {
    if (!window.confirm(`Bạn có chắc muốn xóa bản ghi chấm công ID: ${id}?`)) return;
    try {
      await adminDeleteAttendance(id);
      fetchAllAttendance(); // Reload lại data
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
      alert("Không thể xóa bản ghi");
    }
  };

  

  const handleEdit = (record) => {
    // Logic mở form/modal chỉnh sửa
    alert(`Chỉnh sửa bản ghi ID ${record.id}`);
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

  const filteredAttendance = (() => {
    const parseMonthYear = (dateStr) => {
      // dateStr currently formatted by formatAttendanceRecords() as dd/MM/yyyy
      if (!dateStr || typeof dateStr !== 'string') return null;
      const parts = dateStr.split('/');
      if (parts.length !== 3) return null;
      const m = Number(parts[1]);
      const y = Number(parts[2]);
      if (!Number.isFinite(m) || !Number.isFinite(y)) return null;
      return { m, y };
    };

    return (allAttendance || []).filter(r => {
      const my = parseMonthYear(r.date);
      return my && my.m === selectedMonth && my.y === selectedYear;
    });
  })();

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <h1 className="mb-2 text-2xl font-bold">Hệ thống Quản lý Chấm công</h1>
        <p className="text-gray-600">Tổng quan và quản lý thời gian làm việc của nhân viên</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setShowImportModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Upload size={18} />
          Import Chấm công
        </button>
        <button
          onClick={() => setShowExportModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
        >
          <Download size={18} />
          Export Chấm công
        </button>
        <button
          onClick={() => alert("Mở form thêm bản ghi mới")}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition flex items-center gap-2"
        >
          <Plus size={18} />
          Thêm Bản ghi
        </button>
 
      </div>

      {/* QR Attendance Management */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">QR chấm công theo ca</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4 md:col-span-1">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Ngày</label>
              <input
                type="date"
                name="date"
                value={qrForm.date}
                onChange={handleQrFormChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Ca làm</label>
              <select
                name="shiftType"
                value={qrForm.shiftType}
                onChange={handleQrFormChange}
                disabled
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="FULL_TIME">Full-time</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Loại quét</label>
              <select
                name="scanType"
                value={qrForm.scanType}
                onChange={handleQrFormChange}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="CHECK_IN">Vào ca (Check-in)</option>
                <option value="CHECK_OUT">Ra ca (Check-out)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Từ giờ</label>
                <input
                  type="time"
                  name="validFrom"
                  value={qrForm.validFrom}
                  onChange={handleQrFormChange}
                  disabled
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Đến giờ</label>
                <input
                  type="time"
                  name="validTo"
                  value={qrForm.validTo}
                  onChange={handleQrFormChange}
                  disabled
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>
            {qrError && (
              <div className="text-sm text-red-600">{qrError}</div>
            )}
            <button
              onClick={submitCreateQR}
              disabled={qrLoading}
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
            >
              {qrLoading ? "Đang tạo QR..." : "Tạo QR chấm công"}
            </button>
          </div>

          <div className="md:col-span-2 space-y-4">
            <h4 className="font-semibold text-gray-800">Danh sách QR ngày hôm nay</h4>
            {qrList.length === 0 ? (
              <div className="text-sm text-gray-500">Chưa có QR nào cho ngày hôm nay.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {qrList.map((qr) => (
                  <div key={qr.id} className="border rounded-lg p-3 flex flex-col items-center gap-2">
                    <div className="text-sm font-semibold text-gray-800">
                      {qr.shiftTypeDisplay} - {qr.scanTypeDisplay}
                    </div>
                    <div className="text-xs text-gray-500">Hiệu lực: {qr.timeRange}</div>
                    <img
                      src={qrImageMap[qr.qrCode] || getQRImageUrl(qr.qrCode, 260, 260)}
                      alt="QR chấm công"
                      className="w-full max-w-[220px] sm:max-w-[260px] border rounded"
                      onError={() => ensureBlobImage(qr.qrCode)}
                    />
                    <div className="text-[10px] text-gray-400 break-all">{qr.qrCode}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent QR Scans */}
      <div className="bg-white rounded-lg shadow mt-6">
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Lượt quét QR gần nhất</h3>
          <button
            onClick={() => loadRecent()}
            className="px-3 py-1 text-sm rounded-lg border hover:bg-gray-50"
          >
            Tải lại
          </button>
        </div>
        <div className="p-6 overflow-x-auto">
          {recentLoading ? (
            <div className="text-center text-gray-500 text-sm">Đang tải lượt quét QR...</div>
          ) : recentScans.length === 0 ? (
            <div className="text-center text-gray-500 text-sm">Chưa có lượt quét nào.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-2 text-xs text-gray-600">Thời gian</th>
                  <th className="text-left p-2 text-xs text-gray-600">Nhân viên</th>
                  <th className="text-left p-2 text-xs text-gray-600">Loại quét</th>
                  <th className="text-left p-2 text-xs text-gray-600">Ca</th>
                  <th className="text-left p-2 text-xs text-gray-600">Trạng thái</th>
                  <th className="text-left p-2 text-xs text-gray-600">Ghi chú lỗi</th>
                </tr>
              </thead>
              <tbody>
                {recentScans.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 text-gray-700">{log.scanTime}</td>
                    <td className="p-2 text-gray-700">{log.employeeId}</td>
                    <td className="p-2 text-gray-700">{log.scanType}</td>
                    <td className="p-2 text-gray-700">{log.shiftType}</td>
                    <td className="p-2 text-gray-700">{log.status}</td>
                    <td className="p-2 text-gray-500 text-xs">{log.errorMessage || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Đồng hồ và Thống kê nhanh chung */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-1 border-r pr-4">
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2"><Clock /> Giờ hệ thống</h2>
                <div className="text-4xl font-bold text-blue-600">{currentTime}</div>
            </div>
            {/* Thống kê thật dựa trên dữ liệu chấm công */}
            <StatCard
              title="Bản ghi chấm công (hôm nay)"
              value={stats.totalToday}
              color="blue"
              icon={CheckCircle}
            />
            <StatCard
              title="Ngày đi làm (tháng này)"
              value={stats.workedMonth}
              color="green"
              icon={TrendingUp}
            />
            <StatCard
              title="Ngày đi muộn (tháng này)"
              value={stats.lateMonth}
              color="red"
              icon={XCircle}
            />
            <StatCard
              title="Ngày nghỉ / Leave (tháng này)"
              value={stats.offMonth}
              color="purple"
              icon={Clock}
            />
        </div>
      </div>

      {/* Chi tiết Nhân viên Button */}
      <div className="d-flex justify-content-end mb-3" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button
          onClick={() => setShowDetailModal(true)}
          className="btn-employee-detail"
          style={{
            backgroundColor: '#9333ea',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#7c3aed'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#9333ea'}
        >
          <User size={18} />
          Chi tiết Nhân viên
        </button>
      </div>

      {/* Bảng dữ liệu chấm công toàn bộ */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-xl font-semibold text-gray-800">Bản ghi Chấm công theo tháng</h3>
            <div className="flex items-center gap-2">
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                disabled={loading}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                ))}
              </select>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                disabled={loading}
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const y = new Date().getFullYear() - i;
                  return (
                    <option key={y} value={y}>{y}</option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
            <div className="p-4 text-center">Đang tải dữ liệu toàn bộ chấm công...</div>
        ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full">
                <thead className="bg-gray-50 border-b">
                    <tr>
                    <th className="text-left p-4 text-xs text-gray-600">ID</th>
                    <th className="text-left p-4 text-xs text-gray-600">Nhân viên</th>
                    <th className="text-left p-4 text-xs text-gray-600">Phòng ban</th>
                    <th className="text-left p-4 text-xs text-gray-600">Ngày</th>
                    <th className="text-left p-4 text-xs text-gray-600">Check In</th>
                    <th className="text-left p-4 text-xs text-gray-600">Check Out</th>
                    <th className="text-left p-4 text-xs text-gray-600">Tổng giờ</th>
                    <th className="text-left p-4 text-xs text-gray-600">Trạng thái</th>
                    <th className="text-left p-4 text-xs text-gray-600">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredAttendance.length > 0 ? (
                    filteredAttendance.map((record) => (
                        <tr key={record.id} className="border-b hover:bg-gray-50">
                            <td className="p-4 text-gray-700">{record.id}</td>
                            <td className="p-4 text-gray-700">
                                <div className="font-medium">
                                    {record.employeeName || `NV${record.employeeId}`} 
                                    <span className="text-xs text-gray-500 ml-2">({record.employeeId})</span>
                                </div>
                            </td>
                            <td className="p-4 text-gray-700">{record.department || '-'}</td>
                            <td className="p-4 text-gray-700">{record.date || '-'}</td>
                            <td className="p-4 text-gray-700">{record.checkIn || '--:--'}</td>
                            <td className="p-4 text-gray-700">{record.checkOut || '--:--'}</td>
                            <td className="p-4 text-gray-700">{record.totalHours || '0h'}</td>
                            <td className="p-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(record.status)}`}>
                                    {record.status || 'Chưa rõ'}
                                </span>
                            </td>
                            <td className="p-4 flex gap-2">
                                <button onClick={() => handleEdit(record)} className="text-blue-500 hover:text-blue-700">
                                    <Edit size={18} />
                                </button>
                                <button onClick={() => handleDelete(record.id)} className="text-red-500 hover:text-red-700">
                                    <Trash2 size={18} />
                                </button>
                            </td>
                        </tr>
                    ))
                    ) : (
                        <tr>
                            <td colSpan="9" className="p-4 text-center text-gray-500">
                                Không có dữ liệu chấm công cho tháng này.
                            </td>
                        </tr>
                    )}
                </tbody>
                </table>
            </div>
        )}
      </div>

      {/* Modals */}
      <AttendanceModal 
        isOpen={showImportModal} 
        onClose={() => setShowImportModal(false)} 
        type="import" 
      />
      <AttendanceModal 
        isOpen={showExportModal} 
        onClose={() => setShowExportModal(false)} 
        type="export" 
      />
      <EmployeeDetailModal 
        isOpen={showDetailModal} 
        onClose={() => setShowDetailModal(false)} 
      />
    </div>
  );
}