import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  let token = localStorage.getItem("token");
  if (typeof token === "string") token = token.trim();
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();

  // Chưa đăng nhập
  if (!token || token === "undefined" || token === "null") {
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
