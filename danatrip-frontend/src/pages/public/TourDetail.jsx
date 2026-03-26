import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Loading from '../../components/common/Loading';
import { useAuth } from '../../hooks/useAuth';
import { FaCheck, FaTimes } from 'react-icons/fa';
import '../../styles/detail.css';

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

  return (
    <div className="page-container">
      <div className="detail-page">
        <h1>{tour.tenTour}</h1>

        {/* Thông tin chung */}
        <div className="tour-info-grid">
          <div className="tour-price">
            <h3>Giá tour</h3>
            <p className="price">Người lớn: {tour.giaNguoiLon?.toLocaleString('vi-VN')}đ</p>
            <p>Trẻ em: {tour.giaTreEm?.toLocaleString('vi-VN')}đ</p>
            <p>Còn lại: {tour.soCho - tour.soChoDaDat} chỗ</p>
            <button className="btn-primary" onClick={handleBooking}>
              Đặt tour ngay
            </button>
          </div>

          <div className="tour-description">
            <p>{tour.moTaChiTiet || tour.moTaNgan}</p>
          </div>
        </div>

        {/* Highlights */}
        {tour.highlights?.length > 0 && (
          <section>
            <h2>✨ Điểm nổi bật</h2>
            <ul className="highlight-list">
              {tour.highlights.map((h, i) => (
                <li key={i}>{h.noiDung}</li>
              ))}
            </ul>
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
                    <div className="schedule-step">{step.thuTu}</div>
                    <div>
                      <h4>{step.tieuDe}</h4>
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
            <div>
              <h3><FaCheck color="green" /> Bao gồm</h3>
              <ul>
                {tour.baoGom
                  .filter((b) => b.loai === 'included')
                  .map((b, i) => (
                    <li key={i}>{b.noiDung}</li>
                  ))}
              </ul>
            </div>
            <div>
              <h3><FaTimes color="red" /> Không bao gồm</h3>
              <ul>
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