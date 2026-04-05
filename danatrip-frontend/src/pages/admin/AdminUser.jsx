import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import Loading from '../../components/common/Loading';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUsers } from 'react-icons/fa';
import '../../styles/admin.css';

const AdminUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null });

  const fetchUsers = async (q = '') => {
    try {
      const res = await API.get('/users', { params: q ? { search: q } : {} });
      setUsers(res.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(search);
  };

  const handleToggleHienThi = async (user) => {
    try {
      await API.put(`/users/${user._id}`, { hienThi: !user.hienThi });
      setUsers((prev) =>
        prev.map((u) => u._id === user._id ? { ...u, hienThi: !u.hienThi } : u)
      );
      toast.success('Đã cập nhật trạng thái hiển thị');
    } catch {
      toast.error('Cập nhật thất bại');
    }
  };

  const openDeleteModal = (user) => setDeleteModal({ open: true, user });
  const closeDeleteModal = () => setDeleteModal({ open: false, user: null });

  const handleDelete = async () => {
    const { user } = deleteModal;
    if (!user) return;
    try {
      await API.delete(`/users/${user._id}`);
      toast.success('Đã xóa người dùng');
      setUsers((prev) => prev.filter((u) => u._id !== user._id));
      closeDeleteModal();
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1><FaUsers style={{ marginRight: '8px' }} />Quản lý Tài khoản Người dùng</h1>
          <p className="admin-subtitle">Tìm kiếm, quản lý vai trò và trạng thái tài khoản.</p>
        </div>
        <Link to="/admin/users/new" className="btn-add">
          <FaPlus /> Thêm người dùng mới
        </Link>
      </div>

      {/* Search toolbar */}
      <form className="admin-search-bar" onSubmit={handleSearch}>
        <div className="search-input-wrap">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-add" style={{ padding: '9px 20px' }}>Lọc</button>
      </form>

      <table className="admin-table full">
        <thead>
          <tr>
            <th>#</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Vai trò</th>
            <th>Trạng thái</th>
            <th>Kích hoạt</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, i) => (
            <tr key={user._id}>
              <td>{i + 1}</td>
              <td><strong>{user.hoTen}</strong></td>
              <td>{user.email}</td>
              <td>
                <span className={`badge ${user.vaiTro === 'Admin' ? 'badge-admin' : 'badge-user'}`}>
                  {user.vaiTro}
                </span>
              </td>
              <td>
                <span className={`badge ${user.trangThai === 'Hoạt động' ? 'badge-active' : 'badge-locked'}`}>
                  {user.trangThai || 'Hoạt động'}
                </span>
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={user.hienThi !== false}
                  onChange={() => handleToggleHienThi(user)}
                  style={{ width: '18px', height: '18px', accentColor: '#0077cc', cursor: 'pointer' }}
                />
              </td>
              <td>
                <div className="action-btns">
                  <Link to={`/admin/users/edit/${user._id}`} className="btn-edit">
                    <FaEdit />
                  </Link>
                  <button onClick={() => openDeleteModal(user)} className="btn-delete">
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr><td colSpan={7} className="empty">Chưa có người dùng nào</td></tr>
          )}
        </tbody>
      </table>

      {/* Delete confirmation modal */}
      {deleteModal.open && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>⚠️ Xác nhận xóa</h3>
            <p>
              Bạn có chắc muốn xóa tài khoản <strong>{deleteModal.user?.hoTen}</strong>?
            </p>
            <p className="modal-warning">
              Thao tác này sẽ xóa toàn bộ lịch sử đặt tour và đánh giá liên quan. Không thể hoàn tác!
            </p>
            <div className="modal-actions">
              <button onClick={closeDeleteModal} className="btn-modal-cancel">Hủy</button>
              <button onClick={handleDelete} className="btn-modal-delete">Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUser;
