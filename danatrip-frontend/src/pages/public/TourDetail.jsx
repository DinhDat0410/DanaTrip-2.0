import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Loading from '../../components/common/Loading';
import { useAuth } from '../../hooks/useAuth';
import { FaCheck, FaTimes, FaClock, FaCalendarAlt, FaUsers } from 'react-icons/fa';
import { getImageUrl } from '../../utils/image';
import '../../styles/detail.css';
import '../../styles/tourDetail.css';
import { getImageUrl } from '../../utils/image';

const TourDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tourRes, reviewsRes] = await Promise.all([
          API.get(`/tours/${id}`),
          API.get(`/reviews/tour/${id}`),
        ]);
        setTour(tourRes.data.data);
        setReviews(reviewsRes.data.data || []);
      } catch (error) {
        console.error('Lỗi:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleBooking = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate(`/booking/${id}`);
    }
  };

  if (loading) return <Loading />;
  if (!tour) return <p>Không tìm thấy tour</p>;

  const coverImage = tour.hinhAnh?.[0]?.urlAnh;
  const soChoConLai = tour.soCho - tour.soChoDaDat;

  return (
    <div className="page-container">
      <div className="detail-page">

        {/* Cover Image */}
        {coverImage && (
          <img
            src={getImageUrl(coverImage)}
            alt={tour.tenTour}
            className="tour-cover-image"
          />
        )}

        <h1>{tour.tenTour}</h1>

        {/* Info Row */}
        <div className="tour-info-row">
          {tour.ngayKhoiHanh && (
            <div className="tour-info-item">
              <FaCalendarAlt className="info-icon" />
              <div>
                <span className="info-label">Ngày Khởi hành</span>
                <span className="info-value">
                  {new Date(tour.ngayKhoiHanh).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          )}
          <div className="tour-info-item">
            <FaUsers className="info-icon" />
            <div>
              <span className="info-label">Chỗ còn lại</span>
              <span className="info-value">{soChoConLai} chỗ</span>
            </div>
          </div>
          <div className="tour-info-item">
            <FaClock className="info-icon" />
            <div>
              <span className="info-label">Trạng thái</span>
              <span className="info-value">{tour.trangThai}</span>
            </div>
          </div>
        </div>

        {/* Price + Description */}
        <div className="tour-info-grid">
          <div className="tour-description">
            <p>{tour.moTaChiTiet || tour.moTaNgan}</p>
          </div>
          <div className="tour-price-card">
            <h3>Giá tour</h3>
            <p className="tour-price-main">
              {tour.giaNguoiLon?.toLocaleString('vi-VN')}đ
            </p>
            <p className="tour-price-child">
              Trẻ em: {tour.giaTreEm?.toLocaleString('vi-VN')}đ
            </p>
            <button className="btn-book-tour" onClick={handleBooking}>
              🗓️ Đặt Tour Ngay
            </button>
          </div>
        </div>

        {/* Highlights */}
        {tour.highlights?.length > 0 && (
          <section>
            <h2>✨ Điểm nổi bật</h2>
            <div className="highlight-grid">
              {tour.highlights.map((h, i) => (
                <div key={i} className="highlight-item">
                  {h.noiDung}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Lịch trình */}
        {tour.lichTrinh?.length > 0 && (
          <section>
            <h2>📋 Lịch trình</h2>
            <div className="schedule">
              {tour.lichTrinh
                .sort((a, b) => a.thuTu - b.thuTu)
                .map((step, i) => (
                  <div key={i} className="schedule-item">
                    <div className="schedule-time">
                      {step.tieuDe || `Bước ${step.thuTu}`}
                    </div>
                    <div className="schedule-content">
                      <p>{step.moTa}</p>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Bao gồm / Không bao gồm */}
        {tour.baoGom?.length > 0 && (
          <section className="includes-section">
            <div className="includes-col">
              <h3><FaCheck color="green" /> Bao gồm</h3>
              <ul className="include-list">
                {tour.baoGom
                  .filter((b) => b.loai === 'included')
                  .map((b, i) => (
                    <li key={i}>{b.noiDung}</li>
                  ))}
              </ul>
            </div>
            <div className="includes-col">
              <h3><FaTimes color="red" /> Không bao gồm</h3>
              <ul className="include-list">
                {tour.baoGom
                  .filter((b) => b.loai === 'excluded')
                  .map((b, i) => (
                    <li key={i}>{b.noiDung}</li>
                  ))}
              </ul>
            </div>
          </section>
        )}

        {/* Đánh giá */}
        <section>
          <h2>⭐ Đánh giá ({reviews.length})</h2>
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review._id} className="review-card">
                <div className="review-header">
                  <strong>{review.user?.hoTen}</strong>
                  <span>{'⭐'.repeat(review.sao)}</span>
                </div>
                <p>{review.noiDung}</p>
              </div>
            ))
          ) : (
            <p>Chưa có đánh giá nào.</p>
          )}
        </section>

        <Link to="/tours" className="btn-back">← Quay lại</Link>
      </div>
    </div>
  );
};

export default TourDetail;