import React, { useEffect, useRef, useState } from 'react';
import { Clock, Calendar, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { 
  checkIn,
  checkOut,
  getTodayAttendance,
  getAttendanceOfMonth,
  scanAttendanceQR,
  formatAttendanceRecords
} from '../../../api/attendanceApi';

export default function EmployeeAttendance() {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('vi-VN'));
  const [today, setToday] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ weeklyHours: '0h', onTime: '0/0', lateCount: '0', overtime: '0h' });
  const [loading, setLoading] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [showQRScanner, setShowQRScanner] = useState(false);
  const [qrManualCode, setQrManualCode] = useState('');
  const [qrScanLoading, setQrScanLoading] = useState(false);
  const [qrError, setQrError] = useState('');

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanTimerRef = useRef(null);

  const employeeId = (() => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return null;
      const u = JSON.parse(raw);
      return u.id || null;
    } catch {
      return null;
    }
  })();

  // Đồng hồ realtime
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString('vi-VN')), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    if (!employeeId) return;
    setLoading(true);
    try {
      const [todayRes, historyRes] = await Promise.all([
        getTodayAttendance(employeeId).catch(() => ({ data: null })),
        getAttendanceOfMonth(employeeId, selectedMonth, selectedYear).catch(() => ({ data: [] }))
      ]);

      const rawHistory = historyRes.data || [];
      setToday(todayRes.data || null);
      setHistory(formatAttendanceRecords(rawHistory));

      // Tính thống kê 7 ngày gần nhất từ dữ liệu thật
      const now = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 6);

      let totalMinutes = 0;
      let onTimeDays = 0;
      let workDays = 0;
      let lateDays = 0;

      rawHistory.forEach(r => {
        if (!r.date) return;
        const d = new Date(r.date);
        if (isNaN(d.getTime())) return;
        if (d < sevenDaysAgo || d > now) return;

        if (r.totalHours) {
          const num = typeof r.totalHours === 'number' ? r.totalHours : parseFloat(r.totalHours);
          if (!isNaN(num)) totalMinutes += num * 60;
        }

        if (r.status === 'PRESENT' || r.status === 'LATE') {
          workDays++;
          if (r.status === 'PRESENT') onTimeDays++;
          if (r.status === 'LATE') lateDays++;
        }
      });

      const weeklyHours = (totalMinutes / 60).toFixed(2) + 'h';
      const onTime = `${onTimeDays}/${workDays || 0}`;
      const lateCount = String(lateDays);

      // Tạm thời chưa tính OT thật, để 0h
      setStats({ weeklyHours, onTime, lateCount, overtime: '0h' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId, selectedMonth, selectedYear]);

  useEffect(() => {
    if (!showQRScanner) {
      stopCamera();
      setQrManualCode('');
      setQrError('');
      setQrScanLoading(false);
      return;
    }

    const supported = typeof window !== 'undefined' && 'BarcodeDetector' in window;
    if (supported) {
      startCamera();
    }

    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showQRScanner]);

  const handleCheckIn = async () => {
    if (!employeeId) {
      alert('Không tìm thấy thông tin nhân viên (user.id). Vui lòng đăng nhập lại.');
      return;
    }
    try {
      await checkIn(employeeId);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data || 'Không thể check-in');
    }
  };

  const handleCheckOut = async () => {
    if (!employeeId) {
      alert('Không tìm thấy thông tin nhân viên (user.id). Vui lòng đăng nhập lại.');
      return;
    }
    try {
      await checkOut(employeeId);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data || 'Không thể check-out');
    }
  };

  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : '—');

  const stopCamera = () => {
    try {
      if (scanTimerRef.current) {
        clearInterval(scanTimerRef.current);
        scanTimerRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    } catch {
    }
  };

  const startCamera = async () => {
    setQrError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const detector = new window.BarcodeDetector({ formats: ['qr_code'] });

      scanTimerRef.current = setInterval(async () => {
        if (!videoRef.current) return;
        if (qrScanLoading) return;
        if (videoRef.current.readyState < 2) return;

        try {
          const barcodes = await detector.detect(videoRef.current);
          const value = barcodes && barcodes[0] ? barcodes[0].rawValue : '';
          if (value) {
            stopCamera();
            await submitScan(value);
          }
        } catch {
        }
      }, 500);
    } catch (err) {
      setQrError('Không thể mở camera. Vui lòng cấp quyền camera hoặc nhập mã QR thủ công.');
    }
  };

  const formatScanMessage = (resp) => {
    const scanType = resp?.scanType;
    const checkTime = resp?.checkTime;
    const shift = resp?.shiftType;

    if (scanType === 'CHECK_IN') {
      return `✅ ${resp.message}\nGiờ vào: ${checkTime || '--:--'}\nCa: ${shift || ''}`;
    }
    if (scanType === 'CHECK_OUT') {
      return `⏰ ${resp.message}\nGiờ ra: ${checkTime || '--:--'}\nCa: ${shift || ''}`;
    }
    return resp?.message || 'Không có dữ liệu phản hồi';
  };

  const submitScan = async (qrCode) => {
    if (!qrCode) {
      setQrError('Vui lòng nhập mã QR.');
      return;
    }
    setQrScanLoading(true);
    setQrError('');
    try {
      const res = await scanAttendanceQR({
        qrCode,
        userAgent: navigator.userAgent,
      });

      alert(formatScanMessage(res.data));
      setShowQRScanner(false);
      await loadData();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.response?.data || 'Quét QR thất bại';
      setQrError(String(msg));
    } finally {
      setQrScanLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="mb-1 text-xl sm:text-2xl font-bold">Chấm công</h1>
        <p className="text-gray-600 text-sm sm:text-base">Quản lý thời gian làm việc của bạn</p>
      </div>

      <QRScannerModal
        open={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        videoRef={videoRef}
        qrManualCode={qrManualCode}
        setQrManualCode={setQrManualCode}
        onSubmit={submitScan}
        loading={qrScanLoading}
        error={qrError}
      />

      {/* Chấm công vào/ra */}
      <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-lg shadow-lg p-4 sm:p-6 md:p-8 text-white">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 sm:gap-3 mb-4">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8" />
              <div>
                <h2 className="text-white text-sm sm:text-base md:text-lg">Chấm công hôm nay</h2>
                <p className="text-green-100 text-xs sm:text-sm">{new Date().toLocaleDateString('vi-VN')}</p>
              </div>
            </div>

            <div className="text-3xl sm:text-4xl md:text-6xl mb-4">{currentTime}</div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <button
                className="bg-white text-green-700 px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg hover:bg-green-50 transition text-xs sm:text-sm w-full sm:w-auto"
                onClick={handleCheckIn}
                disabled={loading}
              >
                Chấm công vào
              </button>
              <button
                className="bg-white/20 text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg hover:bg-white/30 transition text-xs sm:text-sm w-full sm:w-auto"
                onClick={handleCheckOut}
                disabled={loading}
              >
                Chấm công ra
              </button>

              <button
                className="bg-white/10 text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg hover:bg-white/20 transition text-xs sm:text-sm w-full sm:w-auto"
                onClick={() => setShowQRScanner(true)}
                disabled={loading}
              >
                Quét QR
              </button>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="bg-white/10 rounded-lg p-3 sm:p-4">
              <div className="text-green-100 text-xs sm:text-sm mb-1">Giờ vào</div>
              <div className="text-lg sm:text-xl md:text-2xl">{today?.checkIn || '--:--'}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 sm:p-4">
              <div className="text-green-100 text-xs sm:text-sm mb-1">Giờ ra</div>
              <div className="text-lg sm:text-xl md:text-2xl">{today?.checkOut || '--:--'}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 sm:p-4">
              <div className="text-green-100 text-xs sm:text-sm mb-1">Tổng giờ</div>
              <div className="text-lg sm:text-xl md:text-2xl">{today?.totalHours ?? '0h'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title="Giờ làm tuần này" value={stats.weeklyHours} color="blue" icon={Clock} />
        <StatCard title="Đúng giờ" value={stats.onTime} color="green" icon={CheckCircle} />
        <StatCard title="Đi muộn" value={stats.lateCount} color="red" icon={XCircle} />
        <StatCard title="Tăng ca" value={stats.overtime} color="purple" icon={TrendingUp} />
      </div>

      {/* History */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 sm:p-6 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-sm sm:text-base">Lịch sử chấm công</h3>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm w-full sm:w-auto"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              disabled={loading}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
              ))}
            </select>
            <select
              className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm w-full sm:w-auto"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              disabled={loading}
            >
              {Array.from({ length: 5 }, (_, i) => {
                const y = new Date().getFullYear() - i;
                return (
                  <option key={y} value={y}>{y}</option>
                );
              })}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[720px] sm:min-w-0 sm:w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-2 sm:p-4 text-xs text-gray-600">Ngày</th>
                <th className="text-left p-2 sm:p-4 text-xs text-gray-600 hidden sm:table-cell">Giờ vào</th>
                <th className="text-left p-2 sm:p-4 text-xs text-gray-600 hidden sm:table-cell">Giờ ra</th>
                <th className="text-left p-2 sm:p-4 text-xs text-gray-600 hidden md:table-cell">Tổng giờ</th>
                <th className="text-left p-2 sm:p-4 text-xs text-gray-600">Trạng thái</th>
                <th className="text-left p-2 sm:p-4 text-xs text-gray-600 hidden lg:table-cell">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-500">Không có lịch sử chấm công.</td>
                </tr>
              ) : (
                history.map((record, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2 sm:p-4 text-gray-700 text-xs sm:text-sm">{record.date}</td>
                    <td className="p-2 sm:p-4 text-gray-700 text-xs sm:text-sm hidden sm:table-cell">{record.checkIn || '--:--'}</td>
                    <td className="p-2 sm:p-4 text-gray-700 text-xs sm:text-sm hidden sm:table-cell">{record.checkOut || '--:--'}</td>
                    <td className="p-2 sm:p-4 text-gray-700 text-xs sm:text-sm hidden md:table-cell">{record.totalHours ?? '0h'}</td>
                    <td className="p-2 sm:p-4">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        record.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                        record.status === 'LATE' ? 'bg-red-100 text-red-700' :
                        record.status === 'LEAVE' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="p-2 sm:p-4 text-gray-500 text-xs sm:text-sm hidden lg:table-cell">{record.note}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function QRScannerModal({
  open,
  onClose,
  videoRef,
  qrManualCode,
  setQrManualCode,
  onSubmit,
  loading,
  error,
}) {
  if (!open) return null;

  const supported = typeof window !== 'undefined' && 'BarcodeDetector' in window;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full h-[90vh] sm:h-auto sm:max-h-[90vh] sm:max-w-lg rounded-t-xl sm:rounded-xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-4 sm:px-6 py-4 border-b flex items-center justify-between shrink-0">
          <h3 className="text-gray-900">Quét QR chấm công</h3>
          <button className="px-3 py-1 rounded-lg border" onClick={onClose} disabled={loading}>Đóng</button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {supported ? (
            <div className="w-full rounded-lg overflow-hidden bg-black">
              <video
                ref={videoRef}
                className="w-full aspect-square sm:aspect-video max-h-[45vh] object-cover"
                playsInline
                muted
              />
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              Trình duyệt của bạn chưa hỗ trợ quét QR trực tiếp. Vui lòng nhập mã QR thủ công.
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm text-gray-700">Mã QR (nhập thủ công nếu cần)</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={qrManualCode}
              onChange={(e) => setQrManualCode(e.target.value)}
              placeholder="Dán/nhập mã QR..."
              disabled={loading}
            />
          </div>

          {error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : null}

          <div className="flex gap-3 justify-end">
            <button
              className="px-4 py-2 rounded-lg border"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-green-600 text-white disabled:opacity-60"
              onClick={() => onSubmit(qrManualCode)}
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Gửi mã QR'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color, icon: Icon }) {
  const colors = {
    blue: 'border-blue-500 bg-blue-50',
    green: 'border-green-500 bg-green-50',
    red: 'border-red-500 bg-red-50',
    purple: 'border-purple-500 bg-purple-50',
  };

  return (
    <div className={`bg-white rounded-lg shadow p-4 border-l-4 ${colors[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <Icon size={20} className="text-gray-400" />
      </div>
      <div className="text-2xl text-gray-900 mb-1">{value}</div>
      <div className="text-xs text-gray-600">{title}</div>
    </div>
  );
}
