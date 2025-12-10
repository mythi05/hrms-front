import React, { useState } from 'react';
import { 
  exportAttendanceToExcel, 
  importAttendanceFromExcel, 
  downloadAttendanceTemplate 
} from '../../api/attendanceApi';

const AttendanceImportExport = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const showMessage = (msg, type = 'success') => {
    // Ensure msg is always a string
    const messageString = typeof msg === 'string' ? msg : 
                         msg?.message || 
                         JSON.stringify(msg) || 
                         'Unknown error';
    setMessage(messageString);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  // Export attendance
  const handleExport = async (params = {}) => {
    setLoading(true);
    try {
      const response = await exportAttendanceToExcel(params);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or create default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'cham_cong.xlsx';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showMessage('Export file thành công!', 'success');
    } catch (error) {
      console.error('Export error:', error);
      showMessage('Export file thất bại!', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Download template
  const handleDownloadTemplate = async () => {
    setLoading(true);
    try {
      const response = await downloadAttendanceTemplate();
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'template_cham_cong.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showMessage('Download template thành công!', 'success');
    } catch (error) {
      console.error('Template download error:', error);
      showMessage('Download template thất bại!', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Import attendance
  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      showMessage('Chỉ chấp nhận file Excel (.xlsx, .xls) hoặc CSV (.csv)', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await importAttendanceFromExcel(file);
      
      if (response.data) {
        const { imported, total } = response.data;
        showMessage(`Import thành công ${imported}/${total} bản ghi!`, 'success');
      } else {
        showMessage('Import thành công!', 'success');
      }
      
      // Reset file input
      event.target.value = '';
      
      // Trigger refresh
      window.location.reload();
      
    } catch (error) {
      console.error('Import error:', error);
      const errorMessage = error.response?.data || 'Import file thất bại!';
      showMessage(errorMessage, 'error');
      
      // Reset file input
      event.target.value = '';
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h5 className="text-xl font-semibold text-white">Import/Export Chấm Công</h5>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        {message && (
          <div className={`alert alert-${messageType} alert-dismissible fade show mb-4`} role="alert">
            {typeof message === 'string' ? message : JSON.stringify(message)}
            <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
          </div>
        )}

        {/* Export Section */}
        <div className="mb-6">
          <h6 className="text-lg font-semibold text-gray-800 mb-3">Export Dữ Liệu Chấm Công</h6>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex flex-wrap gap-3">
              <button 
                className="btn btn-primary px-4 py-2"
                onClick={() => handleExport()}
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                ) : (
                  ''
                )}
                Export Tất Cả
              </button>
              
              <button 
                className="btn btn-info px-4 py-2"
                onClick={() => {
                  const currentMonth = new Date().getMonth() + 1;
                  const currentYear = new Date().getFullYear();
                  handleExport({ month: currentMonth, year: currentYear });
                }}
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                ) : (
                  ''
                )}
                Export Tháng Này
              </button>
            </div>
          </div>
        </div>

        {/* Import Section */}
        <div className="mb-6">
          <h6 className="text-lg font-semibold text-gray-800 mb-3">Import Dữ Liệu Chấm Công</h6>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="row align-items-center">
              <div className="col-md-8">
                <div className="input-group">
                  <input 
                    type="file" 
                    className="form-control" 
                    accept=".xlsx,.xls,.csv"
                    onChange={handleImport}
                    disabled={loading}
                    placeholder="Chọn file Excel..."
                  />
                  <button 
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={handleDownloadTemplate}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                      'Template'
                    )}
                  </button>
                </div>
                <small className="text-muted mt-2 d-block">
                  Chỉ chấp nhận file Excel (.xlsx, .xls) hoặc CSV (.csv)
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div>
            <h6 className="text-blue-800 font-semibold mb-2">Hướng dẫn sử dụng:</h6>
            <ol className="text-blue-700 mb-0 ps-3">
              <li className="mb-1">Download template để xem cấu trúc file</li>
              <li className="mb-1">Điền dữ liệu vào file Excel theo đúng định dạng</li>
              <li className="mb-1">Chọn file và click Import</li>
              <li>Sử dụng Export để xuất dữ liệu ra Excel</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceImportExport;
