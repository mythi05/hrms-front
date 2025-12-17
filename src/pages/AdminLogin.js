import React, { useState } from 'react';
import { Lock, User, LogIn, Shield, Users } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "./index3.css";

export default function AdminLogin() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await axios.post('https://app-f9bfc784-6639-4f0e-919c-b5ed407f3a5b.cleverapps.io/api/auth/login', form);

      // Kiểm tra role: cho phép ADMIN hoặc HR truy cập Admin portal
      if (!res.data.user || (res.data.user.role !== 'ADMIN' && res.data.user.role !== 'HR')) {
        setError('Bạn không có quyền truy cập Admin portal');
        setIsLoading(false);
        return;
      }

      // Lưu token và thông tin user
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      navigate('/admin'); // redirect vào Admin portal
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        setError('Sai tài khoản hoặc mật khẩu!');
      } else {
        setError('Lỗi kết nối server!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Login card */}
      <div className="relative bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl w-full max-w-md overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
        
        <div className="p-8 sm:p-12">
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 transform hover:scale-105 transition-transform">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-center text-gray-800 mb-2">Admin Login</h2>
            <p className="text-gray-500 text-center">Mời bạn đăng nhập!</p>
                        <p className="text-gray-500 text-center">user name: admin </p>
 
                        <p className="text-gray-500 text-center">password: admin123 </p>

</div>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <label className="block text-gray-700 mb-2">Tên đăng nhập</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="username"
                  placeholder="Nhập tên đăng nhập"
                  value={form.username}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-gray-700 mb-2">Mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="password"
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Đăng nhập</span>
                </>
              )}
            </button>

            {/* Đăng nhập nhân viên */}
            <div className="flex items-center justify-center mt-6">
              <button
                type="button"
                onClick={() => navigate("/employee/login")}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transform hover:scale-[1.03] transition-all shadow-md hover:shadow-lg"
              >
                <Users className="w-4 h-4" />
                <span>Đăng nhập nhân viên</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
