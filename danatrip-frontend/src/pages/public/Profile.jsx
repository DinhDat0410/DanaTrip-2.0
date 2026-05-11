import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import API from '../../api/axios';
import Loading from '../../components/common/Loading';
import { toast } from 'react-toastify';
import { FaUser, FaHistory, FaStar, FaTimes, FaSave, FaEnvelope, FaLock } from 'react-icons/fa';
import '../../styles/profile.css';

const Profile = () => {
  const { user, updateCurrentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reviewingTour, setReviewingTour] = useState(null);
  const [reviewForm, setReviewForm] = useState({ sao: 5, noiDung: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedTours, setReviewedTours] = useState([]);
  const [profileForm, setProfileForm] = useState({ hoTen: '', sdt: '' });
  const [passwordForm, setPasswordForm] = useState({
    matKhauCu: '',
    matKhauMoi: '',
    xacNhanMatKhauMoi: '',
  });
  const [emailForm, setEmailForm] = useState({ emailMoi: '', maXacNhan: '' });
  const [isEmailCodeSent, setIsEmailCodeSent] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [requestingEmailCode, setRequestingEmailCode] = useState(false);
  const [confirmingEmail, setConfirmingEmail] = useState(false);

  useEffect(() => {
    setProfileForm({
      hoTen: user?.hoTen || '',
      sdt: user?.sdt || '',
    });
  }, [user]);

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
      const tourIds = (res.data.data || [])
        .map((r) => r.tour?._id?.toString())
        .filter(Boolean);
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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await API.put('/auth/profile', profileForm);
      updateCurrentUser(res.data.user);
      toast.success(res.data.message || 'Cập nhật thông tin thành công');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cập nhật thông tin thất bại');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangingPassword(true);
    try {
      await API.put('/auth/change-password', passwordForm);
      toast.success('Đổi mật khẩu thành công');
      setPasswordForm({ matKhauCu: '', matKhauMoi: '', xacNhanMatKhauMoi: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleRequestEmailCode = async (e) => {
    e.preventDefault();
    setRequestingEmailCode(true);
    try {
      const res = await API.post('/auth/request-email-change', {
        emailMoi: emailForm.emailMoi,
      });
      setIsEmailCodeSent(true);
      toast.success(res.data.message || 'Đã gửi mã xác nhận đến email mới');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không gửi được mã xác nhận');
    } finally {
      setRequestingEmailCode(false);
    }
  };

  const handleConfirmEmailChange = async (e) => {
    e.preventDefault();
    setConfirmingEmail(true);
    try {
      const res = await API.put('/auth/confirm-email-change', {
        maXacNhan: emailForm.maXacNhan,
      });
      updateCurrentUser(res.data.user);
      setEmailForm({ emailMoi: '', maXacNhan: '' });
      setIsEmailCodeSent(false);
      toast.success(res.data.message || 'Đổi email thành công');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đổi email thất bại');
    } finally {
      setConfirmingEmail(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Chờ xác nhận': return 'pending';
      case 'Đã xác nhận': return 'confirmed';
      case 'Đã thanh toán': return 'paid';
      case 'Đang hoàn tiền': return 'pending';
      case 'Đã hoàn tiền': return 'cancelled';
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

            <div className="account-settings">
              <form className="settings-card" onSubmit={handleUpdateProfile}>
                <div className="settings-card-header">
                  <FaUser />
                  <h3>Chỉnh sửa thông tin</h3>
                </div>
                <div className="form-group">
                  <label htmlFor="profile-hoTen">Họ tên</label>
                  <input
                    id="profile-hoTen"
                    type="text"
                    value={profileForm.hoTen}
                    onChange={(e) => setProfileForm((form) => ({ ...form, hoTen: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="profile-sdt">Số điện thoại</label>
                  <input
                    id="profile-sdt"
                    type="tel"
                    value={profileForm.sdt}
                    onChange={(e) => setProfileForm((form) => ({ ...form, sdt: e.target.value }))}
                    placeholder="Chưa cập nhật"
                  />
                </div>
                <button className="btn-settings" type="submit" disabled={savingProfile}>
                  <FaSave /> {savingProfile ? 'Đang lưu...' : 'Lưu thông tin'}
                </button>
              </form>

              <form className="settings-card" onSubmit={handleChangePassword}>
                <div className="settings-card-header">
                  <FaLock />
                  <h3>Đổi mật khẩu</h3>
                </div>
                <div className="form-group">
                  <label htmlFor="current-password">Mật khẩu cũ</label>
                  <input
                    id="current-password"
                    type="password"
                    value={passwordForm.matKhauCu}
                    onChange={(e) => setPasswordForm((form) => ({ ...form, matKhauCu: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="new-password">Mật khẩu mới</label>
                  <input
                    id="new-password"
                    type="password"
                    value={passwordForm.matKhauMoi}
                    onChange={(e) => setPasswordForm((form) => ({ ...form, matKhauMoi: e.target.value }))}
                    minLength={6}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirm-new-password">Nhập lại mật khẩu mới</label>
                  <input
                    id="confirm-new-password"
                    type="password"
                    value={passwordForm.xacNhanMatKhauMoi}
                    onChange={(e) => setPasswordForm((form) => ({ ...form, xacNhanMatKhauMoi: e.target.value }))}
                    minLength={6}
                    required
                  />
                </div>
                <button className="btn-settings" type="submit" disabled={changingPassword}>
                  <FaLock /> {changingPassword ? 'Đang đổi...' : 'Đổi mật khẩu'}
                </button>
              </form>

              <div className="settings-card">
                <div className="settings-card-header">
                  <FaEnvelope />
                  <h3>Đổi email</h3>
                </div>
                <form onSubmit={handleRequestEmailCode}>
                  <div className="form-group">
                    <label htmlFor="new-email">Email mới</label>
                    <input
                      id="new-email"
                      type="email"
                      value={emailForm.emailMoi}
                      onChange={(e) => {
                        setEmailForm((form) => ({ ...form, emailMoi: e.target.value }));
                        setIsEmailCodeSent(false);
                      }}
                      required
                    />
                  </div>
                  <button className="btn-settings btn-secondary-settings" type="submit" disabled={requestingEmailCode}>
                    <FaEnvelope /> {requestingEmailCode ? 'Đang gửi...' : 'Gửi mã xác nhận'}
                  </button>
                </form>

                {isEmailCodeSent && (
                  <form className="confirm-email-form" onSubmit={handleConfirmEmailChange}>
                    <div className="form-group">
                      <label htmlFor="email-code">Mã xác nhận</label>
                      <input
                        id="email-code"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={emailForm.maXacNhan}
                        onChange={(e) => setEmailForm((form) => ({ ...form, maXacNhan: e.target.value }))}
                        placeholder="Nhập mã 6 số"
                        required
                      />
                    </div>
                    <button className="btn-settings" type="submit" disabled={confirmingEmail}>
                      <FaSave /> {confirmingEmail ? 'Đang xác nhận...' : 'Xác nhận đổi email'}
                    </button>
                  </form>
                )}
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
                  const tourId = booking.tour?._id?.toString() || '';
                  const isEligibleForReview =
                    (booking.trangThai === 'Đã xác nhận' || booking.trangThai === 'Đã thanh toán') &&
                    !!tourId;
                  const canReview = isEligibleForReview && !reviewedTours.includes(tourId);
                  const hasReviewed = isEligibleForReview && reviewedTours.includes(tourId);

                  return (
                    <div key={booking._id} className="booking-card">
                      <div className="booking-card-header">
                        <h3>{booking.tour?.tenTour || 'Tour'}</h3>
                        <span className={`status-badge ${getStatusColor(booking.trangThai)}`}>
                          {booking.trangThai}
                        </span>
                      </div>

                      <div className="booking-card-body">
                        <p>🆔 Mã đặt tour: {booking._id}</p>
                        <p>👤 {booking.hoTen}</p>
                        <p>👥 {booking.soNguoiLon} người lớn, {booking.soTreEm} trẻ em</p>
                        <p>💰 {booking.tongTien?.toLocaleString('vi-VN')}đ</p>
                        <p>💳 {booking.phuongThucThanhToan}</p>
                        <p>🚍 Khởi hành: {booking.tour?.ngayKhoiHanh ? new Date(booking.tour.ngayKhoiHanh).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</p>
                        <p>📅 {new Date(booking.createdAt).toLocaleDateString('vi-VN')}</p>
                        {booking.ghiChu && <p>📝 {booking.ghiChu}</p>}
                      </div>

                      <div className="booking-card-actions">
                        {['Chờ xác nhận', 'Đã xác nhận'].includes(booking.trangThai) && (
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
