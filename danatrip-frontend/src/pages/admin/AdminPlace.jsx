import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import Loading from '../../components/common/Loading';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import '../../styles/admin.css';

const AdminPlaces = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPlaces = async () => {
    try {
      const res = await API.get('/places');
      setPlaces(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlaces(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xác nhận xóa địa điểm "${name}"?`)) return;

    try {
      await API.delete(`/places/${id}`);
      toast.success('Đã xóa địa điểm');
      fetchPlaces();
    } catch (error) {
      toast.error('Xóa thất bại');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>📍 Quản lý Địa điểm</h1>
        <Link to="/admin/places/new" className="btn-add">
          <FaPlus /> Thêm địa điểm
        </Link>
      </div>

      <table className="admin-table full">
        <thead>
          <tr>
            <th>#</th>
            <th>Hình</th>
            <th>Tên địa điểm</th>
            <th>Vị trí</th>
            <th>Hiển thị</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {places.map((place, i) => (
            <tr key={place._id}>
              <td>{i + 1}</td>
              <td>
                <img src={place.hinhAnhChinh || '/images/placeholder.jpg'} alt="" className="table-img" />
              </td>
              <td><strong>{place.tenDiaDiem}</strong></td>
              <td>{place.viTri}</td>
              <td>
                <span className={`badge ${place.hienThi ? 'done' : 'pending'}`}>
                  {place.hienThi ? 'Hiện' : 'Ẩn'}
                </span>
              </td>
              <td>
                <div className="action-btns">
                  <Link to={`/admin/places/edit/${place._id}`} className="btn-edit">
                    <FaEdit />
                  </Link>
                  <button onClick={() => handleDelete(place._id, place.tenDiaDiem)} className="btn-delete">
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {places.length === 0 && (
            <tr><td colSpan={6} className="empty">Chưa có địa điểm nào</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPlaces;