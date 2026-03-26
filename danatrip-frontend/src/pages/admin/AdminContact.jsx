import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Loading from '../../components/common/Loading';
import { toast } from 'react-toastify';
import { FaTrash } from 'react-icons/fa';

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchContacts = async () => {
    try {
      const params = filter ? `?trangThai=${filter}` : '';
      const res = await API.get(`/contacts${params}`);
      setContacts(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setLoading(true); fetchContacts(); }, [filter]);

  const handleUpdateStatus = async (id, trangThai) => {
    try {
      await API.put(`/contacts/${id}`, { trangThai });
      toast.success(`Đã cập nhật → ${trangThai}`);
      fetchContacts();
    } catch (error) {
      toast.error('Cập nhật thất bại');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xóa liên hệ này?')) return;
    try {
      await API.delete(`/contacts/${id}`);
      toast.success('Đã xóa');
      fetchContacts();
    } catch (error) {
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
          {contacts.map((c, i) => (
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
          {contacts.length === 0 && <tr><td colSpan={7} className="empty">Không có liên hệ nào</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

export default AdminContacts;