import { useState, useEffect } from "react";
import axiosInstance from "../api/axios"; // axios đã có interceptor gắn token
import { 
  UserPlus, X, Search, Edit2, Trash2, Eye, User, Shield, Briefcase, FileText, Award,
  Calendar, Clock, AlertCircle, TrendingUp, DollarSign
} from "lucide-react";
import { departmentApi } from "../api/departmentApi";
import { employeeApi } from "../api/employeeApi";
import { getAttendanceOfMonth } from "../api/attendanceApi";

export default function Employee() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employeeStats, setEmployeeStats] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // add, edit, view
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", dob: "", address: "", position: "", departmentId: "",
    startDate: "", managerName: "", contractType: "", contractEndDate: "",
    experienceYears: 0, grade: "", performanceRate: 0, employeeCode: "",
    salary: "", username: "", password: "", role: "EMPLOYEE", skills: [], certificates: []
  });

  useEffect(() => { 
    loadEmployees(); 
    loadDepartments();
  }, []);

  useEffect(() => {
    if (employees.length > 0) {
      loadEmployeeStats();
    }
  }, [employees, currentMonth, currentYear]);

  // Load thống kê cho tất cả nhân viên
  const loadEmployeeStats = async () => {
    setLoadingStats(true);
    const stats = {};
    
    for (const employee of employees) {
      try {
        const res = await getAttendanceOfMonth(employee.id, currentMonth, currentYear);
        const attendanceData = res.data || [];
        
        let workedDays = 0;
        let lateDays = 0;
        let leaveDays = 0;
        
        attendanceData.forEach(record => {
          if (record.status === 'PRESENT' || record.status === 'LATE') {
            workedDays++;
          }
          if (record.status === 'LATE') {
            lateDays++;
          }
          if (record.status === 'LEAVE' || record.status === 'ABSENT') {
            leaveDays++;
          }
        });
        
        stats[employee.id] = {
          workedDays,
          lateDays,
          leaveDays,
          salary: employee.salary || 0
        };
      } catch (error) {
        // Nếu không có data chấm công, set default values
        stats[employee.id] = {
          workedDays: 0,
          lateDays: 0,
          leaveDays: 0,
          salary: employee.salary || 0
        };
      }
    }
    
    setEmployeeStats(stats);
    setLoadingStats(false);
  };

  const getDepartmentName = (departmentId) => {
    const dept = departments.find(d => d.id === departmentId);
    return dept ? dept.name : 'Chưa có';
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // --- Load employees ---
  const loadEmployees = async () => {
    try {
      const res = await employeeApi.getAll();
      setEmployees(res.data);
    } catch (err) {
      handleUnauthorized(err);
    }
  };

  // --- Load departments ---
  const loadDepartments = async () => {
    try {
      const res = await departmentApi.getAll();
      setDepartments(res.data);
    } catch (err) {
      console.error("Error loading departments:", err);
    }
  };

  // --- Add/Edit modal ---
  const openAddModal = () => {
    setModalMode("add");
    setForm({
      fullName: "", email: "", phone: "", dob: "", address: "", position: "", departmentId: "",
      startDate: "", managerName: "", contractType: "", contractEndDate: "",
      experienceYears: 0, grade: "", performanceRate: 0, employeeCode: "",
      salary: "", username: "", password: "", role: "EMPLOYEE", skills: [], certificates: []
    });
    setShowModal(true);
  };

const openEditModal = (employee, mode = "edit") => {
  setModalMode(mode);
  setForm({
    ...employee,
    departmentId: employee.departmentId || "",
    dob: employee.dob ? employee.dob.split("T")[0] : "",
    startDate: employee.startDate ? employee.startDate.split("T")[0] : "",
    contractEndDate: employee.contractEndDate ? employee.contractEndDate.split("T")[0] : "",
    password: "",
    role: employee.role || "EMPLOYEE" // fallback nếu role null
  });
  setShowModal(true);
};


  // --- Submit employee ---
const prepareEmployeeData = (form, modalMode) => {
  const data = {
    fullName: form.fullName,
    email: form.email,
    phone: form.phone,
    dob: form.dob || null,
    address: form.address,
    position: form.position,
    departmentId: form.departmentId ? Number(form.departmentId) : null,
    startDate: form.startDate || null,
    managerName: form.managerName,
    contractType: form.contractType,
    contractEndDate: form.contractEndDate || null,
    experienceYears: Number(form.experienceYears || 0),
    grade: form.grade,
    performanceRate: Number(form.performanceRate || 0),
    employeeCode: form.employeeCode,
    salary: Number(form.salary || 0),
    username: form.username,
    role: form.role || "EMPLOYEE", // fallback nếu role null
    skills: form.skills.map(s => ({ name: s.name, level: s.level })),
    certificates: form.certificates || []
  };

  // Nếu là edit và password để trống, bỏ trường password
  if (modalMode === "edit" && !form.password) delete data.password;
  else data.password = form.password;

  return data;
};

// Sử dụng trước khi POST
const submitEmployee = async () => {
  try {
    const data = prepareEmployeeData(form, modalMode);
    if (modalMode === "add") await employeeApi.create(data);
    else await employeeApi.update(form.id, data);

    alert(modalMode === "add" ? "Thêm nhân viên thành công!" : "Cập nhật thành công!");
    setShowModal(false);
    loadEmployees();
  } catch (err) {
    alert(err.response?.data?.message || "Có lỗi xảy ra!");
  }
};



  // --- Delete employee ---
  const deleteEmployee = async (id) => {
    try {
      await employeeApi.delete(id);
      alert("Xóa thành công!");
      loadEmployees();
    } catch (err) {
      handleUnauthorized(err);
    }
  };

  const handleUnauthorized = (err) => {
    if (err.response?.status === 401) {
      alert("Bạn chưa đăng nhập hoặc token hết hạn. Vui lòng đăng nhập lại.");
      window.location.href = "/admin/login";
    } else {
      alert("Không thể tải dữ liệu nhân viên!");
    }
  };

  // --- Filter & display ---
  const filteredEmployees = employees.filter(e =>
    e.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.position?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = role => ({
    ADMIN: "bg-purple-100 text-purple-700",
    HR: "bg-blue-100 text-blue-700",
    EMPLOYEE: "bg-gray-100 text-gray-700"
  }[role] || "bg-gray-100 text-gray-700");

  const fmtDate = d => d ? new Date(d).toLocaleDateString('vi-VN') : "—";

  const exportEmployeesCsv = () => {
    if (!employees || employees.length === 0) {
      alert("Không có dữ liệu nhân viên để xuất.");
      return;
    }
    const headers = [
      "id","fullName","email","phone","dob","address","position","department","startDate","managerName",
      "contractType","contractEndDate","experienceYears","grade","performanceRate","employeeCode","salary","username","role"
    ];

    const rows = filteredEmployees.map(e => [
      e.id,
      e.fullName || "",
      e.email || "",
      e.phone || "",
      e.dob || "",
      e.address || "",
      e.position || "",
      getDepartmentName(e.departmentId) || "",
      e.startDate || "",
      e.managerName || "",
      e.contractType || "",
      e.contractEndDate || "",
      e.experienceYears ?? "",
      e.grade || "",
      e.performanceRate ?? "",
      e.employeeCode || "",
      e.salary ?? "",
      e.username || "",
      e.role || ""
    ]);

    const csv = [headers.join(","), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employees.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const importEmployeesCsv = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') return;
        const lines = text.split(/\r?\n/).filter(l => l.trim());
        if (lines.length < 2) {
          alert("File không có dữ liệu.");
          return;
        }
        const header = lines[0].split(",").map(h => h.replace(/"/g, '').trim());
        const idx = (name) => header.indexOf(name);

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].match(/("[^"]*"|[^,]+)/g);
          if (!cols) continue;
          const val = (name) => {
            const j = idx(name);
            if (j === -1 || j >= cols.length) return "";
            return cols[j].replace(/^"|"$/g, '').replace(/""/g, '"').trim();
          };

          const payload = {
            fullName: val("fullName"),
            email: val("email"),
            phone: val("phone"),
            dob: val("dob") || null,
            address: val("address"),
            position: val("position"),
            departmentId: val("departmentId") ? Number(val("departmentId")) : null,
            startDate: val("startDate") || null,
            managerName: val("managerName"),
            contractType: val("contractType"),
            contractEndDate: val("contractEndDate") || null,
            experienceYears: Number(val("experienceYears") || 0),
            grade: val("grade"),
            performanceRate: Number(val("performanceRate") || 0),
            employeeCode: val("employeeCode"),
            salary: Number(val("salary") || 0),
            username: val("username"),
            role: val("role") || "EMPLOYEE",
            password: "123456", // mật khẩu mặc định
            skills: [],
            certificates: [],
          };

          // Luôn tạo nhân viên mới để tránh ghi đè/mất nhân viên cũ
          try {
            await employeeApi.create(payload);
          } catch (rowErr) {
            console.error("Lỗi import nhân viên ở dòng", i + 1, rowErr);
            // Tiếp tục các dòng khác
            continue;
          }
        }

        alert("Import nhân viên thành công (các dòng lỗi đã được bỏ qua).");
        loadEmployees();
      } catch (err) {
        console.error("Lỗi import CSV nhân viên:", err);
        alert("Không thể import dữ liệu nhân viên.");
      } finally {
        event.target.value = "";
      }
    };

    reader.readAsText(file, 'utf-8');
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="mb-2">Quản lý Nhân viên</h1>
          <p className="text-gray-600">Danh sách tất cả nhân viên trong hệ thống</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            className="flex items-center gap-2 border px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
            onClick={exportEmployeesCsv}
          >
            Export CSV
          </button>
          <label className="flex items-center gap-2 border px-4 py-2 rounded-lg text-sm hover:bg-gray-50 cursor-pointer">
            Import CSV
            <input type="file" accept=".csv" className="hidden" onChange={importEmployeesCsv} />
          </label>
          <button
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition"
            onClick={openAddModal}
          >
            <UserPlus size={20} /> Thêm nhân viên
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat title="Tổng nhân viên" value={employees.length} />
        <Stat title="Quản trị viên" value={employees.filter(e => e.role === 'ADMIN').length} />
        <Stat title="Nhân sự" value={employees.filter(e => e.role === 'HR').length} />
        <Stat title="Nhân viên" value={employees.filter(e => e.role === 'EMPLOYEE').length} />
      </div>

      {/* Search and Month/Year Filter */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, chức vụ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 items-center">
            <label className="text-sm text-gray-600">Tháng:</label>
            <select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(Number(e.target.value))}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({length: 12}, (_, i) => (
                <option key={i+1} value={i+1}>Tháng {i+1}</option>
              ))}
            </select>
            <label className="text-sm text-gray-600">Năm:</label>
            <select
              value={currentYear}
              onChange={(e) => setCurrentYear(Number(e.target.value))}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({length: 5}, (_, i) => (
                <option key={i} value={new Date().getFullYear() - i}>{new Date().getFullYear() - i}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl my-8 flex flex-col max-h-[90vh]">

            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-xl flex-shrink-0">
              <h2 className="text-white text-lg">
                {modalMode === "add" ? "Thêm nhân viên mới" : modalMode === "edit" ? "Chỉnh sửa nhân viên" : "Chi tiết nhân viên"}
              </h2>
              <button className="p-2 hover:bg-white/20 rounded-lg text-white" onClick={() => setShowModal(false)}>
                <X size={22} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-6 overflow-y-auto flex-1">
              <div className="space-y-6">

                <Section title="Thông tin cá nhân" icon={<User size={18} className="text-blue-600" />}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Họ và tên" name="fullName" form={form} handleChange={handleChange} modalMode={modalMode} required />
                    <FormField label="Email" name="email" type="email" form={form} handleChange={handleChange} modalMode={modalMode} required />
                    <FormField label="Số điện thoại" name="phone" form={form} handleChange={handleChange} modalMode={modalMode} />
                    <FormField label="Ngày sinh" name="dob" type="date" form={form} handleChange={handleChange} modalMode={modalMode} />
                    <FormField label="Địa chỉ" name="address" form={form} handleChange={handleChange} modalMode={modalMode} />
                  </div>
                </Section>

                <Section title="Thông tin công việc" icon={<Briefcase size={18} className="text-blue-600" />}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Mã nhân viên" name="employeeCode" form={form} handleChange={handleChange} modalMode={modalMode} required />
                    <FormField label="Chức vụ" name="position" form={form} handleChange={handleChange} modalMode={modalMode} required />
                    <div>
                      <label className="block text-gray-700 text-sm mb-2">Phòng ban</label>
                      <select 
                        name="departmentId" 
                        value={form.departmentId || ""} 
                        onChange={handleChange} 
                        disabled={modalMode === "view"} 
                        className={`w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${modalMode === "view" ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
                      >
                        <option value="">Chọn phòng ban</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                      </select>
                    </div>
                    <FormField label="Người quản lý" name="managerName" form={form} handleChange={handleChange} modalMode={modalMode} />
                  </div>
                </Section>

                <Section title="Thông tin hợp đồng" icon={<FileText size={18} className="text-blue-600" />}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Loại hợp đồng" name="contractType" form={form} handleChange={handleChange} modalMode={modalMode} />
                    <FormField label="Ngày bắt đầu" name="startDate" type="date" form={form} handleChange={handleChange} modalMode={modalMode} />
                    <FormField label="Ngày kết thúc HĐ" name="contractEndDate" type="date" form={form} handleChange={handleChange} modalMode={modalMode} />
                    <FormField label="Lương (VNĐ)" name="salary" type="number" form={form} handleChange={handleChange} modalMode={modalMode} />
                  </div>
                </Section>

                <Section title="Đánh giá & Kinh nghiệm" icon={<Award size={18} className="text-blue-600" />}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField label="Năm kinh nghiệm" name="experienceYears" type="number" form={form} handleChange={handleChange} modalMode={modalMode} />
                    <FormField label="Xếp loại" name="grade" form={form} handleChange={handleChange} modalMode={modalMode} />
                    <FormField label="Hiệu suất (%)" name="performanceRate" type="number" form={form} handleChange={handleChange} modalMode={modalMode} />
                  </div>
                </Section>

                <Section title="Tài khoản hệ thống" icon={<Shield size={18} className="text-blue-600" />}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Tên đăng nhập" name="username" form={form} handleChange={handleChange} modalMode={modalMode} required />
                    {modalMode !== "view" && (
                      <FormField 
                        label={modalMode === "edit" ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu"} 
                        name="password" type="password" form={form} handleChange={handleChange} modalMode={modalMode} required={modalMode === "add"} 
                      />
                    )}
                    <div>
                      <label className="block text-gray-700 text-sm mb-2">Vai trò</label>
                      <select name="role" value={form.role} onChange={handleChange} disabled={modalMode === "view"} className={`w-full border px-3 py-2 rounded-lg ${modalMode === "view" ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}>
                        <option value="EMPLOYEE">Nhân viên</option>
                        <option value="HR">Nhân sự</option>
                        <option value="ADMIN">Quản trị viên</option>
                      </select>
                    </div>
                  </div>
                </Section>

              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 flex-shrink-0">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 transition">
                {modalMode === "view" ? "Đóng" : "Hủy"}
              </button>
              {modalMode !== "view" && (
                <button onClick={submitEmployee} className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">Lưu</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="text-gray-900">Xác nhận xóa</h3>
                <p className="text-gray-600 text-sm">Bạn có chắc muốn xóa nhân viên này?</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">Hủy</button>
              <button onClick={() => { deleteEmployee(deleteId); setDeleteId(null); }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <Th>Mã NV</Th>
              <Th>Họ tên</Th>
              <Th>Email</Th>
              <Th>Vị trí</Th>
              <Th>Đi làm (tháng)</Th>
              <Th>Đi muộn</Th>
              <Th>Nghỉ phép</Th>
              <Th>Lương</Th>
              <Th>Hành động</Th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr><td colSpan="9" className="py-8 text-center text-gray-400">
                {loadingStats ? "Đang tải thống kê..." : "Không có nhân viên"}
              </td></tr>
            ) : filteredEmployees.map(e => {
              const stats = employeeStats[e.id] || { workedDays: 0, lateDays: 0, leaveDays: 0, salary: 0 };
              
              return (
                <tr key={e.id} className="border-b hover:bg-gray-50">
                  <Td>
                    <div className="font-medium">{e.employeeCode || `#${e.id}`}</div>
                    <div className="text-xs text-gray-500">{e.username}</div>
                  </Td>
                  <Td>
                    <div className="font-medium">{e.fullName}</div>
                    <div className="text-xs text-gray-500">{e.phone}</div>
                  </Td>
                  <Td>{e.email}</Td>
                  <Td>{e.position}</Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <Calendar className="text-green-600" size={16} />
                      <span className="font-medium text-green-700">{stats.workedDays} ngày</span>
                    </div>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <Clock className="text-orange-600" size={16} />
                      <span className="font-medium text-orange-700">{stats.lateDays} lần</span>
                    </div>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <AlertCircle className="text-blue-600" size={16} />
                      <span className="font-medium text-blue-700">{stats.leaveDays} ngày</span>
                    </div>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <DollarSign className="text-green-600" size={16} />
                      <span className="font-medium">{stats.salary?.toLocaleString('vi-VN')}đ</span>
                    </div>
                  </Td>
                  <Td className="flex gap-2">
                    <button 
                      onClick={() => openEditModal(e, "view")} 
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded" 
                      title="Xem chi tiết"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      onClick={() => openEditModal(e, "edit")} 
                      className="p-1 text-gray-600 hover:bg-gray-50 rounded" 
                      title="Chỉnh sửa"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => setDeleteId(e.id)} 
                      className="p-1 text-red-600 hover:bg-red-50 rounded" 
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ===== Components =====
const Stat = ({ title, value }) => <div className="bg-white rounded-lg shadow p-4"><p className="text-xs text-gray-600">{title}</p><p className="text-lg">{value}</p></div>;
const Th = ({ children }) => <th className="p-3 text-xs text-gray-600 text-left">{children}</th>;
const Td = ({ children }) => <td className="p-3 text-gray-700">{children}</td>;

const Section = ({ title, icon, children }) => (
  <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-300">
      {icon}
      <h3 className="text-gray-800">{title}</h3>
    </div>
    {children}
  </div>
);

const FormField = ({ label, name, type = "text", form, handleChange, modalMode, required = false }) => {
  return (
    <div>
      <label className="block text-gray-700 text-sm mb-2">{label}{required && modalMode !== "view" && <span className="text-red-500">*</span>}</label>
      <input
        type={type}
        name={name}
        value={form[name] || ""}
        onChange={handleChange}
        readOnly={modalMode === "view"}
        className={`w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition
          ${modalMode === "view" ? "bg-gray-100 cursor-not-allowed text-gray-600" : "bg-white"}`}
      />
    </div>
  );
};
