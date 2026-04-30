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
    const rating = Math.max(0, Math.min(5, Number(count) || 0));

    return (
      <span className="reviews-page-rating" aria-label={`${rating} trên 5 sao`}>
        <span className="reviews-page-rating-empty">★★★★★</span>
        <span
          className="reviews-page-rating-filled"
          style={{ width: `${(rating / 5) * 100}%` }}
          aria-hidden="true"
        >
          ★★★★★
        </span>
      </span>
    );
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
              <div key={review._id} className="reviews-page-card">
                <div className="reviews-page-card-header">
                  <div className="reviews-page-avatar">
                    {review.user?.hoTen?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="reviews-page-user-info">
                    <span className="reviews-page-user-name">{review.user?.hoTen || 'Ẩn danh'}</span>
                    <span className="reviews-page-date">
                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>

                <div className="reviews-page-stars">
                  {renderStars(review.sao)}
                </div>

                <p className="reviews-page-content">{review.noiDung}</p>

                {review.tour && (
                  <Link to={`/tours/${review.tour._id}`} className="reviews-page-tour-link">
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
