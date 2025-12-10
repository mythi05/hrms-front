// src/pages/EmployeeAttendanceAdmin.jsx (Bản dành cho Admin)
import React, { useState, useEffect } from "react";
import { Clock, TrendingUp, CheckCircle, XCircle, Trash2, Edit, Upload, Download, User, Plus } from "lucide-react";
import { adminGetAllAttendance, adminDeleteAttendance, formatAttendanceRecords } from "../../api/attendanceApi";
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
  const [stats, setStats] = useState({
    totalToday: 0,
    onTimeToday: 0,
    lateToday: 0,
    absentToday: 0,
    workedMonth: 0,
    lateMonth: 0,
    offMonth: 0,
  });

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

  useEffect(() => {
    fetchAllAttendance();
  }, []);

  // Các hàm xử lý admin (cần được implement đầy đủ)
  const handleDelete = async (id) => {
    if (!window.confirm(`Bạn có chắc muốn xóa bản ghi chấm công ID: ${id}?`)) return;
    try {
      await adminDeleteAttendance(id);
      await fetchAllAttendance();
    } catch (err) {
      console.error("Lỗi xóa bản ghi chấm công:", err);
      alert("Không thể xóa bản ghi chấm công.");
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
          <h3 className="text-xl font-semibold text-gray-800">Tất cả Bản ghi Chấm công</h3>
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
                    {allAttendance.length > 0 ? (
                    allAttendance.map((record) => (
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
                                Không có dữ liệu chấm công nào.
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