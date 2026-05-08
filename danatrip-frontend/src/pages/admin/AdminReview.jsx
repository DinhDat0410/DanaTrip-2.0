import { useState, useEffect, useMemo } from 'react';
import API from '../../api/axios';
import Loading from '../../components/common/Loading';
import { toast } from 'react-toastify';
import { FaSearch, FaTrash } from 'react-icons/fa';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  const filteredReviews = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return reviews;

    return reviews.filter((review) => [
      review.user?.hoTen,
      review.user?.email,
      review.tour?.tenTour,
      review.sao,
      review.noiDung,
    ].some((value) => String(value || '').toLowerCase().includes(keyword)));
  }, [reviews, search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xóa đánh giá này?')) return;
    try {
      await API.delete(`/reviews/${id}`);
      toast.success('Đã xóa đánh giá');
      fetchReviews();
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="admin-page">
      <h1>⭐ Quản lý Đánh giá</h1>

      <div className="admin-search-bar">
        <div className="search-input-wrap">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm theo người dùng, tour, nội dung..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

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
          {filteredReviews.map((r, i) => (
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
          {filteredReviews.length === 0 && <tr><td colSpan={7} className="empty">Không tìm thấy đánh giá phù hợp</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

export default AdminReviews;
