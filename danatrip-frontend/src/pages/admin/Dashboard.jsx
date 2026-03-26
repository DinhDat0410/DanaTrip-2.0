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
} from 'react-icons/fa';
import '../../styles/admin.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentContacts, setRecentContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [placesRes, toursRes, foodsRes, bookingsRes, reviewsRes, contactsRes] =
          await Promise.all([
            API.get('/places'),
            API.get('/tours'),
            API.get('/foods'),
            API.get('/bookings'),
            API.get('/reviews'),
            API.get('/contacts'),
          ]);

        // Tính thống kê
        const bookings = bookingsRes.data.data || [];
        const tongDoanhThu = bookings
          .filter((b) => b.trangThai !== 'Đã hủy')
          .reduce((sum, b) => sum + (b.tongTien || 0), 0);

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
        });

        setRecentBookings(bookings.slice(0, 5));
        setRecentContacts((contactsRes.data.data || []).slice(0, 5));
      } catch (error) {
        console.error('Dashboard error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>📊 Admin Dashboard</h1>
        <p>Chào mừng quay lại! Đây là tổng quan hệ thống DANATrip.</p>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        <div className="stat-card blue">
          <div className="stat-icon"><FaMapMarkerAlt /></div>
          <div className="stat-info">
            <h3>{stats?.places}</h3>
            <p>Địa điểm</p>
          </div>
          <Link to="/admin/places" className="stat-link">Quản lý →</Link>
        </div>

        <div className="stat-card green">
          <div className="stat-icon"><FaRoute /></div>
          <div className="stat-info">
            <h3>{stats?.tours}</h3>
            <p>Tour</p>
          </div>
          <Link to="/admin/tours" className="stat-link">Quản lý →</Link>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon"><FaUtensils /></div>
          <div className="stat-info">
            <h3>{stats?.foods}</h3>
            <p>Món ăn</p>
          </div>
          <Link to="/admin/foods" className="stat-link">Quản lý →</Link>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon"><FaCalendarCheck /></div>
          <div className="stat-info">
            <h3>{stats?.bookings}</h3>
            <p>Booking</p>
          </div>
          <Link to="/admin/bookings" className="stat-link">Quản lý →</Link>
        </div>

        <div className="stat-card yellow">
          <div className="stat-icon"><FaStar /></div>
          <div className="stat-info">
            <h3>{stats?.reviews}</h3>
            <p>Đánh giá</p>
          </div>
          <Link to="/admin/reviews" className="stat-link">Quản lý →</Link>
        </div>

        <div className="stat-card red">
          <div className="stat-icon"><FaEnvelope /></div>
          <div className="stat-info">
            <h3>{stats?.contacts}</h3>
            <p>Liên hệ</p>
          </div>
          <Link to="/admin/contacts" className="stat-link">Quản lý →</Link>
        </div>
      </div>

      {/* Highlight Cards */}
      <div className="highlight-grid">
        <div className="highlight-card revenue">
          <FaChartLine />
          <div>
            <p>Tổng doanh thu</p>
            <h2>{stats?.tongDoanhThu?.toLocaleString('vi-VN')}đ</h2>
          </div>
        </div>
        <div className="highlight-card warning">
          <FaCalendarCheck />
          <div>
            <p>Chờ xác nhận</p>
            <h2>{stats?.choXacNhan} booking</h2>
          </div>
        </div>
        <div className="highlight-card danger">
          <FaEnvelope />
          <div>
            <p>Liên hệ chưa xử lý</p>
            <h2>{stats?.chuaXuLy} tin</h2>
          </div>
        </div>
      </div>

      {/* Recent Tables */}
      <div className="admin-tables">
        {/* Recent Bookings */}
        <div className="admin-table-card">
          <div className="table-header">
            <h2>📋 Booking gần đây</h2>
            <Link to="/admin/bookings">Xem tất cả →</Link>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Tour</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((b) => (
                <tr key={b._id}>
                  <td>{b.hoTen}</td>
                  <td>{b.tour?.tenTour || '—'}</td>
                  <td>{b.tongTien?.toLocaleString('vi-VN')}đ</td>
                  <td>
                    <span className={`badge ${getStatusClass(b.trangThai)}`}>
                      {b.trangThai}
                    </span>
                  </td>
                </tr>
              ))}
              {recentBookings.length === 0 && (
                <tr><td colSpan={4} className="empty">Chưa có booking nào</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Recent Contacts */}
        <div className="admin-table-card">
          <div className="table-header">
            <h2>✉️ Liên hệ gần đây</h2>
            <Link to="/admin/contacts">Xem tất cả →</Link>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tên</th>
                <th>Email</th>
                <th>Nội dung</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {recentContacts.map((c) => (
                <tr key={c._id}>
                  <td>{c.ten}</td>
                  <td>{c.email}</td>
                  <td>{c.noiDung?.substring(0, 40)}...</td>
                  <td>
                    <span className={`badge ${c.trangThai === 'Chưa xử lý' ? 'pending' : 'done'}`}>
                      {c.trangThai}
                    </span>
                  </td>
                </tr>
              ))}
              {recentContacts.length === 0 && (
                <tr><td colSpan={4} className="empty">Chưa có liên hệ nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const getStatusClass = (status) => {
  switch (status) {
    case 'Chờ xác nhận': return 'pending';
    case 'Đã xác nhận': return 'confirmed';
    case 'Đã thanh toán': return 'paid';
    case 'Đã hủy': return 'cancelled';
    default: return '';
  }
};

export default Dashboard;