import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Loading from '../../components/common/Loading';
import { toast } from 'react-toastify';
import { FaTrash } from 'react-icons/fa';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const res = await API.get('/reviews');
      setReviews(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xóa đánh giá này?')) return;
    try {
      await API.delete(`/reviews/${id}`);
      toast.success('Đã xóa đánh giá');
      fetchReviews();
    } catch (error) {
      toast.error('Xóa thất bại');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="admin-page">
      <h1>⭐ Quản lý Đánh giá</h1>

      <table className="admin-table full">
        <thead>
          <tr>
            <th>#</th>
            <th>Người dùng</th>
            <th>Tour</th>
            <th>Sao</th>
            <th>Nội dung</th>
            <th>Ngày</th>
            <th>Xóa</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((r, i) => (
            <tr key={r._id}>
              <td>{i + 1}</td>
              <td>{r.user?.hoTen || '—'}</td>
              <td>{r.tour?.tenTour || '—'}</td>
              <td>{'⭐'.repeat(r.sao)}</td>
              <td>{r.noiDung?.substring(0, 60)}...</td>
              <td>{new Date(r.createdAt).toLocaleDateString('vi-VN')}</td>
              <td>
                <button onClick={() => handleDelete(r._id)} className="btn-delete"><FaTrash /></button>
              </td>
            </tr>
          ))}
          {reviews.length === 0 && <tr><td colSpan={7} className="empty">Chưa có đánh giá nào</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

export default AdminReviews;