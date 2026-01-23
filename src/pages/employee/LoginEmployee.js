import React, { useState, useEffect } from "react";
import { User, Lock, Shield } from "lucide-react";
import axiosInstance from "../../api/axios";
import { useNavigate } from "react-router-dom";
import "./index6.css";

export default function LoginEmployee() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Clear localStorage on mount to ensure fresh login (avoid expired token errors)
  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axiosInstance.post("/auth/login", form);

      if (res.data.user.role !== "EMPLOYEE") {
        setError("Bạn không có quyền truy cập Employee portal");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/employee");
    } catch (err) {
      setError(
        err.response?.data?.error || "Đăng nhập thất bại, vui lòng thử lại"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-scope">
      <div className="login-container">
        {/* LEFT PANEL */}
        <div className="login-left">
          <div>
            <div className="brand">
              <div className="brand-logo">HR</div>
              <div className="brand-text">
                <h1>HR Management</h1>
                <p>Hệ thống quản lý nhân sự</p>
              </div>
            </div>

            <h2 className="left-title">
              Quản lý nhân sự <br /> thông minh và hiệu quả
            </h2>

            <p className="left-desc">
              Nền tảng toàn diện cho việc quản lý và phát triển nguồn nhân lực
              doanh nghiệp
            </p>

            <div className="feature">
              <div className="feature-icon">👤</div>
              <div className="feature-text">
                <h4>Quản lý nhân viên</h4>
                <p>Theo dõi thông tin và hiệu suất làm việc</p>
              </div>
            </div>

            <div className="feature">
              <div className="feature-icon">⏱</div>
              <div className="feature-text">
                <h4>Chấm công tự động</h4>
                <p>Chính xác, minh bạch theo thời gian thực</p>
              </div>
            </div>

            <div className="feature">
              <div className="feature-icon">📊</div>
              <div className="feature-text">
                <h4>Báo cáo & phân tích</h4>
                <p>Dữ liệu realtime và insights</p>
              </div>
            </div>
          </div>

          <div className="copyright">
            © 2025 HR Management System. All rights reserved.
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="login-right">
          <div className="login-box">
            <h2>Đăng nhập</h2>
            <p className="subtitle">Đăng nhập vào hệ thống để tiếp tục</p>

            <div className="demo-box">
              <strong>Tài khoản demo</strong>
              <br />
              Username: <b>anguyen</b>
              <br />
              Password: <b>123456</b>
            </div>

            {error && <div className="error-text">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tên đăng nhập</label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    name="username"
                    placeholder="Nhập tên đăng nhập"
                    value={form.username}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Mật khẩu</label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <Lock size={18} />
                  </span>
                  <input
                    type="password"
                    name="password"
                    placeholder="Nhập mật khẩu"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button className="btn-login" type="submit" disabled={loading}>
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>

            <div className="divider">
              <span>Hoặc</span>
            </div>

            <button
              className="btn-admin"
              onClick={() => navigate("/admin/login")}
            >
              <Shield size={16} style={{ marginRight: 6 }} />
              Đăng nhập quản trị
            </button>

            <div className="support-text">
              Cần hỗ trợ? <span>Liên hệ IT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
