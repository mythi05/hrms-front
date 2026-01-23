import { useState, useEffect } from "react";
import axiosInstance from "../api/axios"; 
import { 
  UserPlus, X, Search, Edit2, Trash2, Eye, User, Shield, Briefcase, FileText, Award,
  Calendar, Clock, AlertCircle, TrendingUp, DollarSign, Upload, Image as ImageIcon
} from "lucide-react";
import { departmentApi } from "../api/departmentApi";
import { employeeApi } from "../api/employeeApi";
import { getAttendanceOfMonth } from "../api/attendanceApi";

export default function Employee() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employeeStats, setEmployeeStats] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); 
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [importing, setImporting] = useState(false);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState(() => new Set());

  const defaultForm = {
    fullName: "", email: "", phone: "", dob: "", address: "", position: "", departmentId: "",
    startDate: "", managerName: "", contractType: "", contractEndDate: "",
    experienceYears: 0, grade: "", performanceRate: 0, employeeCode: "",
    salary: "", username: "", password: "", role: "EMPLOYEE", 
    skills: [], certificates: [], avatar: "",
    emailNotifications: true, pushNotifications: true, leaveNotifications: true, payrollNotifications: true
  };

  const [form, setForm] = useState(defaultForm);

  useEffect(() => { loadEmployees(); loadDepartments(); }, []);
  useEffect(() => { if (employees.length > 0) loadEmployeeStats(); }, [employees, currentMonth, currentYear]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedAvatarFile(file);

    // preview local ngay cho UI gọn đẹp
    const localUrl = URL.createObjectURL(file);
    setForm(prev => ({ ...prev, avatar: localUrl }));

    // Nếu đang edit thì upload luôn lên backend để lưu URL/publicId đúng chuẩn nghiệp vụ
    if (modalMode !== "add" && form?.id) {
      setIsUploading(true);
      try {
        const res = await employeeApi.updateAvatar(form.id, file);
        setForm(prev => ({ ...prev, ...res.data }));
        setSelectedAvatarFile(null);
      } catch (err) {
        alert(err.response?.data?.message || "Lỗi upload ảnh!");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const loadEmployeeStats = async () => {
    const stats = {};
    for (const e of employees) {
      try {
        const res = await getAttendanceOfMonth(e.id, currentMonth, currentYear);
        const data = res.data || [];
        let worked = 0, late = 0, leave = 0;
        data.forEach(r => {
          if (r.status === 'PRESENT' || r.status === 'LATE') worked++;
          if (r.status === 'LATE') late++;
          if (r.status === 'LEAVE' || r.status === 'ABSENT') leave++;
        });
        stats[e.id] = { worked, late, leave, salary: e.salary || 0 };
      } catch (err) { stats[e.id] = { worked: 0, late: 0, leave: 0, salary: e.salary || 0 }; }
    }
    setEmployeeStats(stats);
  };

  const loadEmployees = async () => { try { const res = await employeeApi.getAll(); setEmployees(res.data); } catch (err) {} };
  const loadDepartments = async () => { try { const res = await departmentApi.getAll(); setDepartments(res.data); } catch (err) {} };

  const parseFilenameFromDisposition = (value) => {
    if (!value) return null;
    // e.g. attachment; filename=nhan_vien_2026-01-23.xlsx
    const match = /filename\*?=(?:UTF-8''|")?([^;"]+)/i.exec(value);
    if (!match) return null;
    try {
      return decodeURIComponent(match[1].trim().replace(/^"|"$/g, ""));
    } catch (_) {
      return match[1].trim().replace(/^"|"$/g, "");
    }
  };

  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const ensureBlobOkOrThrow = async (res) => {
    const contentType = res?.headers?.['content-type'] || res?.headers?.get?.('content-type') || '';
    // If backend returns JSON error, content-type may be application/json
    if (String(contentType).toLowerCase().includes('application/json')) {
      const text = await (res.data?.text ? res.data.text() : new Response(res.data).text());
      throw new Error(text || 'Request failed');
    }
  };

  const handleExportEmployees = async () => {
    try {
      const res = await employeeApi.exportEmployees();
      await ensureBlobOkOrThrow(res);
      const filename =
        parseFilenameFromDisposition(res?.headers?.['content-disposition'])
        || `nhan_vien_${new Date().toISOString().slice(0, 10)}.xlsx`;
      downloadBlob(res.data, filename);
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Không thể xuất danh sách nhân viên');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await employeeApi.downloadEmployeeTemplate();
      await ensureBlobOkOrThrow(res);
      const filename = parseFilenameFromDisposition(res?.headers?.['content-disposition']) || 'template_nhan_vien.xlsx';
      downloadBlob(res.data, filename);
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Không thể tải file mẫu');
    }
  };

  const handleImportEmployees = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      await employeeApi.importEmployees(file);
      alert('Nhập danh sách nhân viên thành công!');
      loadEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể nhập danh sách nhân viên');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const submitEmployee = async () => {
    if (isUploading) return alert("Vui lòng đợi ảnh tải lên xong!");
    try {
      const data = {
        ...form,
        departmentId: form.departmentId ? Number(form.departmentId) : null,
        experienceYears: form.experienceYears ? Number(form.experienceYears) : 0,
        performanceRate: form.performanceRate ? Number(form.performanceRate) : 0,
        salary: form.salary ? Number(form.salary) : 0,
      };

      // Khi add: tạo trước, rồi nếu có chọn file avatar thì upload theo id mới
      if (modalMode === "add") {
        const createdRes = await employeeApi.create(data);
        const created = createdRes.data;
        if (selectedAvatarFile && created?.id) {
          setIsUploading(true);
          try {
            await employeeApi.updateAvatar(created.id, selectedAvatarFile);
          } finally {
            setIsUploading(false);
          }
        }
      } else {
        await employeeApi.update(form.id, data);
      }

      alert("Thành công!");

      setShowModal(false);
      setForm(defaultForm);
      setSelectedAvatarFile(null);
      loadEmployees();
    } catch (err) { alert(err.response?.data?.message || "Không thể lưu. Vui lòng kiểm tra trùng Mã nhân viên / Tên đăng nhập."); }
  };

  const filteredEmployees = employees.filter(e => e.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || e.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase()));

  const totalEmployees = employees.length;
  const adminCount = employees.filter(e => e.role === 'ADMIN').length;
  const hrCount = employees.filter(e => e.role === 'HR').length;
  const empCount = employees.filter(e => e.role === 'EMPLOYEE').length;

  const toggleSelectedEmployee = (id) => {
    setSelectedEmployeeIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllEmployees = () => {
    setSelectedEmployeeIds(prev => {
      const allIds = filteredEmployees.map(e => e.id);
      const allSelected = allIds.length > 0 && allIds.every(id => prev.has(id));
      if (allSelected) return new Set();
      return new Set(allIds);
    });
  };

  const handleBulkDeleteEmployees = async () => {
    const ids = Array.from(selectedEmployeeIds);
    if (ids.length === 0) {
      alert('Bạn chưa chọn nhân viên nào để xoá');
      return;
    }
    if (!window.confirm(`Bạn có chắc muốn xoá ${ids.length} nhân viên đã chọn?`)) return;
    try {
      await employeeApi.bulkDeleteEmployees(ids);
      setSelectedEmployeeIds(new Set());
      loadEmployees();
      alert('Đã xoá nhân viên đã chọn');
    } catch (err) {
      alert(err?.response?.data?.error || err?.response?.data?.message || 'Không thể xoá nhân viên đã chọn');
    }
  };

  const allFilteredSelected = filteredEmployees.length > 0 && filteredEmployees.every(e => selectedEmployeeIds.has(e.id));

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-gray-800">QUẢN LÝ NHÂN VIÊN</h1>

        <div className="flex items-center gap-2">
          <button onClick={handleBulkDeleteEmployees} className="px-4 py-2 rounded-xl font-bold border bg-white hover:bg-gray-50 text-red-600">
            Xoá đã chọn
          </button>

          <button onClick={handleDownloadTemplate} className="px-4 py-2 rounded-xl font-bold border bg-white hover:bg-gray-50">
            Tải file mẫu
          </button>

          <label className={`px-4 py-2 rounded-xl font-bold border bg-white hover:bg-gray-50 cursor-pointer ${importing ? 'opacity-60 pointer-events-none' : ''}`}>
            {importing ? 'Đang nhập...' : 'Nhập Excel/CSV'}
            <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleImportEmployees} />
          </label>

          <button onClick={handleExportEmployees} className="px-4 py-2 rounded-xl font-bold border bg-white hover:bg-gray-50">
            Xuất Excel
          </button>

          <button onClick={() => {
            setModalMode("add");
            setForm(defaultForm);
            setSelectedAvatarFile(null);
            setShowModal(true);
          }} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition">
            <UserPlus size={20} /> Thêm nhân viên
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Tổng nhân viên" value={totalEmployees} />
        <StatCard title="Quản trị viên" value={adminCount} />
        <StatCard title="Nhân sự" value={hrCount} />
        <StatCard title="Nhân viên" value={empCount} />
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Tìm theo họ tên hoặc mã nhân viên..." className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setSearchTerm(e.target.value)} />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-600">Tháng:</span>
          <select value={currentMonth} onChange={e => setCurrentMonth(Number(e.target.value))} className="border rounded-lg px-3 py-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i + 1} value={i + 1}>{`Tháng ${i + 1}`}</option>
            ))}
          </select>

          <span className="text-sm font-bold text-gray-600">Năm:</span>
          <select value={currentYear} onChange={e => setCurrentYear(Number(e.target.value))} className="border rounded-lg px-3 py-2">
            {Array.from({ length: 6 }).map((_, i) => {
              const y = new Date().getFullYear() - 3 + i;
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>
        </div>
      </div>

      <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
        <table className="w-full text-left table-fixed">
          <thead className="bg-gray-50 border-b">
            <tr>
              <Th>
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={toggleSelectAllEmployees}
                />
              </Th>
              <Th>Mã NV</Th>
              <Th>Họ và tên</Th>
              <Th>Email</Th>
              <Th>Chức vụ</Th>
              <Th>Đi làm (tháng)</Th>
              <Th>Đi muộn</Th>
              <Th>Nghỉ phép</Th>
              <Th>Lương</Th>
              <Th>Hành động</Th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map(e => {
              const s = employeeStats[e.id] || { worked: 0, late: 0, leave: 0 };
              return (
                <tr key={e.id} className="border-b hover:bg-blue-50/50 transition">
                  <Td>
                    <input
                      type="checkbox"
                      checked={selectedEmployeeIds.has(e.id)}
                      onChange={() => toggleSelectedEmployee(e.id)}
                    />
                  </Td>
                  <Td><span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs">{e.employeeCode}</span></Td>
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border bg-gray-100">
                        <img
                          src={e.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(e.fullName || e.username || '')}&background=random`}
                          className="w-full h-full object-cover"
                          alt="avatar"
                        />
                      </div>
                      <div>
                        <div className="font-black text-gray-800 leading-tight">{e.fullName}</div>
                        <div className="text-xs text-gray-400 leading-tight">@{e.username}</div>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <div className="text-sm text-gray-700">{e.email || '-'}</div>
                  </Td>
                  <Td><div className="text-sm font-medium">{e.position}</div></Td>
                  <Td><span className="font-bold text-emerald-600">{s.worked} ngày</span></Td>
                  <Td><span className="font-bold text-orange-600">{s.late} lần</span></Td>
                  <Td><span className="font-bold text-blue-600">{s.leave} ngày</span></Td>
                  <Td><span className="font-black text-blue-600">{(e.salary || 0).toLocaleString()}đ</span></Td>
                  <Td>
                    <div className="flex gap-2">
                      <button onClick={() => {
                        setForm({ ...defaultForm, ...e });
                        setSelectedAvatarFile(null);
                        setModalMode("view");
                        setShowModal(true);
                      }} className="p-2 bg-gray-100 rounded-lg hover:bg-emerald-100 text-emerald-600 transition"><Eye size={16}/></button>
                      <button onClick={() => {
                        setForm({ ...defaultForm, ...e });
                        setSelectedAvatarFile(null);
                        setModalMode("edit");
                        setShowModal(true);
                      }} className="p-2 bg-gray-100 rounded-lg hover:bg-blue-100 text-blue-600 transition"><Edit2 size={16}/></button>
                      <button onClick={() => setDeleteId(e.id)} className="p-2 bg-gray-100 rounded-lg hover:bg-red-100 text-red-600 transition"><Trash2 size={16}/></button>
                    </div>
                  </Td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b bg-blue-600 text-white rounded-t-3xl flex justify-between items-center">
              <h2 className="text-xl font-black uppercase">
                {modalMode === "add" ? "Thêm nhân viên" : (modalMode === "edit" ? "Cập nhật nhân viên" : "Xem chi tiết nhân viên")}
              </h2>
              <button onClick={() => setShowModal(false)}><X size={28} /></button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 space-y-8">
              <Section title="Hồ sơ cá nhân & Ảnh" icon={<User className="text-blue-600"/>}>
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="relative group flex-shrink-0">
                    <div className="w-20 h-20 md:w-24 md:h-24 aspect-square rounded-2xl border-4 border-gray-100 overflow-hidden shadow-xl bg-gray-50 flex items-center justify-center">
                      {form.avatar ? (
                        <img src={form.avatar} className="w-full h-full object-cover" style={{ maxWidth: '100%', maxHeight: '100%' }} alt="avatar" />
                      ) : (
                        <ImageIcon size={48} className="text-gray-200" />
                      )}
                    </div>

                    {modalMode !== "view" && (
                      <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-2xl cursor-pointer transition">
                        {isUploading ? <span className="text-white font-bold">Đang tải...</span> : <Upload className="text-white" />}
                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                      </label>
                    )}
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <FormField label="Họ và tên" name="fullName" form={form} handleChange={e => setForm({...form, fullName: e.target.value})} modalMode={modalMode} required />
                    <FormField label="Email" name="email" form={form} handleChange={e => setForm({...form, email: e.target.value})} modalMode={modalMode} required />
                    <FormField label="Số điện thoại" name="phone" form={form} handleChange={e => setForm({...form, phone: e.target.value})} modalMode={modalMode} />
                    <FormField label="Ngày sinh" name="dob" type="date" form={form} handleChange={e => setForm({...form, dob: e.target.value})} modalMode={modalMode} />
                    <FormField label="Mã nhân viên" name="employeeCode" form={form} handleChange={e => setForm({...form, employeeCode: e.target.value})} modalMode={modalMode} required />
                    <FormField label="Tên đăng nhập" name="username" form={form} handleChange={e => setForm({...form, username: e.target.value})} modalMode={modalMode} required />
                    <FormField label="Địa chỉ" name="address" form={form} handleChange={e => setForm({...form, address: e.target.value})} modalMode={modalMode} />
                  </div>
                </div>
              </Section>

              <Section title="Công việc & Hợp đồng" icon={<Briefcase className="text-blue-600"/>}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField label="Chức vụ" name="position" form={form} handleChange={e => setForm({...form, position: e.target.value})} modalMode={modalMode} />
                  <FormField label="Lương cơ bản" name="salary" type="number" form={form} handleChange={e => setForm({...form, salary: e.target.value})} modalMode={modalMode} />
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Phòng ban</label>
                    <select value={form.departmentId} onChange={e => setForm({...form, departmentId: e.target.value})} className="w-full border-2 p-2 rounded-xl">
                      <option value="">Chọn phòng ban</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <FormField label="Ngày bắt đầu" name="startDate" type="date" form={form} handleChange={e => setForm({...form, startDate: e.target.value})} modalMode={modalMode} />
                  <FormField label="Quản lý trực tiếp" name="managerName" form={form} handleChange={e => setForm({...form, managerName: e.target.value})} modalMode={modalMode} />
                  <FormField label="Loại hợp đồng" name="contractType" form={form} handleChange={e => setForm({...form, contractType: e.target.value})} modalMode={modalMode} />
                  <FormField label="Ngày kết thúc HĐ" name="contractEndDate" type="date" form={form} handleChange={e => setForm({...form, contractEndDate: e.target.value})} modalMode={modalMode} />
                </div>
              </Section>

              <Section title="Hiệu suất" icon={<TrendingUp className="text-blue-600"/>}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField label="Đánh giá hiệu suất" name="performanceRate" type="number" form={form} handleChange={e => setForm({...form, performanceRate: e.target.value})} modalMode={modalMode} />
                </div>
              </Section>

              <Section title="Tài khoản" icon={<Shield className="text-blue-600"/>}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Quyền truy cập</label>
                    <select value={form.role || "EMPLOYEE"} onChange={e => setForm({...form, role: e.target.value})} className="w-full border-2 p-2 rounded-xl">
                      <option value="EMPLOYEE">Nhân viên</option>
                      <option value="HR">Nhân sự (HR)</option>
                      <option value="ADMIN">Quản trị (Admin)</option>
                    </select>
                  </div>
                  <FormField label="Mật khẩu (chỉ nhập khi muốn đổi)" name="password" type="password" form={form} handleChange={e => setForm({...form, password: e.target.value})} modalMode={modalMode} />
                </div>
              </Section>


         
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-4 rounded-b-3xl">
              <button onClick={() => setShowModal(false)} className="px-6 py-2 border-2 rounded-xl font-bold">Đóng</button>
              {modalMode !== "view" && <button onClick={submitEmployee} className="px-10 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-lg">Lưu</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const Th = ({ children }) => <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest">{children}</th>;
const Td = ({ children }) => <td className="p-4 text-sm text-gray-700 align-middle break-words">{children}</td>;

const StatCard = ({ title, value }) => (
  <div className="bg-white border rounded-xl p-4 shadow-sm">
    <div className="text-xs font-black text-gray-400 uppercase tracking-widest">{title}</div>
    <div className="mt-2 text-2xl font-black text-gray-800">{value}</div>
  </div>
);

const Section = ({ title, icon, children }) => (
  <div className="border-2 border-gray-100 rounded-2xl p-6 relative">
    <div className="absolute -top-4 left-6 bg-white px-3 flex items-center gap-2 font-black text-gray-800">
      {icon} <span>{title}</span>
    </div>
    {children}
  </div>
);
const FormField = ({ label, name, type = "text", form, handleChange, modalMode, required }) => (
  <div>
    <label className="block text-sm font-bold text-gray-700 mb-1">{label} {required && "*"}</label>
    <input type={type} value={form[name] || ""} onChange={handleChange} readOnly={modalMode === "view"} className="w-full border-2 p-2 rounded-xl focus:border-blue-500 outline-none" />
  </div>
);