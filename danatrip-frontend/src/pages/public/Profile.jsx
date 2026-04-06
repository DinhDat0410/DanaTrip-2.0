import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import API from '../../api/axios';
import Loading from '../../components/common/Loading';
import { toast } from 'react-toastify';
import { FaUser, FaHistory, FaStar, FaTimes } from 'react-icons/fa';
import '../../styles/profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reviewingTour, setReviewingTour] = useState(null);
  const [reviewForm, setReviewForm] = useState({ sao: 5, noiDung: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedTours, setReviewedTours] = useState([]);

  // Load bookings khi chuyển sang tab lịch sử
  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchBookings();
      fetchMyReviews();
    }
  }, [activeTab]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await API.get('/bookings/my');
      setBookings(res.data.data || []);
    } catch (error) {
      console.error('Lỗi:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyReviews = async () => {
    try {
      const res = await API.get('/reviews/my');
      const tourIds = (res.data.data || []).map((r) => r.tour?._id?.toString());
      setReviewedTours(tourIds);
    } catch (error) {
      console.error('Lỗi lấy đánh giá:', error);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Bạn có chắc muốn hủy booking này?')) return;

    try {
      await API.put(`/bookings/${bookingId}/cancel`);
      toast.success('Đã hủy booking thành công');
      fetchBookings(); // Reload
    } catch (error) {
      toast.error(error.response?.data?.message || 'Hủy thất bại');
    }
  };

  const handleSubmitReview = async (tourId) => {
    setSubmittingReview(true);
    try {
      await API.post('/reviews', { tour: tourId, sao: reviewForm.sao, noiDung: reviewForm.noiDung });
      toast.success('Đã gửi đánh giá thành công!');
      setReviewingTour(null);
      setReviewForm({ sao: 5, noiDung: '' });
      fetchMyReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gửi đánh giá thất bại');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Chờ xác nhận': return 'pending';
      case 'Đã xác nhận': return 'confirmed';
      case 'Đã thanh toán': return 'paid';
      case 'Đã hủy': return 'cancelled';
      default: return '';
    }
  };

  return (
    <div className="page-container">
      <div className="profile-page">
        <h1>👤 Tài khoản của tôi</h1>

        {/* Tabs */}
        <div className="profile-tabs">
          <button
            className={`tab ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            <FaUser /> Thông tin cá nhân
          </button>
          <button
            className={`tab ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <FaHistory /> Lịch sử đặt tour
          </button>
        </div>

        {/* Tab: Thông tin cá nhân */}
        {activeTab === 'info' && (
          <div className="profile-info">
            <div className="info-card">
              <div className="avatar-section">
                <div className="avatar-placeholder">
                  {user?.hoTen?.charAt(0)?.toUpperCase()}
                </div>
                <h2>{user?.hoTen}</h2>
                <span className={`role-badge ${user?.vaiTro?.toLowerCase()}`}>
                  {user?.vaiTro}
                </span>
              </div>

              <div className="info-details">
                <div className="info-row">
                  <label>Email:</label>
                  <span>{user?.email}</span>
                </div>
                <div className="info-row">
                  <label>Số điện thoại:</label>
                  <span>{user?.sdt || 'Chưa cập nhật'}</span>
                </div>
                <div className="info-row">
                  <label>Ngày tham gia:</label>
                  <span>
                    {new Date(user?.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Lịch sử booking */}
        {activeTab === 'bookings' && (
          <div className="booking-history">
            {loading ? (
              <Loading />
            ) : bookings.length > 0 ? (
              <div className="booking-list">
                {bookings.map((booking) => {
                  const tourId = booking.tour?._id?.toString();
                  const canReview =
                    (booking.trangThai === 'Đã xác nhận' || booking.trangThai === 'Đã thanh toán') &&
                    tourId &&
                    !reviewedTours.includes(tourId);
                  const hasReviewed =
                    (booking.trangThai === 'Đã xác nhận' || booking.trangThai === 'Đã thanh toán') &&
                    tourId &&
                    reviewedTours.includes(tourId);

                  return (
                    <div key={booking._id} className="booking-card">
                      <div className="booking-card-header">
                        <h3>{booking.tour?.tenTour || 'Tour'}</h3>
                        <span className={`status-badge ${getStatusColor(booking.trangThai)}`}>
                          {booking.trangThai}
                        </span>
                      </div>

                      <div className="booking-card-body">
                        <p>👤 {booking.hoTen}</p>
                        <p>👥 {booking.soNguoiLon} người lớn, {booking.soTreEm} trẻ em</p>
                        <p>💰 {booking.tongTien?.toLocaleString('vi-VN')}đ</p>
                        <p>💳 {booking.phuongThucThanhToan}</p>
                        <p>📅 {new Date(booking.createdAt).toLocaleDateString('vi-VN')}</p>
                        {booking.ghiChu && <p>📝 {booking.ghiChu}</p>}
                      </div>

                      <div className="booking-card-actions">
                        {booking.trangThai === 'Chờ xác nhận' && (
                          <button
                            className="btn-cancel"
                            onClick={() => handleCancelBooking(booking._id)}
                          >
                            <FaTimes /> Hủy booking
                          </button>
                        )}
                        {canReview && (
                          <button
                            className="btn-review"
                            onClick={() => {
                              setReviewingTour(tourId);
                              setReviewForm({ sao: 5, noiDung: '' });
                            }}
                          >
                            <FaStar /> Đánh giá tour
                          </button>
                        )}
                        {hasReviewed && (
                          <span className="reviewed-badge">✅ Đã đánh giá</span>
                        )}
                      </div>

                      {reviewingTour === tourId && (
                        <div className="review-form">
                          <p className="review-form-title">Đánh giá tour này:</p>
                          <div className="star-select">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                className={`star-btn ${reviewForm.sao >= star ? 'active' : ''}`}
                                onClick={() => setReviewForm((f) => ({ ...f, sao: star }))}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                          <textarea
                            className="review-textarea"
                            placeholder="Chia sẻ trải nghiệm của bạn..."
                            value={reviewForm.noiDung}
                            onChange={(e) => setReviewForm((f) => ({ ...f, noiDung: e.target.value }))}
                            rows={3}
                          />
                          <div className="review-form-actions">
                            <button
                              className="btn-cancel"
                              onClick={() => setReviewingTour(null)}
                            >
                              Hủy
                            </button>
                            <button
                              className="btn-submit-review"
                              disabled={submittingReview}
                              onClick={() => handleSubmitReview(tourId)}
                            >
                              {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <p>Bạn chưa đặt tour nào.</p>
                <a href="/tours" className="btn-primary">Khám phá tour ngay</a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;