import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import Loading from '../../components/common/Loading';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { getImageUrl } from '../../utils/image';

const AdminTours = () => {
  const { user } = useAuth();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchTours = async () => {
    try {
      const res = await API.get('/tours/manage/all');
      setTours(res.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải danh sách tour');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTours(); }, []);

  const getTourImage = (tour) => tour.hinhAnh?.[0]?.urlAnh || '';

  const filteredTours = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return tours;

    return tours.filter((tour) => [
      tour.tenTour,
      tour.partner?.hoTen,
      tour.partner?.email,
      tour.giaNguoiLon,
      tour.soCho,
      tour.soChoDaDat,
      tour.hienThi ? 'hiện hien' : 'ẩn an',
    ].some((value) => String(value || '').toLowerCase().includes(keyword)));
  }, [tours, search]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xác nhận xóa tour "${name}"?`)) return;
    try {
      await API.delete(`/tours/${id}`);
      toast.success('Đã xóa tour');
      fetchTours();
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>{user?.vaiTro === 'Partner' ? '🧳 Tour của doanh nghiệp' : '🗺️ Quản lý Tour'}</h1>
        <Link to="/admin/tours/new" className="btn-add">
          <FaPlus /> Thêm tour
        </Link>
      </div>

      <div className="admin-search-bar">
        <div className="search-input-wrap">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm theo tên tour, đối tác, giá..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <table className="admin-table full">
        <thead>
          <tr>
            <th>#</th>
            <th>Hình</th>
            <th>Tên tour</th>
            <th>Đối tác</th>
            <th>Giá (NL)</th>
            <th>Số chỗ</th>
            <th>Đã đặt</th>
            <th>Hiển thị</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredTours.map((tour, i) => (
            <tr key={tour._id}>
              <td>{i + 1}</td>
              <td><img src={getImageUrl(getTourImage(tour))} alt={tour.tenTour} className="table-img" /></td>
              <td><strong>{tour.tenTour}</strong></td>
              <td>{tour.partner?.hoTen || 'Chưa gán'}</td>
              <td>{tour.giaNguoiLon?.toLocaleString('vi-VN')}đ</td>
              <td>{tour.soCho}</td>
              <td>{tour.soChoDaDat}</td>
              <td>
                <span className={`badge ${tour.hienThi ? 'done' : 'pending'}`}>
                  {tour.hienThi ? 'Hiện' : 'Ẩn'}
                </span>
              </td>
              <td>
                <div className="action-btns">
                  <Link to={`/admin/tours/edit/${tour._id}`} className="btn-edit"><FaEdit /></Link>
                  <button onClick={() => handleDelete(tour._id, tour.tenTour)} className="btn-delete"><FaTrash /></button>
                </div>
              </td>
            </tr>
          ))}
          {filteredTours.length === 0 && <tr><td colSpan={9} className="empty">Không tìm thấy tour phù hợp</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTours;
