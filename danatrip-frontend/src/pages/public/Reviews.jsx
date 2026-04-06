import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import Loading from '../../components/common/Loading';
import '../../styles/reviews.css';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await API.get('/reviews/public');
        setReviews(res.data.data || []);
      } catch (error) {
        console.error('Lỗi khi lấy đánh giá:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const renderStars = (count) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < count ? 'star filled' : 'star empty'}>★</span>
    ));
  };

  if (loading) return <Loading />;

  return (
    <div className="page-container">
      <div className="reviews-page">
        <h1>⭐ Đánh giá từ khách hàng</h1>
        <p className="reviews-subtitle">Khám phá những trải nghiệm thực tế từ khách hàng đã sử dụng dịch vụ của chúng tôi</p>

        {reviews.length > 0 ? (
          <div className="reviews-grid">
            {reviews.map((review) => (
              <div key={review._id} className="review-card">
                <div className="review-card-header">
                  <div className="review-avatar">
                    {review.user?.hoTen?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="review-user-info">
                    <span className="review-user-name">{review.user?.hoTen || 'Ẩn danh'}</span>
                    <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>

                <div className="review-stars">
                  {renderStars(review.sao)}
                </div>

                <p className="review-content">{review.noiDung}</p>

                {review.tour && (
                  <Link to={`/tours/${review.tour._id}`} className="review-tour-link">
                    🗺️ {review.tour.tenTour}
                  </Link>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="reviews-empty">
            <p>Chưa có đánh giá nào.</p>
            <Link to="/tours" className="btn-primary">Đặt tour ngay</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
