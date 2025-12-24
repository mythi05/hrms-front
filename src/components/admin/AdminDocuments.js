import React, { useEffect, useRef, useState } from "react";
import "../../styles/documents.css";
import axiosInstance from "../../api/axios";

export const AdminDocuments = () => {
  const [viewMode, setViewMode] = useState("grid");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    newDocs: 0,
    important: 0
  });
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);
  const [uploadVisibility, setUploadVisibility] = useState('PUBLIC');
  const [uploadUser, setUploadUser] = useState('');

  /* ================= LOAD DOCUMENTS ================= */
  useEffect(() => {
    fetchDocuments();
  }, [activeCategory, searchQuery]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/documents", {
        params: {
          category: activeCategory,
          search: searchQuery
        }
      });
      setDocuments(res.data);
    } catch (err) {
      console.error("Load documents error", err);
    }
    setLoading(false);
  };

  /* ================= LOAD STATS ================= */
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axiosInstance.get("/documents/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Load stats error", err);
    }
  };

  /* ================= UPLOAD ================= */
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    let visibility = uploadVisibility;
    if (visibility === 'USER' && uploadUser) visibility = `USER:${uploadUser}`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "category",
      activeCategory === "all" ? "company" : activeCategory
    );
    formData.append("uploadedBy", "Admin");
    formData.append("visibility", visibility);

    try {
      await axiosInstance.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      fetchDocuments();
      fetchStats();
    } catch (err) {
      console.error("Upload error", err);
    }
  };

  /* ================= DELETE ================= */
  const deleteFile = async (id) => {
    if (!window.confirm("Xóa tài liệu này?")) return;
    try {
      await axiosInstance.delete(`/documents/${id}`);
      fetchDocuments();
      fetchStats();
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  /* ================= DOWNLOAD ================= */
const downloadFile = async (id) => {
  try {
    const res = await axiosInstance.get(
      `/documents/${id}/download`,
      { responseType: "blob" }
    );

    const blob = new Blob([res.data], {
      type: res.headers["content-type"] || "application/octet-stream"
    });

    const url = window.URL.createObjectURL(blob);

    let filename = "file";
    const cd = res.headers["content-disposition"];
    if (cd) {
      const match = cd.match(/filename="?([^";]+)"?/);
      if (match) filename = match[1];
    }

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(() => URL.revokeObjectURL(url), 10000);
  } catch (err) {
    if (err.response?.status === 401) {
      alert("Bạn cần đăng nhập để tải tài liệu");
      window.location.href = "/login";
      return;
    }
    if (err.response?.status === 403) {
      alert("Bạn không có quyền tải tài liệu này");
      return;
    }
    console.error("Download error", err);
  }
};


const viewFile = async (id) => {
  try {
    const res = await axiosInstance.get(
      `/documents/${id}/view`,
      { responseType: "blob" }
    );

    const contentType =
      res.headers["content-type"] || "application/octet-stream";

    const blob = new Blob([res.data], { type: contentType });
    const url = window.URL.createObjectURL(blob);

    window.open(url, "_blank");

    setTimeout(() => URL.revokeObjectURL(url), 10000);
  } catch (err) {
    if (err.response?.status === 401) {
      alert("Bạn cần đăng nhập để xem tài liệu");
      window.location.href = "/login";
      return;
    }
    if (err.response?.status === 403) {
      alert("Bạn không có quyền xem tài liệu này");
      return;
    }
    console.error("View error", err);
  }
};


  /* ================= ICON ================= */
  const getDocumentIcon = (type) => {
    switch (type) {
      case "pdf":
        return "📄";
      case "word":
        return "📝";
      case "excel":
        return "📊";
      case "image":
        return "🖼️";
      case "folder":
        return "📁";
      default:
        return "📄";
    }
  };

  const categories = [
    { id: "all", name: "Tất cả tài liệu", icon: "📁" },
    { id: "company", name: "Công ty", icon: "🏢" },
    { id: "hr", name: "Nhân sự", icon: "👥" },
    { id: "finance", name: "Tài chính", icon: "💰" },
    { id: "training", name: "Đào tạo", icon: "📚" },
    { id: "policies", name: "Chính sách", icon: "📋" }
  ];

  return (
    <div className="documents-container">
      {/* ================= HEADER ================= */}
      <div className="documents-header">
        <h1>Quản lý tài liệu</h1>

        <div className="header-actions">
          <div className="search-box">
            🔍
            <input
              placeholder="Tìm kiếm tài liệu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <select value={uploadVisibility} onChange={e => setUploadVisibility(e.target.value)}>
              <option value="PUBLIC">Công khai (Tất cả nhân viên)</option>
              <option value="ROLE_HR">Chỉ HR</option>
              <option value="ROLE_ADMIN">Chỉ Admin</option>
              <option value="USER">Một người cụ thể</option>
            </select>
            {uploadVisibility === 'USER' && (
              <input placeholder="username" value={uploadUser} onChange={e => setUploadUser(e.target.value)} />
            )}

            <button
              className="upload-btn"
              onClick={() => fileInputRef.current.click()}
            >
              ⬆️ Tải lên
            </button>

            <input
              type="file"
              ref={fileInputRef}
              hidden
              onChange={handleUpload}
            />
          </div>
        </div>
      </div>

      {/* ================= STATS ================= */}
      <div className="stats-row">
        <div className="stat-box">
          <h4>{stats.total}</h4>
          <p>Tổng tài liệu</p>
        </div>
        <div className="stat-box green">
          <h4>{stats.newDocs}</h4>
          <p>Tài liệu mới</p>
        </div>
        <div className="stat-box orange">
          <h4>{stats.important}</h4>
          <p>Tài liệu quan trọng</p>
        </div>
      </div>

      <div className="documents-layout">
        {/* ================= SIDEBAR ================= */}
        <aside className="sidebar">
          <h3>Danh mục</h3>
          <ul className="category-list">
            {categories.map((c) => (
              <li
                key={c.id}
                className={activeCategory === c.id ? "active" : ""}
                onClick={() => setActiveCategory(c.id)}
              >
                {c.icon} {c.name}
              </li>
            ))}
          </ul>
        </aside>

        {/* ================= CONTENT ================= */}
        <main className="documents-content">
          <div className="view-toggle">
            <button
              className={viewMode === "grid" ? "active" : ""}
              onClick={() => setViewMode("grid")}
            >
              ⊞ Lưới
            </button>
            <button
              className={viewMode === "list" ? "active" : ""}
              onClick={() => setViewMode("list")}
            >
              ☰ Danh sách
            </button>
          </div>

          {loading ? (
            <p>Đang tải...</p>
          ) : documents.length === 0 ? (
            <div className="empty-state">📭 Không có tài liệu</div>
          ) : viewMode === "grid" ? (
            <div className="documents-grid">
              {documents.map((doc) => (
                <div key={doc.id} className="document-card">
                  <div className={`document-icon ${doc.fileType}`}>
                    {getDocumentIcon(doc.fileType)}
                  </div>

                  <h3>
                    {doc.name}
                    {doc.isNew && <span className="tag new">Mới</span>}
                    {doc.isImportant && (
                      <span className="tag important">Quan trọng</span>
                    )}
                  </h3>

                  <p>
                    {(doc.fileSize / 1024 / 1024).toFixed(2)} MB •{" "}
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </p>

                  <p>Bởi: {doc.uploadedBy}</p>

                  <div className="card-actions">
                    <button onClick={() => viewFile(doc.id)} title="Xem">👁️</button>
                    <button onClick={() => downloadFile(doc.id)} title="Tải về">⬇️</button>
                    <button onClick={() => deleteFile(doc.id)} title="Xóa">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="documents-list">
              {documents.map((doc) => (
                <div key={doc.id} className="document-row">
                  <span>{getDocumentIcon(doc.fileType)}</span>
                  <span>{doc.name}</span>
                  <span>{doc.uploadedBy}</span>
                  <span>
                    {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <span>
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                  <button onClick={() => viewFile(doc.id)} title="Xem">👁️</button>
                  <button onClick={() => downloadFile(doc.id)} title="Tải về">⬇️</button>
                  <button onClick={() => deleteFile(doc.id)} title="Xóa">🗑️</button>
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
