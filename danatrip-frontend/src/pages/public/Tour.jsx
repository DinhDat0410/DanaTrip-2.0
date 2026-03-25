import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';

const Tours = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const res = await API.get('/tours');
        setTours(res.data.data || []);
      } catch (error) {
        console.error('Lỗi:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTours();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="page-container">
      <h1>🗺️ Tour du lịch Đà Nẵng</h1>
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
      {tours.length === 0 && <p>Chưa có tour nào.</p>}
    </div>
  );
};

export default Tours;