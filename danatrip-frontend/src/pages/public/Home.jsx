import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import '../../styles/home.css';

const heroImages = [
  '/images/danang-hero.jpg',
  '/images/danang-hero2.jpg',
  '/images/danang-hero3.jpg',
];

const Home = () => {
  const [places, setPlaces] = useState([]);
  const [tours, setTours] = useState([]);
  const [foods, setFoods] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);

  // Cycles hero background images
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [placesRes, toursRes, foodsRes] = await Promise.all([
          API.get('/places'),
          API.get('/tours'),
          API.get('/foods'),
        ]);
        setPlaces(placesRes.data.data?.slice(0, 4) || []);
        setTours(toursRes.data.data?.slice(0, 4) || []);
        setFoods(foodsRes.data.data?.slice(0, 4) || []);

        // Reviews endpoint requires admin auth — log non-auth errors and skip
        try {
          const reviewsRes = await API.get('/reviews');
          setReviews(reviewsRes.data.data?.slice(0, 6) || []);
        } catch (reviewsErr) {
          if (reviewsErr.response?.status !== 401 && reviewsErr.response?.status !== 403) {
            console.error('Lỗi tải đánh giá:', reviewsErr);
          }
        }
      } catch (error) {
        console.error('Lỗi tải dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="home">
      {/* Hero with cycling background */}
      <section
        className="hero"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.5), rgba(0,0,0,0.28)), url('${heroImages[heroIndex]}')`,
        }}
      >
        <div className="hero-content">
          <h1>Khám phá Đà Nẵng</h1>
          <p>Thành phố đáng sống nhất Việt Nam — Biển xanh, cát trắng, nắng vàng</p>
          <Link to="/tours" className="btn-primary">
            🗺️ Khám phá ngay
          </Link>
        </div>
        <div className="hero-dots">
          {heroImages.map((_, i) => (
            <button
              key={i}
              className={`hero-dot${i === heroIndex ? ' active' : ''}`}
              onClick={() => setHeroIndex(i)}
              aria-label={`Hero image ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <h3>{places.length}+</h3>
          <p>Địa điểm</p>
        </div>
        <div className="stat-item">
          <h3>{tours.length}+</h3>
          <p>Tour du lịch</p>
        </div>
        <div className="stat-item">
          <h3>{foods.length}+</h3>
          <p>Món đặc sản</p>
        </div>
      </div>

      {/* Intro Section */}
      <section className="intro-section">
        <div className="intro-inner">
          <h2>Tại sao nên chọn Đà Nẵng?</h2>
          <p className="intro-desc">
            Đà Nẵng — thành phố của những điều kỳ diệu. Với bãi biển xanh biếc, ẩm thực phong phú,
            lịch sử văn hóa độc đáo và con người thân thiện, đây là điểm đến không thể bỏ qua khi
            du lịch Việt Nam.
          </p>
          <div className="intro-features">
            <div className="intro-feature">
              <span className="feature-icon">🏖️</span>
              <h3>Biển đẹp nhất</h3>
              <p>Bãi biển Mỹ Khê, Non Nước với làn nước trong xanh tuyệt đẹp</p>
            </div>
            <div className="intro-feature">
              <span className="feature-icon">🍜</span>
              <h3>Ẩm thực đặc sắc</h3>
              <p>Mì Quảng, Bún cá, Bánh mì Đà Nẵng nức tiếng khắp nơi</p>
            </div>
            <div className="intro-feature">
              <span className="feature-icon">🌉</span>
              <h3>Cây cầu độc đáo</h3>
              <p>Cầu Rồng, Cầu Vàng Bà Nà Hills — biểu tượng của Đà Nẵng</p>
            </div>
            <div className="intro-feature">
              <span className="feature-icon">🎉</span>
              <h3>Lễ hội sôi động</h3>
              <p>Lễ hội pháo hoa quốc tế DIFF hàng năm thu hút hàng triệu du khách</p>
            </div>
          </div>
        </div>
      </section>

      {/* Địa điểm */}
      <section className="section">
        <div className="section-header">
          <h2>📍 Địa điểm nổi bật</h2>
          <Link to="/places">Xem tất cả →</Link>
        </div>
        <div className="card-slider">
          {places.map((place) => (
            <Card
              key={place._id}
              image={place.hinhAnhChinh}
              title={place.tenDiaDiem}
              description={place.noiDung}
              link={`/places/${place._id}`}
            />
          ))}
        </div>
      </section>

      {/* Tour */}
      <section className="section">
        <div className="section-header">
          <h2>🗺️ Tour du lịch</h2>
          <Link to="/tours">Xem tất cả →</Link>
        </div>
        <div className="card-slider">
          {tours.map((tour) => (
            <Card
              key={tour._id}
              image={tour.hinhAnh?.[0]?.urlAnh}
              title={tour.tenTour}
              description={tour.moTaNgan}
              link={`/tours/${tour._id}`}
              price={tour.giaNguoiLon}
            />
          ))}
        </div>
      </section>

      {/* Ẩm thực */}
      <section className="section">
        <div className="section-header">
          <h2>🍜 Ẩm thực Đà Nẵng</h2>
          <Link to="/foods">Xem tất cả →</Link>
        </div>
        <div className="card-slider">
          {foods.map((food) => (
            <Card
              key={food._id}
              image={food.hinhAnh}
              title={food.tenMon}
              description={food.moTa}
              link={`/foods/${food._id}`}
            />
          ))}
        </div>
      </section>

      {/* Video Section */}
      <section className="video-section">
        <div className="video-section-inner">
          <h2>🎬 Khám Phá Đà Nẵng Qua Video</h2>
          <p>Chiêm ngưỡng vẻ đẹp tuyệt vời của thành phố biển qua góc nhìn flycam</p>
          <div className="video-wrapper">
            <iframe
              src="https://www.youtube.com/embed/o8T3HGgaLQ0"
              title="Khám phá Đà Nẵng"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* Reviews Slider */}
      {reviews.length > 0 && (
        <section className="section reviews-section">
          <div className="section-header">
            <h2>⭐ Du Khách Nói Gì Về Đà Nẵng</h2>
          </div>
          <div className="reviews-slider">
            {reviews.map((review) => (
              <div key={review._id} className="review-card-home">
                <div className="review-avatar">
                  {review.user?.hoTen?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="review-stars">
                  {'★'.repeat(review.sao)}
                  <span className="review-stars-empty">{'★'.repeat(5 - review.sao)}</span>
                </div>
                <p className="review-text">{review.noiDung}</p>
                <span className="review-author">{review.user?.hoTen || 'Khách du lịch'}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;