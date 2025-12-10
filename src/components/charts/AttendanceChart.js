import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function AttendanceChart({ attendanceData = {} }) {
  // Process attendance data to chart format
  const processAttendanceData = () => {
    const dateMap = new Map();
    
    // Iterate through all employees' attendance data
    Object.entries(attendanceData).forEach(([employeeId, records]) => {
      records.forEach(record => {
        const date = record.date ? new Date(record.date).toLocaleDateString('vi-VN', { 
          day: '2-digit', 
          month: '2-digit' 
        }) : 'Unknown';
        
        if (!dateMap.has(date)) {
          dateMap.set(date, { date, present: 0, absent: 0, late: 0, leave: 0 });
        }
        
        const dayData = dateMap.get(date);
        if (record.status === 'PRESENT') {
          dayData.present++;
        } else if (record.status === 'LATE') {
          dayData.late++;
        } else if (record.status === 'ABSENT') {
          dayData.absent++;
        } else if (record.status === 'LEAVE') {
          dayData.leave++;
        }
      });
    });
    
    return Array.from(dateMap.values()).sort((a, b) => {
      const dateA = new Date(a.date.split('/').reverse().join('-'));
      const dateB = new Date(b.date.split('/').reverse().join('-'));
      return dateA - dateB;
    });
  };

  const chartData = processAttendanceData();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="mb-4">Thống kê chấm công (tháng {new Date().getMonth() + 1})</h3>
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 text-sm">Chưa có dữ liệu chấm công</div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                `${value} người`,
                name === 'present' ? 'Đi làm' :
                name === 'late' ? 'Đi muộn' :
                name === 'absent' ? 'Vắng mặt' : 'Nghỉ phép'
              ]} 
            />
            <Bar dataKey="present" fill="#10b981" name="present" />
            <Bar dataKey="late" fill="#f59e0b" name="late" />
            <Bar dataKey="leave" fill="#3b82f6" name="leave" />
            <Bar dataKey="absent" fill="#ef4444" name="absent" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
