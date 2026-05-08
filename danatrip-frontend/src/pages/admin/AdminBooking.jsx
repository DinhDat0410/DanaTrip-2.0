import { useState, useEffect, useMemo, useCallback } from 'react';
import API from '../../api/axios';
import Loading from '../../components/common/Loading';
import { toast } from 'react-toastify';
import { FaSearch } from 'react-icons/fa';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchBookings = useCallback(async () => {
    try {
      const params = filter ? `?trangThai=${filter}` : '';
      const res = await API.get(`/bookings${params}`);
      setBookings(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { setLoading(true); fetchBookings(); }, [fetchBookings]);

  const filteredBookings = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return bookings;

    return bookings.filter((booking) => [
      booking.hoTen,
      booking.sdt,
      booking.email,
      booking.tour?.tenTour,
      booking.phuongThucThanhToan,
      booking.trangThai,
      booking.tongTien,
    ].some((value) => String(value || '').toLowerCase().includes(keyword)));
  }, [bookings, search]);

  const handleUpdateStatus = async (id, trangThai) => {
    try {
      await API.put(`/bookings/${id}`, { trangThai });
      toast.success(`Đã cập nhật → ${trangThai}`);
      fetchBookings();
    } catch {
      toast.error('Cập nhật thất bại');
    }
  };

  const getStatusClass = (s) => {
    switch (s) {
      case 'Chờ xác nhận': return 'pending';
      case 'Đã xác nhận': return 'confirmed';
      case 'Đã thanh toán': return 'paid';
      case 'Đã hủy': return 'cancelled';
      default: return '';
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>📋 Quản lý Booking</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
          <option value="">Tất cả</option>
          <option value="Chờ xác nhận">Chờ xác nhận</option>
          <option value="Đã xác nhận">Đã xác nhận</option>
          <option value="Đã thanh toán">Đã thanh toán</option>
          <option value="Đã hủy">Đã hủy</option>
        </select>
      </div>

      <div className="admin-search-bar">
        <div className="search-input-wrap">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm theo khách hàng, SĐT, email, tour..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <table className="admin-table full">
        <thead>
          <tr>
            <th>#</th>
            <th>Khách hàng</th>
            <th>SĐT</th>
            <th>Tour</th>
            <th>Số người</th>
            <th>Tổng tiền</th>
            <th>Thanh toán</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredBookings.map((b, i) => (
            <tr key={b._id}>
              <td>{i + 1}</td>
              <td><strong>{b.hoTen}</strong></td>
              <td>{b.sdt}</td>
              <td>{b.tour?.tenTour || '—'}</td>
              <td>{b.soNguoiLon}NL + {b.soTreEm}TE</td>
              <td>{b.tongTien?.toLocaleString('vi-VN')}đ</td>
              <td>{b.phuongThucThanhToan}</td>
              <td>
                <span className={`badge ${getStatusClass(b.trangThai)}`}>{b.trangThai}</span>
              </td>
              <td>
                {b.trangThai === 'Chờ xác nhận' && (
                  <div className="action-btns">
                    <button className="btn-confirm" onClick={() => handleUpdateStatus(b._id, 'Đã xác nhận')}>
                      ✅ Xác nhận
                    </button>
                    <button className="btn-cancel-sm" onClick={() => handleUpdateStatus(b._id, 'Đã hủy')}>
                      ❌ Hủy
                    </button>
                  </div>
                )}
                {b.trangThai === 'Đã xác nhận' && (
                  <button className="btn-confirm" onClick={() => handleUpdateStatus(b._id, 'Đã thanh toán')}>
                    💰 Đã TT
                  </button>
                )}
              </td>
            </tr>
          ))}
          {filteredBookings.length === 0 && <tr><td colSpan={9} className="empty">Không tìm thấy booking phù hợp</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

export default AdminBookings;
