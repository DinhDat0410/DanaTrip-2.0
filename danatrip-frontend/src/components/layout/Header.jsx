import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FaUser, FaSignOutAlt, FaBars } from 'react-icons/fa';
import { useState } from 'react';
import '../../styles/header.css';

const Header = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          🏖️ DANATrip
        </Link>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          <FaBars />
        </button>

        <nav className={`nav ${menuOpen ? 'nav-open' : ''}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>Trang chủ</Link>
          <Link to="/places" onClick={() => setMenuOpen(false)}>Địa điểm</Link>
          <Link to="/tours" onClick={() => setMenuOpen(false)}>Tour</Link>
          <Link to="/foods" onClick={() => setMenuOpen(false)}>Ẩm thực</Link>
          <Link to="/reviews" onClick={() => setMenuOpen(false)}>Đánh giá</Link>
          <Link to="/contact" onClick={() => setMenuOpen(false)}>Liên hệ</Link>

          {isAdmin && (
            <Link to="/admin" className="admin-link" onClick={() => setMenuOpen(false)}>
              Admin
            </Link>
          )}

          {isAuthenticated ? (
            <div className="user-menu">
              <Link to="/profile" onClick={() => setMenuOpen(false)}>
                <FaUser /> {user?.hoTen}
              </Link>
              <button onClick={handleLogout} className="btn-logout">
                <FaSignOutAlt /> Đăng xuất
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="btn-login" onClick={() => setMenuOpen(false)}>
                Đăng nhập
              </Link>
              <Link to="/register" className="btn-register" onClick={() => setMenuOpen(false)}>
                Đăng ký
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;