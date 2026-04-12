import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import Loading from '../../components/common/Loading';
import '../../styles/booking.css';

const VN_PHONE_REGEX = /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6|7|8|9]|8[0-9]|9[0-9])[0-9]{7}$/;

const Booking = () => {
  const { tourId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    hoTen: '',
    sdt: '',
    email: '',
    soNguoiLon: 1,
    soTreEm: 0,
    phuongThucThanhToan: 'Cash',
    ghiChu: '',
  });

  // Load tour info
  useEffect(() => {
    const fetchTour = async () => {
      try {
        const res = await API.get(`/tours/${tourId}`);
        setTour(res.data.data);

        // Pre-fill form từ user info
        if (user) {
          setForm((prev) => ({
            ...prev,
            hoTen: user.hoTen || '',
            email: user.email || '',
            sdt: user.sdt || '',
          }));
        }
      } catch (error) {
        console.error('Lỗi:', error);
        toast.error('Không tìm thấy tour');
      } finally {
        setLoading(false);
      }
    };
    fetchTour();
  }, [tourId, user]);

  // Tính tổng tiền
  const tongTien =
    tour
      ? form.soNguoiLon * tour.giaNguoiLon + form.soTreEm * tour.giaTreEm
      : 0;

  const soChoConLai = tour ? tour.soCho - tour.soChoDaDat : 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'soNguoiLon' || name === 'soTreEm' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate phone number (VN format)
    if (form.sdt && !VN_PHONE_REGEX.test(form.sdt)) {
      return toast.error('Số điện thoại không hợp lệ (định dạng Việt Nam)');
    }

    // Validate available spots
    if (form.soNguoiLon + form.soTreEm > soChoConLai) {
      return toast.error(`Tour chỉ còn ${soChoConLai} chỗ trống`);
    }

    setSubmitting(true);

    try {
      const res = await API.post('/bookings', {
        tour: tourId,
        ...form,
      });

      const booking = res.data.data;

      if (form.phuongThucThanhToan === 'Momo') {
        try {
          const payRes = await API.post('/payment/create-momo', {
            bookingId: booking._id,
          });
          const payUrl = payRes.data?.payUrl;
          if (payUrl) {
            toast.info('Đang chuyển tới cổng thanh toán MoMo...');
            window.location.href = payUrl;
            return;
          }
          toast.error(payRes.data?.message || 'Không lấy được link thanh toán MoMo');
        } catch (payErr) {
          const d = payErr.response?.data;
          let msg = d?.message || 'Không tạo được thanh toán MoMo';
          if (Array.isArray(d?.missingEnvVars) && d.missingEnvVars.length) {
            msg += ` (thiếu: ${d.missingEnvVars.join(', ')})`;
          }
          toast.error(msg);
          try {
            await API.put(`/bookings/${booking._id}/cancel`);
            toast.info('Đơn tạm thời đã hủy do không mở được MoMo. Bạn có thể đặt lại.');
          } catch {
            toast.error('Không hủy được đơn tự động — vui lòng hủy trong hồ sơ hoặc liên hệ hỗ trợ.');
          }
        }
        return;
      }

      toast.success('Đặt tour thành công!');
      navigate('/booking-success', {
        state: { booking },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đặt tour thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;
  if (!tour) return <p className="page-container">Không tìm thấy tour</p>;

  const coverImage = tour.hinhAnh?.[0]?.urlAnh;

  return (
    <div className="page-container">
      <div className="booking-page">
        <h1>📝 Đặt Tour</h1>

        <div className="booking-layout">
          {/* Form đặt tour */}
          <form onSubmit={handleSubmit} className="booking-form">
            <div className="form-group">
              <label>Họ tên *</label>
              <input
                type="text"
                name="hoTen"
                value={form.hoTen}
                onChange={handleChange}
                placeholder="Nhập họ tên"
                required
              />
            </div>

            <div className="form-group">
              <label>Số điện thoại *</label>
              <input
                type="tel"
                name="sdt"
                value={form.sdt}
                onChange={handleChange}
                placeholder="VD: 0912345678"
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Nhập email"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Người lớn *</label>
                <input
                  type="number"
                  name="soNguoiLon"
                  value={form.soNguoiLon}
                  onChange={handleChange}
                  min="1"
                  max={soChoConLai}
                  required
                />
              </div>

              <div className="form-group">
                <label>Trẻ em</label>
                <input
                  type="number"
                  name="soTreEm"
                  value={form.soTreEm}
                  onChange={handleChange}
                  min="0"
                  max={soChoConLai - form.soNguoiLon}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Phương thức thanh toán</label>
              <div className="payment-methods">
                {[
                  { value: 'Cash', label: '💵 Tiền mặt' },
                  { value: 'Momo', label: '🟣 Momo' },
                  { value: 'ZaloPay', label: '🔵 ZaloPay' },
                  { value: 'VNPay', label: '🔴 VNPay' },
                  { value: 'BankTransfer', label: '🏦 Chuyển khoản' },
                ].map((method) => (
                  <label key={method.value} className="payment-option">
                    <input
                      type="radio"
                      name="phuongThucThanhToan"
                      value={method.value}
                      checked={form.phuongThucThanhToan === method.value}
                      onChange={handleChange}
                    />
                    <span>{method.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Ghi chú</label>
              <textarea
                name="ghiChu"
                value={form.ghiChu}
                onChange={handleChange}
                rows={3}
                placeholder="Ghi chú thêm (không bắt buộc)"
              />
            </div>

            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Đang xử lý...' : 'Xác nhận đặt tour'}
            </button>
          </form>

          {/* Thông tin tour & tổng tiền */}
          <div className="booking-summary">
            <div className="summary-card">
              {/* Tour image */}
              {coverImage && (
                <img
                  src={coverImage}
                  alt={tour.tenTour}
                  className="summary-tour-image"
                />
              )}

              <h2>{tour.tenTour}</h2>
              <p className="summary-location">
                📍 {tour.diaDiem?.tenDiaDiem || 'Đà Nẵng'}
              </p>

              {tour.ngayKhoiHanh && (
                <p>📅 Khởi hành: {new Date(tour.ngayKhoiHanh).toLocaleDateString('vi-VN')}</p>
              )}

              <p>💺 Còn lại: <strong>{soChoConLai} chỗ</strong></p>

              <hr />

              <div className="price-breakdown">
                <div className="price-row">
                  <span>Người lớn × {form.soNguoiLon}</span>
                  <span>{(form.soNguoiLon * tour.giaNguoiLon).toLocaleString('vi-VN')}đ</span>
                </div>
                {form.soTreEm > 0 && (
                  <div className="price-row">
                    <span>Trẻ em × {form.soTreEm}</span>
                    <span>{(form.soTreEm * tour.giaTreEm).toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                <hr />
                <div className="price-row total">
                  <span>Tổng cộng</span>
                  <span className="total-price">
                    {tongTien.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;