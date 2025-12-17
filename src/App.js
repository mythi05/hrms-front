import React, { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Dashboard } from "./components/Dashboard";

import AdminLogin from "./pages/AdminLogin"; // Admin login
import ProtectedRoute from "./pages/ProtectedRoute";
import EmployeePortal from "./components/EmployeePortal";
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

export default function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

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
          return <AdminLeavePage/>;
        case "payroll":
          return <AdminPayrollPage />;
        case "tasks":
          return <AdminTaskPage />;
        case "performance":
          return <AdminPerformancePage />;
        case "recruitment":
          return <div>Tuyển dụng</div>;
        case "training":
          return <div>Đào tạo</div>;
        case "reports":
          return <div>Báo cáo</div>;
        case "settings":
          return <AdminSettings />;
        default:
          return <Dashboard />;
      }
    };

    return (
      <div className="relative flex h-screen bg-gray-50">
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
          />
        )}
        <Sidebar
          currentPage={currentPage}
          setCurrentPage={(page) => {
            setCurrentPage(page);
            setSidebarOpen(false);
          }}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          mobileOpen={sidebarOpen}
          setMobileOpen={setSidebarOpen}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onLogout={handleLogout} onOpenSidebar={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{renderPageContent()}</main>
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
