import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import Loading from '../../components/common/Loading';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const AdminTours = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTours = async () => {
    try {
      const res = await API.get('/tours');
      setTours(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTours(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xác nhận xóa tour "${name}"?`)) return;
    try {
      await API.delete(`/tours/${id}`);
      toast.success('Đã xóa tour');
      fetchTours();
    } catch (error) {
      toast.error('Xóa thất bại');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>🗺️ Quản lý Tour</h1>
        <Link to="/admin/tours/new" className="btn-add">
          <FaPlus /> Thêm tour
        </Link>
      </div>

      <table className="admin-table full">
        <thead>
          <tr>
            <th>#</th>
            <th>Tên tour</th>
            <th>Giá (NL)</th>
            <th>Số chỗ</th>
            <th>Đã đặt</th>
            <th>Hiển thị</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {tours.map((tour, i) => (
            <tr key={tour._id}>
              <td>{i + 1}</td>
              <td><strong>{tour.tenTour}</strong></td>
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
          {tours.length === 0 && <tr><td colSpan={7} className="empty">Chưa có tour nào</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTours;