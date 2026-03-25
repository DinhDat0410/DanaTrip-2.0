import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import '../../styles/home.css';

const Home = () => {
  const [places, setPlaces] = useState([]);
  const [tours, setTours] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [placesRes, toursRes, foodsRes] = await Promise.all([
          API.get('/places'),
          API.get('/tours'),
          API.get('/foods'),
        ]);
        setPlaces(placesRes.data.data?.slice(0, 3) || []);
        setTours(toursRes.data.data?.slice(0, 3) || []);
        setFoods(foodsRes.data.data?.slice(0, 3) || []);
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
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Khám phá Đà Nẵng</h1>
          <p>Thành phố đáng sống nhất Việt Nam</p>
          <Link to="/tours" className="btn-primary">
            Khám phá ngay
          </Link>
        </div>
      </section>

      {/* Địa điểm nổi bật */}
      <section className="section">
        <div className="section-header">
          <h2>📍 Địa điểm nổi bật</h2>
          <Link to="/places">Xem tất cả →</Link>
        </div>
        <div className="card-grid">
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

      {/* Tour nổi bật */}
      <section className="section">
        <div className="section-header">
          <h2>🗺️ Tour du lịch</h2>
          <Link to="/tours">Xem tất cả →</Link>
        </div>
        <div className="card-grid">
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
        <div className="card-grid">
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
    </div>
  );
};

export default Home;