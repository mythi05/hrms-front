import { StatCard } from './StatCard';
import { RecentActivities } from './RecentActivities';
import { DepartmentChart } from './DepartmentChart';
import { AttendanceChart } from './charts/AttendanceChart';
import { PayrollTrendChart } from './charts/PayrollTrendChart';
import { Users, UserCheck, UserX, Calendar, Building2, ChevronRight, TrendingUp, DollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { departmentApi } from '../api/departmentApi';
import { employeeApi } from '../api/employeeApi';
import { getAttendanceOfMonth } from '../api/attendanceApi';

export function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [departmentData, setDepartmentData] = useState([]);
  const [birthdays, setBirthdays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch departments and employees
        const [departmentsRes, employeesRes] = await Promise.all([
          departmentApi.getAll(),
          employeeApi.getAll()
        ]);
        
        const departments = departmentsRes.data || [];
        const employees = employeesRes.data || [];
        
        setDepartments(departments);
        setEmployees(employees);
        
        // Calculate stats from real data
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        // Fetch attendance data for current month
        const attendanceMap = {};
        for (const employee of employees) {
          try {
            const res = await getAttendanceOfMonth(employee.id, currentMonth, currentYear);
            attendanceMap[employee.id] = res.data || [];
          } catch (error) {
            attendanceMap[employee.id] = [];
          }
        }
        setAttendanceData(attendanceMap);
        
        // Calculate today's attendance
        let presentToday = 0;
        let onLeaveToday = 0;
        let absentToday = 0;
        
        for (const employee of employees) {
          const attendance = attendanceMap[employee.id] || [];
          const todayRecord = attendance.find(record => 
            record.date && record.date.startsWith(todayStr)
          );
          
          if (todayRecord) {
            if (todayRecord.status === 'PRESENT' || todayRecord.status === 'LATE') {
              presentToday++;
            } else if (todayRecord.status === 'LEAVE') {
              onLeaveToday++;
            } else if (todayRecord.status === 'ABSENT') {
              absentToday++;
            }
          } else {
            // If no record for today, consider as absent
            absentToday++;
          }
        }
        
        // Calculate department distribution
        const deptDistribution = departments.map(dept => {
          const deptEmployees = employees.filter(emp => emp.departmentId === dept.id);
          return {
            name: dept.name,
            count: deptEmployees.length,
            value: deptEmployees.length
          };
        });
        
        // Calculate birthdays this month
        const currentMonthNum = new Date().getMonth() + 1;
        const birthdaysThisMonth = employees
          .filter(emp => {
            if (!emp.dob) return false;
            const dob = new Date(emp.dob);
            return dob.getMonth() + 1 === currentMonthNum;
          })
          .map(emp => {
            const dept = departments.find(d => d.id === emp.departmentId);
            return {
              name: emp.fullName,
              department: dept?.name || 'Chưa có phòng ban',
              birthday: new Date(emp.dob).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' })
            };
          });
        
        setStats({
          totalEmployees: employees.length,
          presentToday,
          onLeaveToday,
          absentToday,
          totalDepartments: departments.length,
          totalSalary: employees.reduce((sum, emp) => sum + (emp.salary || 0), 0),
          avgSalary: employees.length > 0 ? Math.round(employees.reduce((sum, emp) => sum + (emp.salary || 0), 0) / employees.length) : 0
        });
        
        setDepartmentData(deptDistribution);
        setBirthdays(birthdaysThisMonth);
        
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Không thể tải dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentMonth, currentYear]);

  const formatNumber = (num) => {
    return num ? num.toLocaleString('vi-VN') : '0';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2">Dashboard</h1>
        <p className="text-gray-600">Chào mừng đến với hệ thống quản lý nhân sự</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng nhân viên"
          value={formatNumber(stats?.totalEmployees)}
          change={`${stats?.totalDepartments || 0} phòng ban`}
          trend="up"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Đi làm hôm nay"
          value={formatNumber(stats?.presentToday)}
          change={`${stats?.totalEmployees ? Math.round((stats?.presentToday / stats?.totalEmployees) * 100) : 0}%`}
          trend="up"
          icon={UserCheck}
          color="green"
        />
        <StatCard
          title="Nghỉ phép hôm nay"
          value={formatNumber(stats?.onLeaveToday)}
          change={`${stats?.totalEmployees ? Math.round((stats?.onLeaveToday / stats?.totalEmployees) * 100) : 0}%`}
          trend="down"
          icon={Calendar}
          color="orange"
        />
        <StatCard
          title="Vắng mặt hôm nay"
          value={formatNumber(stats?.absentToday)}
          change={`${stats?.totalEmployees ? Math.round((stats?.absentToday / stats?.totalEmployees) * 100) : 0}%`}
          trend="up"
          icon={UserX}
          color="red"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Tổng lương"
          value={`${formatNumber(stats?.totalSalary)}đ`}
          change={`Trung bình: ${formatNumber(stats?.avgSalary)}đ`}
          trend="up"
          icon={DollarSign}
          color="purple"
        />
        <StatCard
          title="Phòng ban"
          value={formatNumber(stats?.totalDepartments)}
          change="Tổng số phòng ban"
          trend="up"
          icon={Building2}
          color="indigo"
        />
        <StatCard
          title="Sinh nhật tháng này"
          value={formatNumber(birthdays.length)}
          change="Đang kỷ niệm"
          trend="up"
          icon={Calendar}
          color="pink"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Biểu đồ phòng ban */}
        <DepartmentChart data={departmentData} />
        {/* Biểu đồ chấm công tháng */}
        <AttendanceChart attendanceData={attendanceData} />
      </div>

      {/* Biểu đồ thống kê */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PayrollTrendChart data={employees} />
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="mb-4">Thống kê nhanh</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tỷ lệ đi làm hôm nay</span>
              <span className="font-medium">{stats?.totalEmployees ? Math.round((stats?.presentToday / stats?.totalEmployees) * 100) : 0}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tỷ lệ nghỉ phép</span>
              <span className="font-medium">{stats?.totalEmployees ? Math.round((stats?.onLeaveToday / stats?.totalEmployees) * 100) : 0}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tỷ lệ vắng mặt</span>
              <span className="font-medium">{stats?.totalEmployees ? Math.round((stats?.absentToday / stats?.totalEmployees) * 100) : 0}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Lương trung bình</span>
              <span className="font-medium">{formatNumber(stats?.avgSalary)}đ</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Nhân viên mới</h3>
              <button 
                onClick={() => navigate('/admin/employees')}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Xem tất cả
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-3 text-xs text-gray-600">Nhân viên</th>
                    <th className="text-left p-3 text-xs text-gray-600">Vị trí</th>
                    <th className="text-left p-3 text-xs text-gray-600">Phòng ban</th>
                    <th className="text-left p-3 text-xs text-gray-600">Lương</th>
                    <th className="text-left p-3 text-xs text-gray-600">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.slice(0, 5).map((employee) => {
                    const dept = departments.find(d => d.id === employee.departmentId);
                    const attendance = attendanceData[employee.id] || [];
                    const todayRecord = attendance.find(record => {
                      const today = new Date().toISOString().split('T')[0];
                      return record.date && record.date.startsWith(today);
                    });
                    
                    return (
                      <tr key={employee.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-blue-600">
                                {employee.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 text-sm">{employee.fullName}</div>
                              <div className="text-xs text-gray-500">{employee.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-sm text-gray-700">{employee.position}</td>
                        <td className="p-3 text-sm text-gray-700">{dept?.name || 'Chưa có'}</td>
                        <td className="p-3 text-sm text-gray-700">
                          {employee.salary ? employee.salary.toLocaleString('vi-VN') + 'đ' : 'Chưa có'}
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            todayRecord?.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                            todayRecord?.status === 'LATE' ? 'bg-yellow-100 text-yellow-700' :
                            todayRecord?.status === 'LEAVE' ? 'bg-blue-100 text-blue-700' :
                            todayRecord?.status === 'ABSENT' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {todayRecord?.status === 'PRESENT' ? 'Đi làm' :
                             todayRecord?.status === 'LATE' ? 'Đi muộn' :
                             todayRecord?.status === 'LEAVE' ? 'Nghỉ phép' :
                             todayRecord?.status === 'ABSENT' ? 'Vắng mặt' : 'Chưa cập nhật'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {employees.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-4 text-center text-gray-500">
                        Chưa có nhân viên nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="mb-4">Sinh nhật tháng này</h3>
          <div className="space-y-3">
            {birthdays.length === 0 ? (
              <div className="text-gray-500 text-sm">Không có sinh nhật trong tháng này</div>
            ) : (
              birthdays.map((person, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div>
                    <div className="text-gray-800">{person.name}</div>
                    <div className="text-xs text-gray-500">{person.department}</div>
                  </div>
                  <div className="text-purple-600">{person.birthday}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Departments Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Phòng ban</h3>
          <button 
            onClick={() => navigate('/admin/departments')}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Xem tất cả
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.slice(0, 6).map((dept) => {
            const deptEmployees = employees.filter(emp => emp.departmentId === dept.id);
            const manager = employees.find(emp => emp.id === dept.managerId);
            
            return (
              <div 
                key={dept.id} 
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/admin/departments/${dept.id}`)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{dept.name}</h4>
                    <p className="text-sm text-gray-600">{deptEmployees.length} nhân viên</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-400 ml-auto" />
                </div>
                {manager && (
                  <div className="text-xs text-gray-500">
                    Quản lý: {manager.fullName}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {dept.description || 'Chưa có mô tả'}
                </p>
              </div>
            );
          })}
          {departments.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-8">
              Chưa có phòng ban nào
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
