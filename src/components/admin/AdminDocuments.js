import React, { useState } from 'react';
import '../../styles/documents.css';

export const AdminDocuments = () => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const documents = [
    { id: '1', name: 'Quy chế làm việc 2024.pdf', type: 'pdf', size: '2.5 MB', date: '20/12/2024', category: 'company', uploadedBy: 'Admin', isNew: true },
    { id: '2', name: 'Hợp đồng lao động mẫu.docx', type: 'word', size: '1.2 MB', date: '18/12/2024', category: 'hr', uploadedBy: 'HR Manager' },
    { id: '3', name: 'Bảng lương tháng 12.xlsx', type: 'excel', size: '3.8 MB', date: '15/12/2024', category: 'finance', uploadedBy: 'Kế toán', isImportant: true },
    { id: '4', name: 'Tài liệu đào tạo nhân viên mới', type: 'folder', size: '15 files', date: '10/12/2024', category: 'training', uploadedBy: 'Admin' },
    { id: '5', name: 'Chính sách phúc lợi.pdf', type: 'pdf', size: '1.8 MB', date: '05/12/2024', category: 'policies', uploadedBy: 'HR Manager' },
    { id: '6', name: 'Logo công ty.png', type: 'image', size: '450 KB', date: '01/12/2024', category: 'company', uploadedBy: 'Marketing' },
    { id: '7', name: 'Báo cáo tài chính Q4.xlsx', type: 'excel', size: '4.2 MB', date: '28/11/2024', category: 'finance', uploadedBy: 'Kế toán', isImportant: true },
    { id: '8', name: 'Quy trình tuyển dụng.docx', type: 'word', size: '980 KB', date: '25/11/2024', category: 'hr', uploadedBy: 'HR Manager' },
  ];

  const categories = [
    { id: 'all', name: 'Tất cả tài liệu', icon: '📁', count: documents.length },
    { id: 'company', name: 'Công ty', icon: '🏢', count: documents.filter(d => d.category === 'company').length },
    { id: 'hr', name: 'Nhân sự', icon: '👥', count: documents.filter(d => d.category === 'hr').length },
    { id: 'finance', name: 'Tài chính', icon: '💰', count: documents.filter(d => d.category === 'finance').length },
    { id: 'training', name: 'Đào tạo', icon: '📚', count: documents.filter(d => d.category === 'training').length },
    { id: 'policies', name: 'Chính sách', icon: '📋', count: documents.filter(d => d.category === 'policies').length },
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = activeCategory === 'all' || doc.category === activeCategory;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getDocumentIcon = (type) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'word': return '📝';
      case 'excel': return '📊';
      case 'image': return '🖼️';
      case 'folder': return '📁';
      default: return '📄';
    }
  };

  return (
    <div className="documents-container">
      <div className="documents-header">
        <h1>Quản lý tài liệu</h1>

        <div className="header-actions">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm tài liệu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button className="upload-btn">
            <span>⬆️</span>
            <span>Tải lên</span>
          </button>

          <button className="filter-btn">
            <span>⚙️</span>
            <span>Bộ lọc</span>
          </button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-box">
          <h4>156</h4>
          <p>Tổng tài liệu</p>
        </div>
        <div className="stat-box blue">
          <h4>2.3 GB</h4>
          <p>Dung lượng sử dụng</p>
        </div>
        <div className="stat-box green">
          <h4>12</h4>
          <p>Tài liệu mới tuần này</p>
        </div>
        <div className="stat-box orange">
          <h4>45</h4>
          <p>Tài liệu được chia sẻ</p>
        </div>
      </div>

      <div className="documents-layout">
        <aside className="sidebar">
          <h3>Danh mục</h3>
          <ul className="category-list">
            {categories.map(category => (
              <li
                key={category.id}
                className={`category-item ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.id)}
              >
                <div>
                  <span className="category-icon">{category.icon}</span>
                  {category.name}
                </div>
                <span className="category-count">{category.count}</span>
              </li>
            ))}
          </ul>
        </aside>

        <main className="documents-content">
          <div className="breadcrumb">
            <span className="breadcrumb-item">Tài liệu</span>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-item">
              {categories.find(c => c.id === activeCategory)?.name || 'Tất cả'}
            </span>
          </div>

          <div className="upload-zone">
            <div className="upload-zone-icon">📤</div>
            <h3>Kéo thả tài liệu vào đây để tải lên</h3>
            <p>hoặc nhấp để chọn tệp từ máy tính</p>
          </div>

          <div className="view-toggle">
            <div className="view-buttons">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                ⊞ Lưới
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                ☰ Danh sách
              </button>
            </div>

            <select className="sort-select">
              <option>Sắp xếp: Mới nhất</option>
              <option>Sắp xếp: Tên A-Z</option>
              <option>Sắp xếp: Kích thước</option>
            </select>
          </div>

          {filteredDocuments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <h3>Không tìm thấy tài liệu</h3>
              <p>Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="documents-grid">
              {filteredDocuments.map(doc => (
                <div key={doc.id} className="document-card">
                  <div className="document-actions">
                    <button className="action-menu-btn">⋮</button>
                  </div>

                  <div className={`document-icon ${doc.type}`}>
                    {getDocumentIcon(doc.type)}
                  </div>

                  <h3 className="document-name">
                    {doc.name}
                    {doc.isNew && <span className="tag new">Mới</span>}
                    {doc.isImportant && <span className="tag important">Quan trọng</span>}
                  </h3>

                  <p className="document-meta">{doc.size} • {doc.date}</p>
                  <p className="document-meta">Bởi: {doc.uploadedBy}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="documents-list">
              {filteredDocuments.map(doc => (
                <div key={doc.id} className="document-row">
                  <div className={`row-icon ${doc.type}`}>
                    {getDocumentIcon(doc.type)}
                  </div>

                  <div className="row-info">
                    <h4>
                      {doc.name}
                      {doc.isNew && <span className="tag new">Mới</span>}
                      {doc.isImportant && <span className="tag important">Quan trọng</span>}
                    </h4>
                    <p>Bởi: {doc.uploadedBy}</p>
                  </div>

                  <div className="row-size">{doc.size}</div>
                  <div className="row-date">{doc.date}</div>

                  <div className="row-actions">
                    <button className="action-btn" title="Tải xuống">⬇️</button>
                    <button className="action-btn" title="Chia sẻ">🔗</button>
                    <button className="action-btn" title="Chỉnh sửa">✏️</button>
                    <button className="action-btn delete" title="Xóa">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDocuments;
