import { Link } from 'react-router-dom';
import '../../styles/footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>🏖️ DANATrip</h3>
          <p>Khám phá vẻ đẹp Đà Nẵng cùng DANATrip</p>
        </div>

        <div className="footer-section">
          <h4>Liên kết</h4>
          <Link to="/places">Địa điểm</Link>
          <Link to="/tours">Tour du lịch</Link>
          <Link to="/foods">Ẩm thực</Link>
          <Link to="/contact">Liên hệ</Link>
        </div>

        <div className="footer-section">
          <h4>Liên hệ</h4>
          <p>📍 Đà Nẵng, Việt Nam</p>
          <p>📞 0901 234 567</p>
          <p>✉️ info@danatrip.com</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 DANATrip. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;