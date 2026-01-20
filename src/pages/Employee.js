import { useState, useEffect, useCallback } from "react";
import {
  UserPlus, X, Search, Edit2, Trash2, Eye, User, Shield, Briefcase,
  FileText, Award, Calendar, Clock, AlertCircle, DollarSign
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
  const [loadingStats, setLoadingStats] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", dob: "", address: "",
    position: "", departmentId: "", startDate: "", managerName: "",
    contractType: "", contractEndDate: "", experienceYears: 0,
    grade: "", performanceRate: 0, employeeCode: "",
    salary: "", username: "", password: "", role: "EMPLOYEE",
    skills: [], certificates: []
  });

  /* ================= LOAD DATA ================= */

  const loadEmployees = useCallback(async () => {
    try {
      const res = await employeeApi.getAll();
      setEmployees(res.data || []);
    } catch (err) {
      handleUnauthorized(err);
    }
  }, []);

  const loadDepartments = useCallback(async () => {
    try {
      const res = await departmentApi.getAll();
      setDepartments(res.data || []);
    } catch (err) {
      console.error("Load department error:", err);
    }
  }, []);

  const loadEmployeeStats = useCallback(async () => {
    setLoadingStats(true);
    const stats = {};

    for (const e of employees) {
      try {
        const res = await getAttendanceOfMonth(e.id, currentMonth, currentYear);
        const data = res.data || [];

        let workedDays = 0, lateDays = 0, leaveDays = 0;

        data.forEach(r => {
          if (["PRESENT", "LATE"].includes(r.status)) workedDays++;
          if (r.status === "LATE") lateDays++;
          if (["LEAVE", "ABSENT"].includes(r.status)) leaveDays++;
        });

        stats[e.id] = {
          workedDays,
          lateDays,
          leaveDays,
          salary: e.salary || 0
        };
      } catch {
        stats[e.id] = { workedDays: 0, lateDays: 0, leaveDays: 0, salary: e.salary || 0 };
      }
    }

    setEmployeeStats(stats);
    setLoadingStats(false);
  }, [employees, currentMonth, currentYear]);

  useEffect(() => {
    loadEmployees();
    loadDepartments();
  }, [loadEmployees, loadDepartments]);

  useEffect(() => {
    if (employees.length) loadEmployeeStats();
  }, [employees.length, loadEmployeeStats]);

  /* ================= HANDLERS ================= */

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleUnauthorized = err => {
    if (err?.response?.status === 401) {
      alert("Phiên đăng nhập hết hạn");
      window.location.href = "/admin/login";
    } else {
      alert("Lỗi tải dữ liệu");
    }
  };

  /* ================= MODAL ================= */

  const openAddModal = () => {
    setModalMode("add");
    setForm({
      fullName: "", email: "", phone: "", dob: "", address: "",
      position: "", departmentId: "", startDate: "", managerName: "",
      contractType: "", contractEndDate: "", experienceYears: 0,
      grade: "", performanceRate: 0, employeeCode: "",
      salary: "", username: "", password: "", role: "EMPLOYEE",
      skills: [], certificates: []
    });
    setShowModal(true);
  };

  const openEditModal = (e, mode = "edit") => {
    setModalMode(mode);
    setForm({
      ...e,
      dob: e.dob?.split("T")[0] || "",
      startDate: e.startDate?.split("T")[0] || "",
      contractEndDate: e.contractEndDate?.split("T")[0] || "",
      password: ""
    });
    setShowModal(true);
  };

  const submitEmployee = async () => {
    try {
      const payload = {
        ...form,
        departmentId: form.departmentId ? Number(form.departmentId) : null,
        experienceYears: Number(form.experienceYears || 0),
        performanceRate: Number(form.performanceRate || 0),
        salary: Number(form.salary || 0)
      };

      if (modalMode === "edit" && !form.password) delete payload.password;

      modalMode === "add"
        ? await employeeApi.create(payload)
        : await employeeApi.update(form.id, payload);

      alert("Lưu thành công");
      setShowModal(false);
      loadEmployees();
    } catch (err) {
      alert(err?.response?.data?.message || "Lỗi lưu dữ liệu");
    }
  };

  const deleteEmployee = async id => {
    try {
      await employeeApi.delete(id);
      alert("Đã xóa");
      loadEmployees();
    } catch (err) {
      handleUnauthorized(err);
    }
  };

  /* ================= FILTER ================= */

  const filteredEmployees = employees.filter(e =>
    [e.fullName, e.email, e.position].some(v =>
      v?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  /* ================= UI ================= */

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1>Quản lý Nhân viên</h1>
          <p className="text-gray-500">Danh sách nhân viên</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg flex gap-2"
        >
          <UserPlus size={18} /> Thêm nhân viên
        </button>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="pl-10 w-full border rounded-lg px-4 py-2"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <Th>Mã NV</Th>
              <Th>Họ tên</Th>
              <Th>Email</Th>
              <Th>Vị trí</Th>
              <Th>Đi làm</Th>
              <Th>Đi muộn</Th>
              <Th>Nghỉ</Th>
              <Th>Lương</Th>
              <Th>Hành động</Th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map(e => {
              const s = employeeStats[e.id] || {};
              return (
                <tr key={e.id} className="border-b">
                  <Td>{e.employeeCode}</Td>
                  <Td>{e.fullName}</Td>
                  <Td>{e.email}</Td>
                  <Td>{e.position}</Td>
                  <Td>{s.workedDays || 0}</Td>
                  <Td>{s.lateDays || 0}</Td>
                  <Td>{s.leaveDays || 0}</Td>
                  <Td>{s.salary?.toLocaleString("vi-VN")}đ</Td>
                  <Td className="flex gap-2">
                    <Eye onClick={() => openEditModal(e, "view")} className="cursor-pointer" />
                    <Edit2 onClick={() => openEditModal(e)} className="cursor-pointer" />
                    <Trash2 onClick={() => setDeleteId(e.id)} className="cursor-pointer text-red-600" />
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* DELETE CONFIRM */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <p>Bạn chắc chắn xóa?</p>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setDeleteId(null)}>Hủy</button>
              <button
                onClick={() => { deleteEmployee(deleteId); setDeleteId(null); }}
                className="bg-red-600 text-white px-4 py-1 rounded"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== COMPONENTS ===== */

const Th = ({ children }) => (
  <th className="text-left p-3 text-xs text-gray-600">{children}</th>
);

const Td = ({ children }) => (
  <td className="p-3 text-gray-700">{children}</td>
);
