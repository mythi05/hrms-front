import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Calendar, Briefcase, FileText, Edit2, Shield } from "lucide-react";
import axiosInstance from "../../api/axios";

export default function EmployeeProfile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("/employees/me"); // gọi API /me
        setProfile(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          alert("Bạn chưa đăng nhập hoặc token hết hạn. Vui lòng đăng nhập lại.");
          window.location.href = "/login"; // redirect về login
        } else {
          console.error("Lỗi khi lấy profile:", err);
        }
      }
    };
    fetchProfile();
  }, []);

  if (!profile) {
    return <div className="text-center py-20">Đang tải thông tin...</div>;
  }

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("vi-VN") : "—";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2">Hồ sơ của tôi</h1>
          <p className="text-gray-600">Thông tin cá nhân và công việc</p>
        </div>
      
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={64} className="text-white" />
          </div>
          <h2 className="mb-2">{profile.fullName}</h2>
          <p className="text-gray-600 mb-1">{profile.position}</p>
          <p className="text-xs text-gray-500 mb-1">Mã NV: {profile.employeeCode}</p>
          <p className="text-xs text-gray-500">Tài khoản: {profile.username} ({profile.role || "EMPLOYEE"})</p>

          <div className="mt-6 pt-6 border-t">
            <div className="flex justify-around text-center">
              <div>
                <div className="text-gray-900">{profile.experienceYears || 0} năm</div>
                <div className="text-xs text-gray-500">Kinh nghiệm</div>
              </div>
              <div>
                <div className="text-gray-900">{profile.grade || "—"}</div>
                <div className="text-xs text-gray-500">Xếp loại</div>
              </div>
              <div>
                <div className="text-gray-900">{profile.performanceRate || 0}%</div>
                <div className="text-xs text-gray-500">Hiệu suất</div>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="mb-4">Thông tin cá nhân</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem icon={User} label="Họ và tên" value={profile.fullName} />
              <InfoItem icon={Calendar} label="Ngày sinh" value={fmtDate(profile.dob)} />
              <InfoItem icon={Mail} label="Email" value={profile.email} />
              <InfoItem icon={Phone} label="Số điện thoại" value={profile.phone} />
              <InfoItem icon={MapPin} label="Địa chỉ" value={profile.address} />
            </div>
          </div>

          {/* Work Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="mb-4">Thông tin công việc</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem icon={Briefcase} label="Chức vụ" value={profile.position} />
              <InfoItem icon={User} label="Phòng ban" value={profile.department} />
              <InfoItem icon={Calendar} label="Ngày vào làm" value={fmtDate(profile.startDate)} />
              <InfoItem icon={User} label="Quản lý trực tiếp" value={profile.managerName} />
              <InfoItem icon={FileText} label="Loại hợp đồng" value={profile.contractType} />
              <InfoItem icon={Calendar} label="Hết hạn HĐ" value={fmtDate(profile.contractEndDate)} />
              <InfoItem icon={Shield} label="Lương (VNĐ)" value={profile.salary != null ? profile.salary.toLocaleString("vi-VN") + " đ" : "—"} />
            </div>
          </div>

          {/* Skills & Certificates */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="mb-4">Kỹ năng & Chứng chỉ</h3>
            <div className="space-y-3">
              {(profile.skills || []).map((skill, idx) => (
                <SkillItem key={idx} name={skill.name} level={skill.level} />
              ))}
            </div>

            <div className="mt-6 pt-6 border-t">
              <h4 className="text-gray-700 mb-3">Chứng chỉ</h4>
              <div className="space-y-2">
                {(profile.certificates || []).map((cert, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">{cert}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Component con
function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
      <Icon size={20} className="text-gray-400 mt-0.5" />
      <div className="flex-1">
        <div className="text-xs text-gray-500 mb-1">{label}</div>
        <div className="text-gray-800">{value || "—"}</div>
      </div>
    </div>
  );
}

function SkillItem({ name, level }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-700">{name}</span>
        <span className="text-gray-500">{level}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-green-500 to-green-700 h-2 rounded-full transition-all"
          style={{ width: `${level}%` }}
        ></div>
      </div>
    </div>
  );
}
