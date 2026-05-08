import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaFilter, FaHistory, FaSearch } from 'react-icons/fa';
import API from '../../api/axios';
import Loading from '../../components/common/Loading';
import '../../styles/admin.css';

const actionLabels = {
  create: 'Tạo mới',
  update: 'Cập nhật',
  delete: 'Xóa',
  status_change: 'Đổi trạng thái',
  generate: 'Tạo tự động',
  other: 'Khác',
};

const AdminLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [resource, setResource] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (resource) params.resource = resource;

      const res = await API.get('/admin-logs', { params });
      setLogs(res.data?.data || []);
    } finally {
      setLoading(false);
    }
  }, [resource, search]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const resourceOptions = useMemo(() => {
    const values = new Set(logs.map((log) => log.resource).filter(Boolean));
    return Array.from(values).sort();
  }, [logs]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  if (loading) return <Loading />;

  return (
    <div className="admin-page admin-log-page">
      <div className="admin-page-header">
        <div>
          <h1><FaHistory /> Admin log</h1>
          <p className="admin-subtitle">Theo dõi các thay đổi quan trọng trong hệ thống DANATrip.</p>
        </div>
        <span className="admin-log-count">{logs.length} hoạt động</span>
      </div>

      <form className="admin-search-bar" onSubmit={handleSubmit}>
        <div className="search-input-wrap">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm theo người thao tác, tài nguyên, URL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={resource} onChange={(e) => setResource(e.target.value)}>
          <option value="">Tất cả module</option>
          {resourceOptions.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <button className="btn-confirm" type="submit"><FaFilter /> Lọc</button>
      </form>

      <table className="admin-table full">
        <thead>
          <tr>
            <th>Thời gian</th>
            <th>Người thao tác</th>
            <th>Hành động</th>
            <th>Module</th>
            <th>Dữ liệu</th>
            <th>Đường dẫn</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log._id}>
              <td>{new Date(log.createdAt).toLocaleString('vi-VN')}</td>
              <td>
                <strong>{log.actorName}</strong>
                <span className="admin-log-muted">{log.actorRole}</span>
              </td>
              <td><span className={`badge log-${log.action}`}>{actionLabels[log.action] || log.action}</span></td>
              <td>{log.resource}</td>
              <td>{log.resourceName || log.resourceId || 'Không có tên'}</td>
              <td className="admin-log-path">{log.method} {log.path}</td>
            </tr>
          ))}
          {logs.length === 0 && (
            <tr><td colSpan={6} className="empty">Chưa có log phù hợp</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminLog;
