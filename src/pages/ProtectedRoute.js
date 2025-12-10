import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Chưa đăng nhập
  if (!token) {
    return <Navigate to={role === "ADMIN" ? "/admin/login" : "/login"} replace />;
  }

  // Các route admin: cho phép cả ADMIN và HR
  if (role === "ADMIN") {
    if (user.role !== "ADMIN" && user.role !== "HR") {
      return <Navigate to="/admin/login" replace />;
    }
  } else if (role && user.role !== role) {
    // Các role khác (ví dụ EMPLOYEE) vẫn check đúng role
    return <Navigate to={role === "ADMIN" ? "/admin/login" : "/login"} replace />;
  }

  return children;
}
