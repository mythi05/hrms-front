import { useState, useEffect } from "react";
import { Building2, Search, Plus, Edit, Trash2, Users, ChevronRight, Filter, UserMinus, UserPlus, DollarSign, Calendar, TrendingUp, Clock } from "lucide-react";
import { departmentApi } from "../../api/departmentApi";
import { employeeApi } from "../../api/employeeApi";
import { useNavigate } from "react-router-dom";

export default function DepartmentManagement() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departmentStats, setDepartmentStats] = useState({});
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', managerId: '' });

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
    fetchDepartmentStats();
  }, []);

  const fetchDepartmentStats = async () => {
    try {
      const response = await departmentApi.getWithEmployeeCount();
      const statsMap = {};
      response.data.forEach(dept => {
        statsMap[dept.id] = dept;
      });
      setDepartmentStats(statsMap);
    } catch (error) {
      console.error('Error fetching department stats:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentApi.getAll();
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await employeeApi.getAll();
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleAddDepartment = async () => {
    try {
      await departmentApi.create(formData);
      setShowAddModal(false);
      setFormData({ name: '', description: '', managerId: '' });
      fetchDepartments();
      fetchDepartmentStats();
    } catch (error) {
      console.error('Error adding department:', error);
    }
  };

  const handleEditDepartment = async () => {
    try {
      await departmentApi.update(selectedDepartment.id, formData);
      setShowEditModal(false);
      setSelectedDepartment(null);
      setFormData({ name: '', description: '', managerId: '' });
      fetchDepartments();
      fetchDepartmentStats();
    } catch (error) {
      console.error('Error updating department:', error);
    }
  };

  const handleDeleteDepartment = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phòng ban này?')) {
      try {
        await departmentApi.delete(id);
        fetchDepartments();
        fetchDepartmentStats();
      } catch (error) {
        console.error('Error deleting department:', error);
      }
    }
  };

  const calculateDepartmentStats = (departmentId) => {
    const deptEmployees = getDepartmentEmployees(departmentId);
    const totalSalary = deptEmployees.reduce((sum, emp) => sum + (emp.salary || 0), 0);
    const avgSalary = deptEmployees.length > 0 ? totalSalary / deptEmployees.length : 0;
    
    return {
      employeeCount: deptEmployees.length,
      totalSalary: totalSalary,
      avgSalary: avgSalary,
      // Mock data for leave days - có thể thay bằng API thật
      totalLeaveDays: Math.floor(deptEmployees.length * 1.5),
      avgWorkHours: 8.5,
      // Mock data for overtime
      totalOvertimeHours: Math.floor(deptEmployees.length * 2.3)
    };
  };

  const handleAddEmployeeToDepartment = async (employeeId) => {
    try {
      await employeeApi.update(employeeId, { departmentId: selectedDepartment.id });
      fetchDepartments();
      fetchEmployees();
      fetchDepartmentStats();
    } catch (error) {
      console.error('Error adding employee to department:', error);
    }
  };

  const handleRemoveEmployeeFromDepartment = async (employeeId) => {
    try {
      await employeeApi.update(employeeId, { departmentId: null });
      fetchDepartments();
      fetchEmployees();
      fetchDepartmentStats();
    } catch (error) {
      console.error('Error removing employee from department:', error);
    }
  };

  const getDepartmentEmployees = (departmentId) => {
    return employees.filter(emp => emp.departmentId === departmentId);
  };

  const getAvailableEmployees = () => {
    return employees.filter(emp => !emp.departmentId || emp.departmentId === selectedDepartment?.id);
  };

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản trị phòng ban</h1>
          <p className="text-gray-600 mt-1">Quản lý phòng ban và nhân viên trong hệ thống</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          Thêm phòng ban
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm phòng ban..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
            <Filter size={20} />
            Bộ lọc
          </button>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDepartments.map((department) => {
          const deptEmployees = getDepartmentEmployees(department.id);
          const manager = employees.find(emp => emp.id === department.managerId);
          const stats = calculateDepartmentStats(department.id);
          
          return (
            <div key={department.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/admin/departments/${department.id}`)}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{department.name}</h3>
                      <p className="text-sm text-gray-600">{stats.employeeCount} nhân viên</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDepartment(department);
                        setFormData({
                          name: department.name,
                          description: department.description || '',
                          managerId: department.managerId || ''
                        });
                        setShowEditModal(true);
                      }}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDepartment(department.id);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">
                  {department.description || 'Chưa có mô tả'}
                </p>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="text-green-600" size={16} />
                      <span className="text-xs font-medium text-green-800">Tổng lương</span>
                    </div>
                    <p className="text-lg font-bold text-green-900">
                      {stats.totalSalary.toLocaleString('vi-VN')}đ
                    </p>
                    <p className="text-xs text-green-600">
                      TB: {stats.avgSalary.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="text-blue-600" size={16} />
                      <span className="text-xs font-medium text-blue-800">Ngày phép</span>
                    </div>
                    <p className="text-lg font-bold text-blue-900">
                      {stats.totalLeaveDays}
                    </p>
                    <p className="text-xs text-blue-600">ngày</p>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="text-purple-600" size={16} />
                      <span className="text-xs font-medium text-purple-800">Giờ làm</span>
                    </div>
                    <p className="text-lg font-bold text-purple-900">
                      {stats.avgWorkHours}h
                    </p>
                    <p className="text-xs text-purple-600">trung bình</p>
                  </div>
                  
                  <div className="bg-orange-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="text-orange-600" size={16} />
                      <span className="text-xs font-medium text-orange-800">Làm thêm</span>
                    </div>
                    <p className="text-lg font-bold text-orange-900">
                      {stats.totalOvertimeHours}h
                    </p>
                    <p className="text-xs text-orange-600">tổng cộng</p>
                  </div>
                </div>

                {manager && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">Quản lý</p>
                    <p className="text-sm text-gray-900">{manager.fullName}</p>
                    <p className="text-xs text-gray-500">{manager.position}</p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-700">Nhân viên</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDepartment(department);
                          setShowEmployeeModal(true);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Quản lý
                      </button>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {deptEmployees.slice(0, 3).map((employee) => (
                      <div key={employee.id} className="flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {employee.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <span className="text-gray-700">{employee.fullName}</span>
                        <span className="text-gray-500">- {employee.position}</span>
                      </div>
                    ))}
                    {deptEmployees.length > 3 && (
                      <p className="text-sm text-gray-500">
                        +{deptEmployees.length - 3} nhân viên khác
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Department Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Thêm phòng ban mới</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên phòng ban
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tên phòng ban"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Nhập mô tả phòng ban"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quản lý phòng ban
                </label>
                <select
                  value={formData.managerId}
                  onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn quản lý</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} - {emp.position}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddDepartment}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Thêm
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({ name: '', description: '', managerId: '' });
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {showEditModal && selectedDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Chỉnh sửa phòng ban</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên phòng ban
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quản lý phòng ban
                </label>
                <select
                  value={formData.managerId}
                  onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn quản lý</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} - {emp.position}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleEditDepartment}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Lưu
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedDepartment(null);
                  setFormData({ name: '', description: '', managerId: '' });
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employee Management Modal */}
     
    </div>
  );
}
