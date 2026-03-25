import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';

const Places = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const res = await API.get('/places');
        setPlaces(res.data.data || []);
      } catch (error) {
        console.error('Lỗi:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaces();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="page-container">
      <h1>📍 Địa điểm du lịch Đà Nẵng</h1>
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
      {places.length === 0 && <p>Chưa có địa điểm nào.</p>}
    </div>
  );
};

export default Places;