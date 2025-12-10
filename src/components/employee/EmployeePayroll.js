import { useEffect, useMemo, useState } from 'react';
import { DollarSign, TrendingUp, Download, Eye } from 'lucide-react';
import { getMyCurrentPayroll, getMyPayrollHistory, downloadPayslip } from '../../api/payrollApi';

export default function EmployeePayroll() {
  const [currentPayroll, setCurrentPayroll] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentUser = useMemo(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.id) {
        setError('Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const [curRes, histRes] = await Promise.all([
          getMyCurrentPayroll(currentUser.id),
          getMyPayrollHistory(currentUser.id, 6),
        ]);
        setCurrentPayroll(curRes.data);
        setHistory(histRes.data || []);
      } catch (err) {
        console.error('Lỗi tải dữ liệu lương:', err);
        setError('Không thể tải dữ liệu lương.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const handleDownloadCurrent = () => {
    if (!currentPayroll) return;
    downloadPayslip(currentPayroll);
  };

  const formatMoney = (v) => {
    if (v == null) return '0đ';
    const num = Number(v);
    if (Number.isNaN(num)) return `${v}đ`;
    return num.toLocaleString('vi-VN') + 'đ';
  };

  const monthLabel = currentPayroll
    ? `${String(currentPayroll.month).padStart(2, '0')}/${currentPayroll.year}`
    : '';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2">Lương & Thưởng</h1>
        <p className="text-gray-600">Thông tin lương, thưởng và phụ cấp</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-2 rounded border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Current Salary */}
      <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-lg shadow-lg p-8 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-white mb-2">
              {currentPayroll ? `Lương tháng ${monthLabel}` : 'Lương tháng hiện tại'}
            </h2>
            <div className="text-5xl mb-4">
              {currentPayroll ? formatMoney(currentPayroll.netSalary) : loading ? 'Đang tải...' : 'Chưa có dữ liệu'}
            </div>
            <div className="flex gap-4 text-sm text-green-100 flex-wrap">
              {/* Ngày công thực tế có thể nối từ Attendance sau */}
              <span>
                Ngày công: {/* placeholder */}
                --/--
              </span>
              <span>•</span>
              <span>
                Trạng thái: {
                  currentPayroll
                    ? currentPayroll.paymentStatus === 'PAID'
                      ? 'Đã chi trả'
                      : 'Chưa chi trả'
                    : 'Chưa có dữ liệu'
                }
              </span>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              className="bg-white text-green-700 px-6 py-3 rounded-lg hover:bg-green-50 transition flex items-center gap-2"
              disabled={!currentPayroll}
              onClick={() => {
                if (!currentPayroll) return;
                alert(
                  `Lương tháng ${monthLabel}\nLương cơ bản: ${formatMoney(
                    currentPayroll.basicSalary
                  )}\nPhụ cấp: ${formatMoney(
                    currentPayroll.allowances
                  )}\nThưởng: ${formatMoney(
                    currentPayroll.bonus
                  )}\nKhấu trừ: ${formatMoney(
                    currentPayroll.totalDeductions
                  )}\nThực nhận: ${formatMoney(currentPayroll.netSalary)}`
                );
              }}
            >
              <Eye size={20} />
              Xem chi tiết
            </button>
            <button
              className="bg-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/30 transition flex items-center gap-2 disabled:opacity-50"
              disabled={!currentPayroll}
              onClick={handleDownloadCurrent}
            >
              <Download size={20} />
              Tải về
            </button>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="mb-4 text-green-700">Thu nhập</h3>
          <div className="space-y-3">
            <SalaryItem
              label="Lương cơ bản"
              value={currentPayroll ? formatMoney(currentPayroll.basicSalary) : '--'}
            />
            <SalaryItem
              label="Phụ cấp"
              value={currentPayroll ? formatMoney(currentPayroll.allowances) : '--'}
            />
            <SalaryItem
              label="Tăng ca"
              value={currentPayroll ? formatMoney(currentPayroll.overtimePay) : '--'}
            />
            <SalaryItem
              label="Thưởng"
              value={currentPayroll ? formatMoney(currentPayroll.bonus) : '--'}
            />
            <div className="pt-3 border-t">
              <SalaryItem
                label="Tổng thu nhập"
                value={currentPayroll ? formatMoney(currentPayroll.grossSalary) : '--'}
                bold
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="mb-4 text-red-700">Khấu trừ</h3>
          <div className="space-y-3">
            <SalaryItem
              label="BHXH"
              value={currentPayroll ? formatMoney(currentPayroll.socialInsurance) : '--'}
            />
            <SalaryItem
              label="BHYT"
              value={currentPayroll ? formatMoney(currentPayroll.healthInsurance) : '--'}
            />
            <SalaryItem
              label="BHTN"
              value={currentPayroll ? formatMoney(currentPayroll.unemploymentInsurance) : '--'}
            />
            <SalaryItem
              label="Thuế TNCN"
              value={currentPayroll ? formatMoney(currentPayroll.personalIncomeTax) : '--'}
            />
            <SalaryItem
              label="Khác"
              value={currentPayroll ? formatMoney(currentPayroll.otherDeductions) : '--'}
            />
            <div className="pt-3 border-t">
              <SalaryItem
                label="Tổng khấu trừ"
                value={currentPayroll ? formatMoney(currentPayroll.totalDeductions) : '--'}
                bold
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="mb-4 text-blue-700">Thống kê</h3>
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-xs text-gray-600 mb-1">Lương thực nhận</div>
              <div className="text-2xl text-blue-700">
                {currentPayroll ? formatMoney(currentPayroll.netSalary) : '--'}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-xs text-gray-600 mb-1">Tăng ca tháng này</div>
              <div className="text-xl text-gray-800">{/* Có thể nối từ Attendance sau */}-- giờ</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-xs text-gray-600 mb-1">Trạng thái chi trả</div>
              <div className="text-xl text-green-700">
                {currentPayroll
                  ? currentPayroll.paymentStatus === 'PAID'
                    ? 'Đã chi trả'
                    : 'Chưa chi trả'
                  : '--'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="mb-4">Biểu đồ lương 6 tháng gần nhất</h3>
        <div className="h-64 flex items-end justify-around gap-4">
          {loading ? (
            <div className="text-gray-500 text-sm">Đang tải dữ liệu...</div>
          ) : (!history || history.length === 0) ? (
            <div className="text-gray-500 text-sm">Chưa có dữ liệu lịch sử lương.</div>
          ) : (
            history
              .slice()
              .reverse()
              .map((item, index) => {
                const value = Number(item.netSalary || 0);
                const max = Math.max(
                  ...history.map((h) => Number(h.netSalary || 0)),
                  1
                );
                const monthText = `${String(item.month).padStart(2, '0')}`;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="text-xs text-gray-600 font-medium">
                      {value > 0 ? (value / 1_000_000).toFixed(1) + 'tr' : '0tr'}
                    </div>
                    <div
                      className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg transition-all hover:from-green-700 hover:to-green-500 shadow-sm"
                      style={{ 
                        height: `${max > 0 ? Math.max((value / max) * 80, 15) : 15}%`,
                        minHeight: '30px'
                      }}
                    ></div>
                    <div className="text-xs text-gray-600 font-medium">T{monthText}</div>
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3>Lịch sử lương</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 text-xs text-gray-600">Tháng</th>
                <th className="text-left p-4 text-xs text-gray-600">Lương cơ bản</th>
                <th className="text-left p-4 text-xs text-gray-600">Phụ cấp</th>
                <th className="text-left p-4 text-xs text-gray-600">Thưởng</th>
                <th className="text-left p-4 text-xs text-gray-600">Khấu trừ</th>
                <th className="text-left p-4 text-xs text-gray-600">Thực nhận</th>
                <th className="text-left p-4 text-xs text-gray-600">Trạng thái</th>
                <th className="text-left p-4 text-xs text-gray-600">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-4 text-center text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : (history || []).length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-4 text-center text-gray-500">
                    Chưa có dữ liệu lịch sử lương.
                  </td>
                </tr>
              ) : (
                history.map((p, index) => {
                  const monthStr = `${String(p.month).padStart(2, '0')}/${p.year}`;
                  return (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-4 text-gray-700">{monthStr}</td>
                      <td className="p-4 text-gray-700">{formatMoney(p.basicSalary)}</td>
                      <td className="p-4 text-gray-700">{formatMoney(p.allowances)}</td>
                      <td className="p-4 text-green-700">{formatMoney(p.bonus)}</td>
                      <td className="p-4 text-red-700">{formatMoney(p.totalDeductions)}</td>
                      <td className="p-4 text-gray-900">{formatMoney(p.netSalary)}</td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${
                            p.paymentStatus === 'PAID'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {p.paymentStatus === 'PAID' ? 'Đã chi trả' : 'Chưa chi trả'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            onClick={() => {
                              alert(
                                `Lương tháng ${monthStr}\nLương cơ bản: ${formatMoney(
                                  p.basicSalary
                                )}\nPhụ cấp: ${formatMoney(p.allowances)}\nThưởng: ${formatMoney(
                                  p.bonus
                                )}\nKhấu trừ: ${formatMoney(
                                  p.totalDeductions
                                )}\nThực nhận: ${formatMoney(p.netSalary)}`
                              );
                            }}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                            onClick={() => downloadPayslip(p)}
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function SalaryItem({ label, value, bold = false }) {
  return (
    <div className={`flex justify-between ${bold ? '' : 'text-sm'}`}>
      <span className={bold ? 'text-gray-900' : 'text-gray-600'}>{label}</span>
      <span className={bold ? 'text-gray-900' : 'text-gray-700'}>{value}</span>
    </div>
  );
}
