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
import EmployeeSettings from './employee/EmployeeSettings';
import { EmployeeSidebar } from './employee/EmployeeSidebar';
import { Menu } from 'lucide-react';

export default function EmployeePortal() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  console.log('EmployeePortal state:', { isMobile, mobileSidebarOpen, currentPage });
  console.log('EmployeePortal props to sidebar:', { isMobile, mobileOpen: mobileSidebarOpen, setMobileOpen: typeof setMobileSidebarOpen });

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 767;
      console.log('Employee mobile check:', window.innerWidth, mobile);
      setIsMobile(mobile);
      if (!mobile) setMobileSidebarOpen(false);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    <div className="flex h-screen bg-gray-50 relative">
      {isMobile && mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40"
        />
      )}
      <EmployeeSidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        isMobile={isMobile}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <EmployeeHeader 
          isMobile={isMobile}
          onOpenSidebar={() => {
            console.log('Employee header menu button clicked, isMobile:', isMobile);
            console.log('Before setMobileSidebarOpen:', mobileSidebarOpen);
            setMobileSidebarOpen(true);
            console.log('After setMobileSidebarOpen called');
          }}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {currentPage === 'dashboard' && <EmployeeDashboard setCurrentPage={setCurrentPage} />}
          {currentPage === 'profile' && <EmployeeProfile />}
          {currentPage === 'attendance' && <EmployeeAttendance />}
          {currentPage === 'leave' && <EmployeeLeave />}
          {currentPage === 'payroll' && <EmployeePayroll />}
          {currentPage === 'tasks' && <EmployeeTasks />}
          {currentPage === 'performance' && <EmployeePerformance />}
          {currentPage === 'notifications' && <EmployeeNotifications />}
          {currentPage === 'settings' && <EmployeeSettings />}
          {currentPage === 'training' && (
            <div className="bg-white rounded-lg shadow p-4 md:p-8">
              <h2 className="mb-4 text-lg md:text-xl">Khóa học của tôi</h2>
              <p className="text-gray-600 text-sm md:text-base">Danh sách khóa học đào tạo sẽ hiển thị ở đây</p>
            </div>
          )}
          {currentPage === 'documents' && (
            <div className="bg-white rounded-lg shadow p-4 md:p-8">
              <h2 className="mb-4 text-lg md:text-xl">Tài liệu</h2>
              <p className="text-gray-600 text-sm md:text-base">Tài liệu công ty, quy định nội bộ</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
