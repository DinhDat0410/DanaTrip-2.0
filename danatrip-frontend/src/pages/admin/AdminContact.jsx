import { useState, useEffect, useMemo, useCallback } from 'react';
import API from '../../api/axios';
import Loading from '../../components/common/Loading';
import { toast } from 'react-toastify';
import { FaSearch, FaTrash } from 'react-icons/fa';

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchContacts = useCallback(async () => {
    try {
      const params = filter ? `?trangThai=${filter}` : '';
      const res = await API.get(`/contacts${params}`);
      setContacts(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { setLoading(true); fetchContacts(); }, [fetchContacts]);

  const filteredContacts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return contacts;

    return contacts.filter((contact) => [
      contact.ten,
      contact.email,
      contact.noiDung,
      contact.trangThai,
      contact.user?.hoTen,
    ].some((value) => String(value || '').toLowerCase().includes(keyword)));
  }, [contacts, search]);

  const handleUpdateStatus = async (id, trangThai) => {
    try {
      await API.put(`/contacts/${id}`, { trangThai });
      toast.success(`Đã cập nhật → ${trangThai}`);
      fetchContacts();
    } catch {
      toast.error('Cập nhật thất bại');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xóa liên hệ này?')) return;
    try {
      await API.delete(`/contacts/${id}`);
      toast.success('Đã xóa');
      fetchContacts();
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>✉️ Quản lý Liên hệ</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
          <option value="">Tất cả</option>
          <option value="Chưa xử lý">Chưa xử lý</option>
          <option value="Đã xử lý">Đã xử lý</option>
        </select>
      </div>

      <div className="admin-search-bar">
        <div className="search-input-wrap">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm theo tên, email, nội dung..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <table className="admin-table full">
        <thead>
          <tr>
            <th>#</th>
            <th>Tên</th>
            <th>Email</th>
            <th>Nội dung</th>
            <th>Ngày gửi</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredContacts.map((c, i) => (
            <tr key={c._id}>
              <td>{i + 1}</td>
              <td><strong>{c.ten}</strong></td>
              <td>{c.email}</td>
              <td>{c.noiDung?.substring(0, 50)}...</td>
              <td>{new Date(c.createdAt).toLocaleDateString('vi-VN')}</td>
              <td>
                <span className={`badge ${c.trangThai === 'Chưa xử lý' ? 'pending' : 'done'}`}>
                  {c.trangThai}
                </span>
              </td>
              <td>
                <div className="action-btns">
                  {c.trangThai === 'Chưa xử lý' && (
                    <button className="btn-confirm" onClick={() => handleUpdateStatus(c._id, 'Đã xử lý')}>
                      ✅ Xử lý
                    </button>
                  )}
                  <button onClick={() => handleDelete(c._id)} className="btn-delete"><FaTrash /></button>
                </div>
              </td>
            </tr>
          ))}
          {filteredContacts.length === 0 && <tr><td colSpan={7} className="empty">Không tìm thấy liên hệ phù hợp</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

export default AdminContacts;
