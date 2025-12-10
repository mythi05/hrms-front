import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function PayrollTrendChart({ data = [] }) {
  const chartData = data.length > 0 ? data : [];

  const formatMoney = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}tr`;
    }
    return `${value.toLocaleString('vi-VN')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="mb-4">Xu hướng lương 6 tháng gần nhất</h3>
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 text-sm">Chưa có dữ liệu lương</div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={formatMoney} />
            <Tooltip 
              formatter={(value) => [formatMoney(value), 'Lương thực nhận']}
              labelFormatter={(label) => `Tháng ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="netSalary" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
