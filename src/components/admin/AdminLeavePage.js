import React, { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Clock, Filter, User, FileText } from "lucide-react";
import { adminGetAllLeaveRequests, adminApproveLeave, adminRejectLeave } from "../../api/leaveApi";
import axiosInstance from "../../api/axios";

const STATUS_LABELS = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
};

const STATUS_COLOR = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

const TYPE_LABELS = {
  ANNUAL: "Phép năm",
  SICK: "Phép ốm",
  MARRIAGE: "Phép cưới",
  MATERNITY: "Nghỉ thai sản",
  UNPAID: "Nghỉ không lương",
  OTHER: "Khác",
};

// Quota ngày nghỉ mặc định (cần trùng với backend LeaveRequestServiceImpl)
const TYPE_QUOTA = {
  ANNUAL: 12,
  SICK: 10,
  MARRIAGE: 3,
  MATERNITY: 5,
  UNPAID: 5,
  OTHER: 5,
};

export default function AdminLeavePage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [usage, setUsage] = useState({}); // key: `${employeeId}_${leaveType}_${year}` -> used days

  // Check user role
  const currentUser = (() => {
    try {
      const raw = localStorage.getItem('user');
      const user = raw ? JSON.parse(raw) : null;
      console.log('Current user on mount:', user); // Debug log
      console.log('User role:', user?.role); // Debug log
      console.log('User roles array:', user?.roles); // Debug log
      return user;
    } catch {
      return null;
    }
  })();

  // Check if user has permission - check both role and roles array
  const hasPermission = currentUser && (
    currentUser.role === 'ADMIN' || 
    currentUser.role === 'HR' ||
    (currentUser.roles && (currentUser.roles.includes('ADMIN') || currentUser.roles.includes('HR')))
  );
  
  console.log('Has permission:', hasPermission); // Debug log
  
  useEffect(() => {
    if (!hasPermission) {
      setError("Bạn không có quyền truy cập trang này. Yêu cầu vai trò ADMIN hoặc HR.");
      return;
    }
    loadData();
  }, [hasPermission]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminGetAllLeaveRequests();
      const data = res.data || [];
      setRequests(data);

      // Tính tổng ngày đã APPROVED theo nhân viên + loại + năm hiện tại
      const now = new Date();
      const year = now.getFullYear();
      const map = {};

      data.forEach(r => {
        if (r.status !== 'APPROVED' || !r.leaveType || !r.daysCount || !r.employeeId) return;
        const sYear = r.startDate ? new Date(r.startDate).getFullYear() : year;
        const eYear = r.endDate ? new Date(r.endDate).getFullYear() : year;
        if (sYear !== year && eYear !== year) return;

        const key = `${r.employeeId}_${r.leaveType}_${year}`;
        const num = typeof r.daysCount === 'number' ? r.daysCount : parseFloat(r.daysCount || '0');
        if (!isNaN(num)) {
          map[key] = (map[key] || 0) + num;
        }
      });

      setUsage(map);
    } catch (err) {
      console.error("Lỗi tải danh sách đơn nghỉ phép:", err);
      setError("Không thể tải danh sách đơn nghỉ phép.");
    } finally {
      setLoading(false);
    }
  };

  // Remove old useEffect

  // Test function to check admin access
  const testAdminAccess = async () => {
    try {
      // Test current user info
      const userResponse = await axiosInstance.get('/leave-requests/admin/me');
      console.log('Current user info:', userResponse.data);
      
      // Test admin access
      const response = await axiosInstance.get('/leave-requests/admin/test');
      console.log('Admin access test:', response.data);
    } catch (err) {
      console.error('Admin access test failed:', err.response);
      console.error('User info test failed:', err.response);
    }
  };

  useEffect(() => {
    if (hasPermission) {
      testAdminAccess(); // Test admin access
      loadData();
    }
  }, [hasPermission]);

  const handleApprove = async (id) => {
    if (!window.confirm("Duyệt đơn nghỉ phép này?")) return;

    // Kiểm tra quota ngay trên UI trước khi gọi API
    const req = requests.find(r => r.id === id);
    if (req) {
      const year = new Date().getFullYear();
      const quota = TYPE_QUOTA[req.leaveType] || 0;
      const usedKey = `${req.employeeId}_${req.leaveType}_${year}`;
      const usedDays = usage[usedKey] || 0;
      const curDays = typeof req.daysCount === 'number' ? req.daysCount : parseFloat(req.daysCount || '0');

      if (quota > 0 && !isNaN(curDays) && usedDays + curDays > quota) {
        alert(`Không thể duyệt: nhân viên này đã dùng ${usedDays}/${quota} ngày cho loại ${TYPE_LABELS[req.leaveType] || req.leaveType}.`);
        return;
      }
    }

    const currentUser = (() => {
      try {
        const raw = localStorage.getItem('user');
        const user = raw ? JSON.parse(raw) : null;
        console.log('Current user:', user); // Debug log
        return user;
      } catch {
        return null;
      }
    })();
    const approverId = currentUser?.id;

    console.log('Approving leave request:', { id, approverId, currentUser }); // Debug log
    
    // Check token
    const token = localStorage.getItem('token');
    console.log('Token exists:', !!token); // Debug log
    console.log('Token:', token ? token.substring(0, 50) + '...' : 'null'); // Debug log

    try {
      const result = await adminApproveLeave(id, approverId);
      console.log('Approve result:', result); // Debug log
      await loadData();
    } catch (err) {
      console.error("Lỗi duyệt đơn nghỉ phép:", err);
      console.error('Error response:', err.response); // Debug log
      console.error('Error status:', err.response?.status); // Debug log
      console.error('Error data:', err.response?.data); // Debug log
      const msg = err.response?.data?.message || err.response?.data || "Không thể duyệt đơn nghỉ phép.";
      alert(msg);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Nhập lý do từ chối (tuỳ chọn):", "");
    if (!window.confirm("Bạn chắc chắn muốn từ chối đơn này?")) return;
    const currentUser = (() => {
      try {
        const raw = localStorage.getItem('user');
        const user = raw ? JSON.parse(raw) : null;
        console.log('Current user (reject):', user); // Debug log
        return user;
      } catch {
        return null;
      }
    })();
    const approverId = currentUser?.id;

    console.log('Rejecting leave request:', { id, approverId, reason }); // Debug log

    try {
      await adminRejectLeave(id, approverId, reason || undefined);
      await loadData();
    } catch (err) {
      console.error("Lỗi từ chối đơn nghỉ phép:", err);
      console.error('Error response (reject):', err.response); // Debug log
      alert("Không thể từ chối đơn nghỉ phép.");
    }
  };

  const filtered = requests.filter((r) => {
    if (statusFilter === "ALL") return true;
    return r.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-bold">Quản trị nghỉ phép</h1>
          <p className="text-gray-600 text-sm">Xem và phê duyệt các đơn nghỉ phép của nhân viên</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-gray-700 text-sm">
          <Filter size={16} />
          <span>Lọc theo trạng thái:</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1 rounded-full text-xs border ${
              statusFilter === "ALL" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setStatusFilter("PENDING")}
            className={`px-3 py-1 rounded-full text-xs border ${
              statusFilter === "PENDING" ? "bg-yellow-500 text-white border-yellow-500" : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            Chờ duyệt
          </button>
          <button
            onClick={() => setStatusFilter("APPROVED")}
            className={`px-3 py-1 rounded-full text-xs border ${
              statusFilter === "APPROVED" ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            Đã duyệt
          </button>
          <button
            onClick={() => setStatusFilter("REJECTED")}
            className={`px-3 py-1 rounded-full text-xs border ${
              statusFilter === "REJECTED" ? "bg-red-600 text-white border-red-600" : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            Từ chối
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Danh sách đơn nghỉ phép</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 text-xs text-gray-600">Nhân viên</th>
                <th className="text-left p-3 text-xs text-gray-600">Loại</th>
              <th className="text-left p-3 text-xs text-gray-600">Quota năm</th>
                <th className="text-left p-3 text-xs text-gray-600">Từ ngày</th>
                <th className="text-left p-3 text-xs text-gray-600">Đến ngày</th>
                <th className="text-left p-3 text-xs text-gray-600">Số ngày</th>
                <th className="text-left p-3 text-xs text-gray-600">Lý do</th>
                <th className="text-left p-3 text-xs text-gray-600">Trạng thái</th>
                <th className="text-left p-3 text-xs text-gray-600">Người duyệt</th>
              <th className="text-left p-3 text-xs text-gray-600">Ghi chú từ chối</th>
                <th className="text-left p-3 text-xs text-gray-600">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-4 text-center text-gray-500 text-sm">Đang tải dữ liệu...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={9} className="p-4 text-center text-red-500 text-sm">{error}</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-4 text-center text-gray-500 text-sm">Không có đơn nghỉ phép nào phù hợp.</td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const typeLabel = TYPE_LABELS[r.leaveType] || r.leaveType;
                  const statusLabel = STATUS_LABELS[r.status] || r.status;
                  const statusColor = STATUS_COLOR[r.status] || STATUS_COLOR.PENDING;

                  const year = new Date().getFullYear();
                  const quota = TYPE_QUOTA[r.leaveType] || 0;
                  const usedKey = `${r.employeeId}_${r.leaveType}_${year}`;
                  const usedDays = usage[usedKey] || 0;

                  return (
                    <tr key={r.id} className="border-b hover:bg-gray-50 text-sm">
                      <td className="p-3 text-gray-700 flex items-center gap-2">
                        <User size={16} className="text-gray-400" />
                        <span>{r.employeeName || `#${r.employeeId}`}</span>
                      </td>
                      <td className="p-3 text-gray-700">{typeLabel}</td>
                      <td className="p-3 text-gray-700 text-xs">
                        {quota > 0 ? (
                          <span>
                            Đã dùng <span className="font-semibold">{usedDays}</span> / {quota} ngày
                          </span>
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                      <td className="p-3 text-gray-700">{r.startDate}</td>
                      <td className="p-3 text-gray-700">{r.endDate}</td>
                      <td className="p-3 text-gray-700">{r.daysCount} ngày</td>
                      <td className="p-3 text-gray-700 max-w-xs break-words flex items-start gap-2">
                        <FileText size={14} className="mt-0.5 text-gray-400" />
                        <span>{r.reason}</span>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                          {r.status === 'PENDING' && <Clock size={14} />}
                          {r.status === 'APPROVED' && <CheckCircle2 size={14} />}
                          {r.status === 'REJECTED' && <XCircle size={14} />}
                          <span>{statusLabel}</span>
                        </span>
                      </td>
                      <td className="p-3 text-gray-700">{r.approverName || '-'}</td>
                      <td className="p-3 text-gray-700 text-xs max-w-xs break-words">{r.rejectReason || '-'}</td>
                      <td className="p-3 flex gap-2">
                        {r.status === 'PENDING' && (
                          <>
                            <button
                              className="px-3 py-1 rounded bg-green-600 text-white text-xs hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                              onClick={() => handleApprove(r.id)}
                              disabled={!hasPermission}
                            >
                              Duyệt
                            </button>
                            <button
                              className="px-3 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                              onClick={() => handleReject(r.id)}
                              disabled={!hasPermission}
                            >
                              Từ chối
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
