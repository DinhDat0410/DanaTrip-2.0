import { useLocation, Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import '../../styles/booking.css';

const BookingSuccess = () => {
  const location = useLocation();
  const booking = location.state?.booking;

  return (
    <div className="page-container">
      <div className="booking-success">
        <FaCheckCircle className="success-icon" />
        <h1>Đặt tour thành công!</h1>
        <p>Cảm ơn bạn đã đặt tour. Chúng tôi sẽ liên hệ xác nhận sớm nhất.</p>

        {booking && (
          <div className="success-details">
            <h3>Thông tin đặt tour</h3>
            <table>
              <tbody>
                <tr>
                  <td>Tour:</td>
                  <td><strong>{booking.tour?.tenTour}</strong></td>
                </tr>
                <tr>
                  <td>Họ tên:</td>
                  <td>{booking.hoTen}</td>
                </tr>
                <tr>
                  <td>SĐT:</td>
                  <td>{booking.sdt}</td>
                </tr>
                <tr>
                  <td>Số người:</td>
                  <td>{booking.soNguoiLon} người lớn, {booking.soTreEm} trẻ em</td>
                </tr>
                <tr>
                  <td>Tổng tiền:</td>
                  <td className="total-price">
                    {booking.tongTien?.toLocaleString('vi-VN')}đ
                  </td>
                </tr>
                <tr>
                  <td>Thanh toán:</td>
                  <td>{booking.phuongThucThanhToan}</td>
                </tr>
                <tr>
                  <td>Trạng thái:</td>
                  <td>
                    <span className="status-badge pending">{booking.trangThai}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div className="success-actions">
          <Link to="/profile" className="btn-primary">Xem lịch sử đặt tour</Link>
          <Link to="/tours" className="btn-secondary">Tiếp tục khám phá</Link>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;