import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import Loading from '../../components/common/Loading';
import {
  FaMapMarkerAlt,
  FaRoute,
  FaUtensils,
  FaCalendarCheck,
  FaStar,
  FaEnvelope,
  FaUsers,
  FaChartLine,
  FaMoneyBillWave,
} from 'react-icons/fa';
import '../../styles/admin.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [revenue7Days, setRevenue7Days] = useState([]);
  const [topTours, setTopTours] = useState([]);
  const [tourStats, setTourStats] = useState({ total: 0, hienThi: 0, an: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [placesRes, toursRes, foodsRes, bookingsRes, reviewsRes, contactsRes, usersRes] =
          await Promise.all([
            API.get('/places'),
            API.get('/tours'),
            API.get('/foods'),
            API.get('/bookings'),
            API.get('/reviews'),
            API.get('/contacts'),
            API.get('/users').catch((err) => { console.error('Users API error:', err); return { data: { data: [] } }; }),
          ]);

        const bookings = bookingsRes.data.data || [];
        const tours = toursRes.data.data || [];
        const users = usersRes.data.data || [];

        // Tổng doanh thu (chỉ đơn Đã Thanh Toán)
        const tongDoanhThu = bookings
          .filter((b) => b.trangThai === 'Đã thanh toán')
          .reduce((sum, b) => sum + (b.tongTien || 0), 0);

        // Người dùng mới 30 ngày
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newUsers = users.filter(
          (u) => new Date(u.createdAt) >= thirtyDaysAgo
        ).length;

        const choXacNhan = bookings.filter((b) => b.trangThai === 'Chờ xác nhận').length;
        const chuaXuLy = (contactsRes.data.data || []).filter(
          (c) => c.trangThai === 'Chưa xử lý'
        ).length;

        setStats({
          places: placesRes.data.count || 0,
          tours: toursRes.data.count || 0,
          foods: foodsRes.data.count || 0,
          bookings: bookings.length,
          reviews: reviewsRes.data.count || 0,
          contacts: contactsRes.data.count || 0,
          tongDoanhThu,
          choXacNhan,
          chuaXuLy,
          newUsers,
          users: users.length,
        });

        // Doanh thu 7 ngày gần đây
        const last7 = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const label = `${d.getDate()}/${d.getMonth() + 1}`;
          const dayStr = d.toDateString();
          const total = bookings
            .filter(
              (b) =>
                b.trangThai === 'Đã thanh toán' &&
                new Date(b.createdAt).toDateString() === dayStr
            )
            .reduce((sum, b) => sum + (b.tongTien || 0), 0);
          last7.push({ label, total });
        }
        setRevenue7Days(last7);

        // Top tours được đặt nhiều
        const tourCount = {};
        bookings.forEach((b) => {
          const tourId = b.tour?._id || b.tour;
          if (tourId) {
            tourCount[tourId] = (tourCount[tourId] || 0) + 1;
          }
        });
        const topTourList = tours
          .map((t) => ({ ...t, bookingCount: tourCount[t._id] || 0 }))
          .filter((t) => t.bookingCount > 0)
          .sort((a, b) => b.bookingCount - a.bookingCount)
          .slice(0, 5);
        setTopTours(topTourList);

        // Tour stats
        const hienThiCount = tours.filter((t) => t.hienThi !== false).length;
        setTourStats({
          total: tours.length,
          hienThi: hienThiCount,
          an: tours.length - hienThiCount,
        });

        setRecentBookings(bookings.slice(0, 5));
      } catch (error) {
        console.error('Dashboard error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <Loading />;

  const maxRevenue = Math.max(...revenue7Days.map((d) => d.total), 1);
  const maxBooking = Math.max(...topTours.map((t) => t.bookingCount), 1);

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>📊 Admin Dashboard</h1>
        <p>Chào mừng quay lại! Đây là tổng quan hệ thống DANATrip.</p>
      </div>

      {/* 4 thẻ tổng quan */}
      <div className="db-cards">
        <div className="db-card">
          <div className="db-card-icon revenue-icon"><FaMoneyBillWave /></div>
          <div className="db-card-info">
            <p>Tổng doanh thu</p>
            <h3>{stats?.tongDoanhThu?.toLocaleString('vi-VN')}đ</h3>
          </div>
        </div>
        <div className="db-card">
          <div className="db-card-icon booking-icon"><FaCalendarCheck /></div>
          <div className="db-card-info">
            <p>Tour đã đặt</p>
            <h3>{stats?.bookings}</h3>
          </div>
        </div>
        <div className="db-card">
          <div className="db-card-icon user-icon"><FaUsers /></div>
          <div className="db-card-info">
            <p>Người dùng mới (30 ngày)</p>
            <h3>{stats?.newUsers}</h3>
          </div>
        </div>
        <div className="db-card">
          <div className="db-card-icon place-icon"><FaMapMarkerAlt /></div>
          <div className="db-card-info">
            <p>Tour / Địa điểm</p>
            <h3>{stats?.tours} / {stats?.places}</h3>
          </div>
        </div>
      </div>

      {/* Hàng giữa: Doanh thu 7 ngày + Thống kê Tour */}
      <div className="db-middle">
        {/* Doanh thu 7 ngày */}
        <div className="db-panel">
          <div className="table-header">
            <h2>📈 Doanh thu 7 ngày gần đây</h2>
            <Link to="/admin/bookings">Xem tất cả →</Link>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Tổng tiền</th>
                <th style={{ width: '40%' }}>Biểu đồ</th>
              </tr>
            </thead>
            <tbody>
              {revenue7Days.map((day, i) => (
                <tr key={i}>
                  <td>{day.label}</td>
                  <td style={{ fontWeight: 600, color: '#27ae60' }}>
                    {day.total > 0 ? `${day.total.toLocaleString('vi-VN')}đ` : '—'}
                  </td>
                  <td>
                    <div className="db-bar-wrap">
                      <div
                        className="db-bar"
                        style={{ width: `${(day.total / maxRevenue) * 100}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Thống kê Tour */}
        <div className="db-panel">
          <h2 style={{ marginBottom: '1.5rem' }}>🗺️ Thống kê Tour</h2>
          <div className="db-circle-wrap">
            <div className="db-circle">
              <span className="db-circle-num">{tourStats.total}</span>
              <span className="db-circle-label">Tour</span>
            </div>
          </div>
          <div className="db-legend">
            <div className="db-legend-item">
              <span className="db-legend-dot green" />
              <span>Đang hiển thị</span>
              <strong>{tourStats.hienThi}</strong>
            </div>
            <div className="db-legend-item">
              <span className="db-legend-dot grey" />
              <span>Bị ẩn</span>
              <strong>{tourStats.an}</strong>
            </div>
            <div className="db-legend-item" style={{ marginTop: '0.5rem', borderTop: '1px solid #eee', paddingTop: '0.5rem' }}>
              <span className="db-legend-dot orange" />
              <span>Chờ xác nhận</span>
              <strong>{stats?.choXacNhan}</strong>
            </div>
            <div className="db-legend-item">
              <span className="db-legend-dot red" />
              <span>Liên hệ chưa xử lý</span>
              <strong>{stats?.chuaXuLy}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Hàng dưới: Booking gần đây + Top tours */}
      <div className="db-bottom">
        {/* Hoạt động đặt tour gần đây */}
        <div className="db-panel">
          <div className="table-header">
            <h2>📋 Hoạt động đặt tour gần đây</h2>
            <Link to="/admin/bookings">Xem tất cả →</Link>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã ĐV</th>
                <th>Tên tour</th>
                <th>Khách hàng</th>
                <th>Ngày đặt</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((b) => (
                <tr key={b._id}>
                  <td style={{ fontSize: '0.78rem', color: '#999' }}>
                    #{b._id?.slice(-6).toUpperCase()}
                  </td>
                  <td>{b.tour?.tenTour || '—'}</td>
                  <td>{b.hoTen}</td>
                  <td>{b.createdAt ? new Date(b.createdAt).toLocaleDateString('vi-VN') : '—'}</td>
                  <td>
                    <span className={`db-status ${getStatusClass(b.trangThai)}`}>
                      {b.trangThai}
                    </span>
                  </td>
                </tr>
              ))}
              {recentBookings.length === 0 && (
                <tr><td colSpan={5} className="empty">Chưa có booking nào</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Top tours được đặt nhiều */}
        <div className="db-panel">
          <div className="table-header">
            <h2>🏆 Top tour được đặt nhiều</h2>
            <Link to="/admin/tours">Xem tất cả →</Link>
          </div>
          {topTours.length > 0 ? (
            <div className="db-top-tours">
              {topTours.map((tour, i) => (
                <div key={tour._id} className="db-top-item">
                  <span className="db-top-rank">#{i + 1}</span>
                  <div className="db-top-info">
                    <p>{tour.tenTour}</p>
                    <div className="db-top-bar-wrap">
                      <div
                        className="db-top-bar"
                        style={{ width: `${(tour.bookingCount / maxBooking) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="db-top-count">{tour.bookingCount}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty">Chưa có dữ liệu đặt tour</p>
          )}
        </div>
      </div>
    </div>
  );
};

const getStatusClass = (status) => {
  switch (status) {
    case 'Chờ xác nhận': return 'pending';
    case 'Đã xác nhận': return 'confirmed';
    case 'Đã thanh toán': return 'success';
    case 'Đã hủy': return 'cancel';
    default: return '';
  }
};

export default Dashboard;