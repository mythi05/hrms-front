import { useEffect, useMemo, useState } from 'react';
import { TrendingUp, Search, Filter, Calendar, DollarSign, CheckCircle2, XCircle, Edit2, Download } from 'lucide-react';
import axiosInstance from '../../api/axios';
import {
  adminCreateOrUpdatePayroll,
  adminGetPayrollByMonth,
  adminMarkPayrollPaid,
  adminMarkPayrollPending,
  downloadPayslip,
} from '../../api/payrollApi';

const MONTHS = [
  { value: 1, label: 'Tháng 1' },
  { value: 2, label: 'Tháng 2' },
  { value: 3, label: 'Tháng 3' },
  { value: 4, label: 'Tháng 4' },
  { value: 5, label: 'Tháng 5' },
  { value: 6, label: 'Tháng 6' },
  { value: 7, label: 'Tháng 7' },
  { value: 8, label: 'Tháng 8' },
  { value: 9, label: 'Tháng 9' },
  { value: 10, label: 'Tháng 10' },
  { value: 11, label: 'Tháng 11' },
  { value: 12, label: 'Tháng 12' },
];

export default function AdminPayrollPage() {
  const now = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [keyword, setKeyword] = useState('');
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // payroll đang chỉnh sửa

  const formatMoney = (v) => {
    if (v == null) return '0';
    const num = Number(v);
    if (Number.isNaN(num)) return String(v);
    return num.toLocaleString('vi-VN');
  };

  const exportPayrollCsv = () => {
    if (!payrolls || payrolls.length === 0) {
      alert('Không có dữ liệu lương để xuất.');
      return;
    }
    const headers = [
      'id','employeeId','employeeName','month','year','basicSalary','allowances','bonus','overtimePay',
      'socialInsurance','healthInsurance','unemploymentInsurance','personalIncomeTax','otherDeductions',
      'totalDeductions','netSalary','paymentStatus','paymentDate'
    ];
    const rows = filtered.map(p => [
      p.id,
      p.employeeId,
      p.employeeName || '',
      p.month,
      p.year,
      p.basicSalary ?? '',
      p.allowances ?? '',
      p.bonus ?? '',
      p.overtimePay ?? '',
      p.socialInsurance ?? '',
      p.healthInsurance ?? '',
      p.unemploymentInsurance ?? '',
      p.personalIncomeTax ?? '',
      p.otherDeductions ?? '',
      p.totalDeductions ?? '',
      p.netSalary ?? '',
      p.paymentStatus || '',
      p.paymentDate || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll-${month}-${year}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const importPayrollCsv = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') return;
        const lines = text.split(/\r?\n/).filter(l => l.trim());
        if (lines.length < 2) {
          alert('File không có dữ liệu.');
          return;
        }
        const header = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        const idx = (name) => header.indexOf(name);

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].match(/("[^"]*"|[^,]+)/g);
          if (!cols) continue;
          const val = (name) => {
            const j = idx(name);
            if (j === -1 || j >= cols.length) return '';
            return cols[j].replace(/^"|"$/g, '').replace(/""/g, '"').trim();
          };

          const payload = {
            employeeId: Number(val('employeeId')),
            month: Number(val('month') || month),
            year: Number(val('year') || year),
            basicSalary: Number(val('basicSalary') || 0),
            allowances: Number(val('allowances') || 0),
            bonus: Number(val('bonus') || 0),
            overtimePay: Number(val('overtimePay') || 0),
            socialInsurance: Number(val('socialInsurance') || 0),
            healthInsurance: Number(val('healthInsurance') || 0),
            unemploymentInsurance: Number(val('unemploymentInsurance') || 0),
            personalIncomeTax: Number(val('personalIncomeTax') || 0),
            otherDeductions: Number(val('otherDeductions') || 0),
            paymentStatus: val('paymentStatus') || 'PENDING',
          };

          await adminCreateOrUpdatePayroll(payload);
        }

        alert('Import bảng lương thành công.');
        loadData();
      } catch (err) {
        console.error('Lỗi import CSV bảng lương:', err);
        alert('Không thể import dữ liệu lương.');
      } finally {
        event.target.value = '';
      }
    };

    reader.readAsText(file, 'utf-8');
  };

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminGetPayrollByMonth(month, year);
      setPayrolls(res.data || []);
    } catch (err) {
      console.error('Lỗi tải dữ liệu lương:', err);
      setError('Không thể tải dữ liệu lương.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const filtered = payrolls.filter((p) => {
    if (!keyword.trim()) return true;
    const k = keyword.toLowerCase();
    return (
      (p.employeeName && p.employeeName.toLowerCase().includes(k)) ||
      (p.employeeId && String(p.employeeId).includes(k))
    );
  });

  const handleEdit = (p) => {
    setEditing({ ...p });
  };

  const handleNew = () => {
    setEditing({
      employeeId: '',
      month,
      year,
      basicSalary: '',
      allowances: '',
      bonus: '',
      overtimePay: '',
      socialInsurance: '',
      healthInsurance: '',
      unemploymentInsurance: '',
      personalIncomeTax: '',
      otherDeductions: '',
      paymentStatus: 'PENDING',
    });
  };

  const handleChangeField = (field, value) => {
    setEditing((prev) => ({ ...prev, [field]: value }));
  };

  // Hàm tự động tính lương dựa trên lương cơ bản và ngày đi muộn
  const handleAutoCalculate = async () => {
    if (!editing || !editing.employeeId || !editing.month || !editing.year) {
      alert('Vui lòng nhập Employee ID, Tháng, Năm để tự động tính lương.');
      return;
    }

    if (!editing.basicSalary || editing.basicSalary <= 0) {
      alert('Vui lòng nhập lương cơ bản để tự động tính toán.');
      return;
    }

    try {
      // Gọi API tính lương tự động bằng axiosInstance
      const response = await axiosInstance.get(`/payroll/admin/calculate`, {
        params: {
          employeeId: editing.employeeId,
          month: editing.month,
          year: editing.year,
          basicSalary: editing.basicSalary
        }
      });

      const calculatedData = response.data;
      setEditing({
        ...editing,
        ...calculatedData,
        employeeId: editing.employeeId,
        month: editing.month,
        year: editing.year,
        basicSalary: editing.basicSalary
      });
      alert('Đã tính toán tự động thành công!');
    } catch (err) {
      console.error('Lỗi tính toán tự động:', err);
      alert('Lỗi khi tính toán tự động. Vui lòng thử lại.');
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.employeeId || !editing.month || !editing.year) {
      alert('Vui lòng nhập đầy đủ Employee ID, Tháng, Năm.');
      return;
    }

    const payload = {
      ...editing,
      employeeId: Number(editing.employeeId),
      month: Number(editing.month),
      year: Number(editing.year),
      basicSalary: editing.basicSalary ? Number(editing.basicSalary) : 0,
      allowances: editing.allowances ? Number(editing.allowances) : 0,
      bonus: editing.bonus ? Number(editing.bonus) : 0,
      overtimePay: editing.overtimePay ? Number(editing.overtimePay) : 0,
      socialInsurance: editing.socialInsurance ? Number(editing.socialInsurance) : 0,
      healthInsurance: editing.healthInsurance ? Number(editing.healthInsurance) : 0,
      unemploymentInsurance: editing.unemploymentInsurance ? Number(editing.unemploymentInsurance) : 0,
      personalIncomeTax: editing.personalIncomeTax ? Number(editing.personalIncomeTax) : 0,
      otherDeductions: editing.otherDeductions ? Number(editing.otherDeductions) : 0,
    };

    try {
      await adminCreateOrUpdatePayroll(payload);
      setEditing(null);
      await loadData();
    } catch (err) {
      console.error('Lỗi lưu bảng lương:', err);
      alert('Không thể lưu bảng lương.');
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await adminMarkPayrollPaid(id);
      await loadData();
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái trả lương:', err);
      alert('Không thể cập nhật trạng thái.');
    }
  };

  const handleMarkPending = async (id) => {
    try {
      await adminMarkPayrollPending(id);
      await loadData();
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái trả lương:', err);
      alert('Không thể cập nhật trạng thái.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="mb-2">Quản lý lương nhân viên</h1>
          <p className="text-gray-600">Thiết lập và theo dõi bảng lương theo tháng cho từng nhân viên</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={exportPayrollCsv}
            className="px-4 py-2 rounded border text-sm flex items-center gap-2 hover:bg-gray-50"
          >
            Export CSV
          </button>
          <label className="px-4 py-2 rounded border text-sm flex items-center gap-2 hover:bg-gray-50 cursor-pointer">
            Import CSV
            <input type="file" accept=".csv" className="hidden" onChange={importPayrollCsv} />
          </label>
          <button
            onClick={handleNew}
            className="px-4 py-2 rounded bg-green-600 text-white text-sm flex items-center gap-2 hover:bg-green-700"
          >
            <DollarSign size={16} />
            Thêm bảng lương
          </button>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Tháng</label>
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-500" />
            <select
              className="border rounded px-3 py-1 text-sm"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Năm</label>
          <input
            type="number"
            className="border rounded px-3 py-1 text-sm w-24"
            value={year}
            onChange={(e) => setYear(Number(e.target.value) || year)}
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-gray-500 mb-1">Tìm theo tên hoặc ID nhân viên</label>
          <div className="flex items-center gap-2 border rounded px-3 py-1 text-sm bg-gray-50">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              className="flex-1 bg-transparent outline-none"
              placeholder="Nhập tên hoặc mã nhân viên..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 rounded border text-sm flex items-center gap-2 hover:bg-gray-50"
        >
          <Filter size={14} />
          Làm mới
        </button>
      </div>

      {/* Bảng lương */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex items-center justify-between">
          <h3>Bảng lương tháng {month}/{year}</h3>
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <TrendingUp size={14} />
            Tổng nhân viên: {filtered.length}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 text-xs text-gray-600">Nhân viên</th>
                <th className="text-left p-3 text-xs text-gray-600">Tháng/Năm</th>
                <th className="text-left p-3 text-xs text-gray-600">Lương cơ bản</th>
                <th className="text-left p-3 text-xs text-gray-600">Phụ cấp</th>
                <th className="text-left p-3 text-xs text-gray-600">Thưởng</th>
                <th className="text-left p-3 text-xs text-gray-600">Tổng khấu trừ</th>
                <th className="text-left p-3 text-xs text-gray-600">Thực nhận</th>
                <th className="text-left p-3 text-xs text-gray-600">Trạng thái</th>
                <th className="text-left p-3 text-xs text-gray-600">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-4 text-center text-gray-500 text-sm">Đang tải dữ liệu...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={9} className="p-4 text-center text-red-500 text-sm">{error}</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-4 text-center text-gray-500 text-sm">Chưa có dữ liệu lương cho tháng này.</td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const monthStr = `${String(p.month).padStart(2, '0')}/${p.year}`;
                  const paid = p.paymentStatus === 'PAID';
                  return (
                    <tr key={p.id} className="border-b hover:bg-gray-50 text-sm">
                      <td className="p-3">
                        <div className="font-medium text-gray-800">{p.employeeName || `#${p.employeeId}`}</div>
                        <div className="text-xs text-gray-500">ID: {p.employeeId}</div>
                      </td>
                      <td className="p-3 text-gray-700">{monthStr}</td>
                      <td className="p-3 text-gray-700">{formatMoney(p.basicSalary)}đ</td>
                      <td className="p-3 text-gray-700">{formatMoney(p.allowances)}đ</td>
                      <td className="p-3 text-green-700">{formatMoney(p.bonus)}đ</td>
                      <td className="p-3 text-red-700">{formatMoney(p.totalDeductions)}đ</td>
                      <td className="p-3 text-gray-900 font-semibold">{formatMoney(p.netSalary)}đ</td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                            paid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {paid ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                          <span>{paid ? 'Đã chi trả' : 'Chưa chi trả'}</span>
                        </span>
                      </td>
                      <td className="p-3 flex gap-2">
                        <button
                          className="p-1.5 rounded border text-xs flex items-center gap-1 hover:bg-gray-50"
                          onClick={() => handleEdit(p)}
                        >
                          <Edit2 size={14} />
                          Sửa
                        </button>
                        <button
                          className="p-1.5 rounded border text-xs flex items-center gap-1 hover:bg-gray-50"
                          onClick={() => downloadPayslip(p)}
                        >
                          <Download size={14} />
                          Phiếu lương
                        </button>
                        {paid ? (
                          <button
                            className="p-1.5 rounded border text-xs flex items-center gap-1 hover:bg-gray-50"
                            onClick={() => handleMarkPending(p.id)}
                          >
                            Đặt thành chưa trả
                          </button>
                        ) : (
                          <button
                            className="p-1.5 rounded border text-xs flex items-center gap-1 bg-green-600 text-white hover:bg-green-700"
                            onClick={() => handleMarkPaid(p.id)}
                          >
                            Đánh dấu đã trả
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal chỉnh sửa / tạo mới */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {editing.id ? 'Chỉnh sửa bảng lương' : 'Thêm bảng lương mới'}
              </h3>
              <button
                className="text-gray-500 hover:text-gray-700 text-sm"
                onClick={() => setEditing(null)}
              >
                Đóng
              </button>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Employee ID</label>
                <input
                  type="number"
                  className="border rounded px-3 py-1 w-full"
                  value={editing.employeeId}
                  onChange={(e) => handleChangeField('employeeId', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Tháng</label>
                <select
                  className="border rounded px-3 py-1 w-full"
                  value={editing.month}
                  onChange={(e) => handleChangeField('month', Number(e.target.value))}
                >
                  {MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Năm</label>
                <input
                  type="number"
                  className="border rounded px-3 py-1 w-full"
                  value={editing.year}
                  onChange={(e) => handleChangeField('year', Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Lương cơ bản</label>
                <input
                  type="number"
                  className="border rounded px-3 py-1 w-full"
                  value={editing.basicSalary}
                  onChange={(e) => handleChangeField('basicSalary', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Phụ cấp</label>
                <input
                  type="number"
                  className="border rounded px-3 py-1 w-full"
                  value={editing.allowances}
                  onChange={(e) => handleChangeField('allowances', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Thưởng</label>
                <input
                  type="number"
                  className="border rounded px-3 py-1 w-full"
                  value={editing.bonus}
                  onChange={(e) => handleChangeField('bonus', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Tăng ca</label>
                <input
                  type="number"
                  className="border rounded px-3 py-1 w-full"
                  value={editing.overtimePay}
                  onChange={(e) => handleChangeField('overtimePay', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">BHXH</label>
                <input
                  type="number"
                  className="border rounded px-3 py-1 w-full"
                  value={editing.socialInsurance}
                  onChange={(e) => handleChangeField('socialInsurance', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">BHYT</label>
                <input
                  type="number"
                  className="border rounded px-3 py-1 w-full"
                  value={editing.healthInsurance}
                  onChange={(e) => handleChangeField('healthInsurance', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">BHTN</label>
                <input
                  type="number"
                  className="border rounded px-3 py-1 w-full"
                  value={editing.unemploymentInsurance}
                  onChange={(e) => handleChangeField('unemploymentInsurance', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Thuế TNCN</label>
                <input
                  type="number"
                  className="border rounded px-3 py-1 w-full"
                  value={editing.personalIncomeTax}
                  onChange={(e) => handleChangeField('personalIncomeTax', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Khấu trừ khác</label>
                <input
                  type="number"
                  className="border rounded px-3 py-1 w-full"
                  value={editing.otherDeductions}
                  onChange={(e) => handleChangeField('otherDeductions', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1 font-semibold text-green-600">Lương nhận được</label>
                <input
                  type="number"
                  className="border rounded px-3 py-1 w-full bg-green-50 font-semibold"
                  value={editing.netSalary || ''}
                  readOnly
                  placeholder="Sau khi tính toán tự động"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Trạng thái chi trả</label>
                <select
                  className="border rounded px-3 py-1 w-full"
                  value={editing.paymentStatus}
                  onChange={(e) => handleChangeField('paymentStatus', e.target.value)}
                >
                  <option value="PENDING">Chưa chi trả</option>
                  <option value="PAID">Đã chi trả</option>
                </select>
              </div>
            </div>
            <div className="p-4 border-t flex items-center justify-end gap-2">
              <button
                className="px-4 py-2 rounded border text-sm hover:bg-gray-50"
                onClick={() => setEditing(null)}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 mr-2"
                onClick={handleAutoCalculate}
              >
                Tự động tính
              </button>
              <button
                className="px-4 py-2 rounded bg-green-600 text-white text-sm hover:bg-green-700"
                onClick={handleSave}
              >
                Lưu bảng lương
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
