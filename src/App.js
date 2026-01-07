import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Dashboard } from "./components/Dashboard";

import AdminLogin from "./pages/AdminLogin"; // Admin login
import ProtectedRoute from "./pages/ProtectedRoute";
import EmployeePortal from "./components/EmployeePortal";
import "./App.css";
import "./index5.css";
import "./index2.css";
import "./index4.css";
import EmployeeAttendanceAdmin from "./components/attendanceadmin/EmployeeAttendanceAdmin";
import Employee from "./pages/Employee";
import LoginEmployee from "./pages/employee/LoginEmployee";
import AdminLeavePage from "./components/admin/AdminLeavePage";
import AdminPayrollPage from "./components/admin/AdminPayrollPage";
import DepartmentManagement from "./components/admin/DepartmentManagement";
import DepartmentDetails from "./components/admin/DepartmentDetails";
import AdminTaskPage from "./components/admin/AdminTaskPage";
import AdminPerformancePage from "./components/admin/AdminPerformancePage";
import AdminSettings from "./components/admin/AdminSettings";
import AdminDocuments from "./components/admin/AdminDocuments";
import AdminNotifications from "./components/admin/AdminNotifications";

export default function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  console.log('App state:', { isMobile, sidebarOpen });

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 767;
      console.log('Mobile check:', window.innerWidth, mobile);
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
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

    window.addEventListener('admin:navigate', handler);
    return () => window.removeEventListener('admin:navigate', handler);
  }, []);

  useEffect(() => {
    if (!isMobile || !sidebarOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobile, sidebarOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin/login");
  };

  // Layout Admin
  const AdminLayout = () => {
    const renderPageContent = () => {
      switch (currentPage) {
        case "dashboard":
          return <Dashboard />;
        case "employees":
          return <Employee />;
        case "departments":
          return <DepartmentManagement />;
        case "attendance":
          return <EmployeeAttendanceAdmin />;
        case "leave":
          return <AdminLeavePage />;
        case "payroll":
          return <AdminPayrollPage />;
        case "tasks":
          return <AdminTaskPage />;
        case "performance":
          return <AdminPerformancePage />;
        // case "recruitment":
        //   return <div>Tuyển dụng</div>;

        case "reports":
          return <AdminDocuments />;
        case "notifications":
          return <AdminNotifications />;
        case "settings":
          return <AdminSettings />;
        default:
          return <Dashboard />;
      }
    };

    return (
      <div className="relative flex h-screen bg-gray-50">
        {isMobile && sidebarOpen && (
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/40"
          />
        )}
        <Sidebar
          currentPage={currentPage}
          setCurrentPage={(page) => {
            setCurrentPage(page);
            if (isMobile) setSidebarOpen(false);
          }}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          mobileOpen={sidebarOpen}
          setMobileOpen={setSidebarOpen}
          isMobile={isMobile}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            onLogout={handleLogout}
            onOpenSidebar={() => {
              console.log('Admin header menu button clicked, isMobile:', isMobile);
              if (isMobile) setSidebarOpen(true);
            }}
            showMenuButton={isMobile}
          />
          <main className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-6">{renderPageContent()}</main>
        </div>
      </div>
    );
  };

  return (
    <Routes>
      {/* Employee login */}
      <Route path="/login" element={<LoginEmployee />} />

      {/* Employee portal */}
      <Route
        path="/employee/*"
        element={
          <ProtectedRoute role="EMPLOYEE">
            <EmployeePortal />
          </ProtectedRoute>
        }
      />

      {/* Admin login */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Department Details - Separate Route */}
      <Route
        path="/admin/departments/:id"
        element={
          <ProtectedRoute role="ADMIN">
            <DepartmentDetails />
          </ProtectedRoute>
        }
      />

      {/* Admin portal */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute role="ADMIN">
            <AdminLayout />
          </ProtectedRoute>
        }
      />

      {/* Redirect tất cả các path khác về login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
