import React, { useCallback, useEffect, useState } from 'react';
import '../../styles/documents.css';
import axiosInstance from '../../api/axios';

export const EmployeeDocuments = () => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [documents, setDocuments] = useState([]);

  const categories = [
    { id: 'all', name: 'Tất cả tài liệu', icon: '📁', count: documents.length },
    { id: 'recent', name: 'Gần đây', icon: '🕒', count: documents.filter(d => d.isNew).length },
    { id: 'personal', name: 'Tài liệu cá nhân', icon: '👤', count: documents.filter(d => d.category === 'personal').length },
    { id: 'company', name: 'Tài liệu công ty', icon: '🏢', count: documents.filter(d => d.category === 'company').length },
    { id: 'training', name: 'Đào tạo', icon: '📚', count: documents.filter(d => d.category === 'training').length },
    { id: 'shared', name: 'Được chia sẻ', icon: '🔗', count: documents.filter(d => d.category === 'shared').length },
  ];

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/documents', {
        params: { category: activeCategory, search: searchQuery }
      });
      setDocuments(res.data);
    } catch (err) {
      console.error('Load employee documents error', err);
    }
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const downloadFile = (id) => {
    (async () => {
      try {
        const res = await axiosInstance.get(`/documents/${id}/download`, { responseType: 'blob' });
        const blob = new Blob([res.data], { type: res.headers['content-type'] || 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);

        let filename = 'file';
        const cd = res.headers['content-disposition'];
        if (cd) {
          const match = cd.match(/filename="?([^";]+)"?/);
          if (match) filename = match[1];
        }

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => window.URL.revokeObjectURL(url), 10000);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          alert('Bạn cần đăng nhập để tải tài liệu.');
          window.location.href = '/login';
          return;
        }
        console.error('Download error', err);
      }
    })();
  };

  const viewFile = async (id) => {
    try {
      const res = await axiosInstance.get(`/documents/${id}/view`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: res.headers['content-type'] || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        alert('Bạn cần đăng nhập để xem tài liệu.');
        window.location.href = '/login';
        return;
      }
      console.error('View error', err);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesCategory =
      activeCategory === 'all' ||
      (activeCategory === 'recent' ? doc.isNew : doc.category === activeCategory);

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
        <h1>Tài liệu của tôi</h1>

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

          <button className="filter-btn">
            <span>⚙️</span>
            <span>Bộ lọc</span>
          </button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-box">
          <h4>{documents.length}</h4>
          <p>Tổng tài liệu</p>
        </div>
        <div className="stat-box blue">
          <h4>{documents.filter(d => d.category === 'personal').length}</h4>
          <p>Tài liệu cá nhân</p>
        </div>
        <div className="stat-box green">
          <h4>{documents.filter(d => d.isNew).length}</h4>
          <p>Tài liệu mới</p>
        </div>
        <div className="stat-box orange">
          <h4>{documents.filter(d => d.sharedBy).length}</h4>
          <p>Được chia sẻ</p>
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

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #e9ecef' }}>
            <h3>Thông tin lưu trữ</h3>

            <div style={{ marginTop: 12 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 13,
                color: '#666',
                marginBottom: 8
              }}>
                <span>Đã sử dụng</span>
                <span>2.8 GB / 10 GB</span>
              </div>

              <div style={{
                width: '100%',
                height: 8,
                background: '#e9ecef',
                borderRadius: 4,
                overflow: 'hidden'
              }}>
                <div style={{
                  width: '28%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 4
                }} />
              </div>
            </div>
          </div>
        </aside>

        <main className="documents-content">
          <div className="breadcrumb">
            <span className="breadcrumb-item">Tài liệu</span>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-item">
              {categories.find(c => c.id === activeCategory)?.name || 'Tất cả'}
            </span>
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

                  <div className="card-actions">
                    <button onClick={() => downloadFile(doc.id)}>⬇️</button>
                  </div>

                  <div className={`document-icon ${doc.type}`}>
                    {getDocumentIcon(doc.type)}
                  </div>

                  <h3 className="document-name">
                    {doc.name}
                    {doc.isNew && <span className="tag new">Mới</span>}
                    {doc.sharedBy && <span className="tag shared">Chia sẻ</span>}
                  </h3>

                  <p className="document-meta">{doc.size} • {doc.date}</p>
                  {doc.sharedBy && <p className="document-meta">Từ: {doc.sharedBy}</p>}
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
                      {doc.sharedBy && <span className="tag shared">Chia sẻ</span>}
                    </h4>
                    <p>{doc.sharedBy ? `Từ: ${doc.sharedBy}` : 'Tài liệu cá nhân'}</p>
                  </div>

                  <div className="row-size">{doc.size}</div>
                  <div className="row-date">{doc.date}</div>

                  <div className="row-actions">
                    <button className="action-btn" title="Xem" onClick={() => viewFile(doc.id)}>👁️</button>
                    <button className="action-btn" title="Tải xuống" onClick={() => downloadFile(doc.id)}>⬇️</button>
                    <button className="action-btn" title="Chia sẻ">🔗</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Quick Actions */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }}>
        <button
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            color: '#fff',
            fontSize: 24,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          title="Yêu cầu tài liệu"
        >
          📧
        </button>
      </div>
    </div>
  );
};

export default EmployeeDocuments;
