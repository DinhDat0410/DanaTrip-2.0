import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  FaChartBar,
  FaMapMarkerAlt,
  FaRoute,
  FaUtensils,
  FaCalendarCheck,
  FaStar,
  FaEnvelope,
  FaUsers,
  FaArrowLeft,
  FaSignOutAlt,
} from 'react-icons/fa';
import '../../styles/adminLayout.css';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/admin', icon: <FaChartBar />, label: 'Dashboard', exact: true },
    { path: '/admin/places', icon: <FaMapMarkerAlt />, label: 'Địa điểm' },
    { path: '/admin/tours', icon: <FaRoute />, label: 'Tour' },
    { path: '/admin/foods', icon: <FaUtensils />, label: 'Ẩm thực' },
    { path: '/admin/bookings', icon: <FaCalendarCheck />, label: 'Booking' },
    { path: '/admin/reviews', icon: <FaStar />, label: 'Đánh giá' },
    { path: '/admin/contacts', icon: <FaEnvelope />, label: 'Liên hệ' },
    { path: '/admin/users', icon: <FaUsers />, label: 'Người dùng' },
  ];

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>🏖️ DANATrip</h2>
          <span>Admin Panel</span>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive(item) ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.hoTen?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <p className="sidebar-username">{user?.hoTen}</p>
              <p className="sidebar-role">{user?.vaiTro}</p>
            </div>
          </div>

          <Link to="/" className="sidebar-link back-link">
            <FaArrowLeft /> <span>Về trang chủ</span>
          </Link>
          <button onClick={handleLogout} className="sidebar-link logout-btn">
            <FaSignOutAlt /> <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;