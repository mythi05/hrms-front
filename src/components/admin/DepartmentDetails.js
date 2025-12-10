import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Building2, ArrowLeft, Users, Calendar, DollarSign, Clock, CheckCircle, XCircle, Search, Filter, AlertCircle } from "lucide-react";
import { departmentApi } from "../../api/departmentApi";
import { employeeApi } from "../../api/employeeApi";
import { getAttendanceOfMonth } from "../../api/attendanceApi";

export default function DepartmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [department, setDepartment] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeData, setEmployeeData] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('employees');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (id) {
      fetchDepartmentDetails();
    }
  }, [id]);

  useEffect(() => {
    if (employees.length > 0) {
      loadEmployeeStats();
    }
  }, [employees, currentMonth, currentYear]);

  const fetchDepartmentDetails = async () => {
    setLoading(true);
    try {
      // Fetch department info
      const deptResponse = await departmentApi.getById(id);
      setDepartment(deptResponse.data);

      // Fetch all employees and filter by department
      const empResponse = await employeeApi.getAll();
      const allEmployees = empResponse.data;
      const departmentEmployees = allEmployees.filter(emp => emp.departmentId === parseInt(id));
      setEmployees(departmentEmployees);
    } catch (error) {
      console.error('Error fetching department details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load thống kê cho tất cả nhân viên trong phòng ban
  const loadEmployeeStats = async () => {
    setLoadingStats(true);
    const data = {};
    
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
        
        data[employee.id] = {
          workedDays,
          lateDays,
          leaveDays,
          salary: employee.salary || 0,
          attendance: attendanceData
        };
      } catch (error) {
        // Nếu không có data chấm công, set default values
        data[employee.id] = {
          workedDays: 0,
          lateDays: 0,
          leaveDays: 0,
          salary: employee.salary || 0,
          attendance: []
        };
      }
    }
    
    setEmployeeData(data);
    setLoadingStats(false);
  };

  const getEmployeeStats = (employeeId) => {
    const data = employeeData[employeeId] || {};
    
    return {
      workedDays: data.workedDays || 0,
      lateDays: data.lateDays || 0,
      leaveDays: data.leaveDays || 0,
      salary: data.salary || 0
    };
  };

  const getDepartmentEmployees = () => {
    return employees.filter(emp => emp.departmentId === parseInt(id));
  };

  const filteredEmployees = getDepartmentEmployees().filter(emp =>
    emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Không tìm thấy phòng ban</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/departments')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
          Quay lại
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{department.name}</h1>
          <p className="text-gray-600 mt-1">{department.description || 'Chưa có mô tả'}</p>
        </div>
      </div>

      {/* Department Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center gap-3">
            <Users className="text-blue-600" size={24} />
            <div>
              <div className="text-2xl font-bold text-gray-900">{employees.length}</div>
              <div className="text-sm text-gray-600">Tổng nhân viên</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-600" size={24} />
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {employees.reduce((sum, emp) => sum + getEmployeeStats(emp.id).workedDays, 0)}
              </div>
              <div className="text-sm text-gray-600">Đi làm (tháng {currentMonth})</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center gap-3">
            <Clock className="text-yellow-600" size={24} />
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {employees.reduce((sum, emp) => sum + getEmployeeStats(emp.id).lateDays, 0)}
              </div>
              <div className="text-sm text-gray-600">Đi muộn (tháng {currentMonth})</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center gap-3">
            <DollarSign className="text-purple-600" size={24} />
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {employees.reduce((sum, emp) => sum + getEmployeeStats(emp.id).salary, 0).toLocaleString('vi-VN')}
              </div>
              <div className="text-sm text-gray-600">Tổng lương</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm nhân viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
            <Filter size={20} />
            Bộ lọc
          </button>
        </div>
      </div>

      {/* Employees List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Danh sách nhân viên</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 text-xs text-gray-600">Nhân viên</th>
                <th className="text-left p-4 text-xs text-gray-600">Vị trí</th>
                <th className="text-left p-4 text-xs text-gray-600">Đi làm (tháng)</th>
                <th className="text-left p-4 text-xs text-gray-600">Đi muộn</th>
                <th className="text-left p-4 text-xs text-gray-600">Nghỉ phép</th>
                <th className="text-left p-4 text-xs text-gray-600">Lương</th>
                <th className="text-left p-4 text-xs text-gray-600">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-400">
                    {loadingStats ? "Đang tải thống kê..." : "Không có nhân viên trong phòng ban"}
                  </td>
                </tr>
              ) : filteredEmployees.map((employee) => {
                const stats = getEmployeeStats(employee.id);
                return (
                  <tr key={employee.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {employee.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{employee.fullName}</div>
                          <div className="text-sm text-gray-500">{employee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-700">{employee.position}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-500" />
                        <span className="text-gray-700">{stats.workedDays} ngày</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-yellow-500" />
                        <span className="text-gray-700">{stats.lateDays} lần</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={16} className="text-blue-500" />
                        <span className="text-gray-700">{stats.leaveDays} ngày</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} className="text-green-500" />
                        <span className="text-gray-700">
                          {stats.salary ? stats.salary.toLocaleString('vi-VN') + 'đ' : 'Chưa có'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedEmployee(employee)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Chi tiết nhân viên</h2>
                <p className="text-gray-600">{selectedEmployee.fullName}</p>
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Employee Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Thông tin cá nhân</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Họ và tên:</span>
                    <span className="ml-2 text-gray-900">{selectedEmployee.fullName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Vị trí:</span>
                    <span className="ml-2 text-gray-900">{selectedEmployee.position}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 text-gray-900">{selectedEmployee.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">SĐT:</span>
                    <span className="ml-2 text-gray-900">{selectedEmployee.phone || 'Chưa có'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Lương:</span>
                    <span className="ml-2 text-gray-900">{selectedEmployee.salary?.toLocaleString('vi-VN') || 0}đ</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Mã NV:</span>
                    <span className="ml-2 text-gray-900">{selectedEmployee.employeeCode || `#${selectedEmployee.id}`}</span>
                  </div>
                </div>
              </div>

              {/* Attendance Records */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Lịch sử chấm công (tháng {currentMonth})</h3>
                <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                  {(employeeData[selectedEmployee.id]?.attendance || []).slice(0, 10).map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg mb-2">
                      <div className="flex items-center gap-3">
                        {record.status === 'LATE' ? (
                          <Clock size={16} className="text-yellow-500" />
                        ) : record.status === 'ABSENT' ? (
                          <XCircle size={16} className="text-red-500" />
                        ) : (
                          <CheckCircle size={16} className="text-green-500" />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(record.date).toLocaleDateString('vi-VN')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {record.checkIn || '--:--'} - {record.checkOut || '--:--'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">{record.totalHours || '0h'}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          record.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                          record.status === 'LATE' ? 'bg-yellow-100 text-yellow-700' :
                          record.status === 'ABSENT' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {record.status === 'PRESENT' ? 'Có mặt' :
                           record.status === 'LATE' ? 'Đi muộn' :
                           record.status === 'ABSENT' ? 'Vắng mặt' : 'Nghỉ phép'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {(!employeeData[selectedEmployee.id]?.attendance || employeeData[selectedEmployee.id].attendance.length === 0) && (
                    <div className="text-center text-gray-500 py-4">Chưa có dữ liệu chấm công</div>
                  )}
                </div>
              </div>

              {/* Stats Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <CheckCircle className="text-green-600 mx-auto mb-2" size={24} />
                  <div className="text-2xl font-bold text-green-900">{getEmployeeStats(selectedEmployee.id).workedDays}</div>
                  <div className="text-sm text-green-600">Ngày đi làm</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <Clock className="text-yellow-600 mx-auto mb-2" size={24} />
                  <div className="text-2xl font-bold text-yellow-900">{getEmployeeStats(selectedEmployee.id).lateDays}</div>
                  <div className="text-sm text-yellow-600">Đi muộn</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <AlertCircle className="text-blue-600 mx-auto mb-2" size={24} />
                  <div className="text-2xl font-bold text-blue-900">{getEmployeeStats(selectedEmployee.id).leaveDays}</div>
                  <div className="text-sm text-blue-600">Nghỉ phép</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
