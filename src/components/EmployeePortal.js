import { useEffect, useState } from 'react';
import EmployeeAttendance from './employee/attendance/EmployeeAttendance';
import EmployeeHeader from './employee/EmployeeHeader';
import EmployeeDashboard from './employee/EmployeeDashboard';
import EmployeeProfile from './employee/EmployeeProfile';
import EmployeeLeave from './employee/EmployeeLeave';
import EmployeePayroll from './employee/EmployeePayroll';
import EmployeeTasks from './employee/EmployeeTasks';
import EmployeePerformance from './employee/EmployeePerformance';
import EmployeeNotifications from './employee/EmployeeNotifications';
import { EmployeeSidebar } from './employee/EmployeeSidebar';

export default function EmployeePortal() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handler = (event) => {
      const page = event.detail;
      if (page) {
        setCurrentPage(page);
      }
    };

    window.addEventListener('employee:navigate', handler);
    return () => window.removeEventListener('employee:navigate', handler);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <EmployeeSidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <EmployeeHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {currentPage === 'dashboard' && <EmployeeDashboard setCurrentPage={setCurrentPage} />}
          {currentPage === 'profile' && <EmployeeProfile />}
          {currentPage === 'attendance' && <EmployeeAttendance />}
          {currentPage === 'leave' && <EmployeeLeave />}
          {currentPage === 'payroll' && <EmployeePayroll />}
          {currentPage === 'tasks' && <EmployeeTasks />}
          {currentPage === 'performance' && <EmployeePerformance />}
          {currentPage === 'notifications' && <EmployeeNotifications />}
          {currentPage === 'training' && (
            <div className="bg-white rounded-lg shadow p-8">
              <h2 className="mb-4">Khóa học của tôi</h2>
              <p className="text-gray-600">Danh sách khóa học đào tạo sẽ hiển thị ở đây</p>
            </div>
          )}
          {currentPage === 'documents' && (
            <div className="bg-white rounded-lg shadow p-8">
              <h2 className="mb-4">Tài liệu</h2>
              <p className="text-gray-600">Tài liệu công ty, quy định nội bộ</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
