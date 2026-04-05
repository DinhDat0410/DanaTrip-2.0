import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import '../../styles/searchBar.css';

const Places = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const res = await API.get(`/places${search ? '?search=' + search : ''}`);
        setPlaces(res.data.data || []);
      } catch (error) {
        console.error('Lỗi:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaces();
  }, [search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    setSearch(e.target.elements.search.value);
  };

  if (loading) return <Loading />;

  return (
    <div className="page-container">
      <h1>📍 Địa điểm du lịch Đà Nẵng</h1>

      {/* Thanh tìm kiếm */}
      <form onSubmit={handleSearch} className="search-bar">
        <input
          type="text"
          name="search"
          placeholder="Tìm địa điểm... (vd: Bà Nà, Sơn Trà)"
          className="search-input"
        />
        <button type="submit" className="btn-search">Tìm kiếm</button>
      </form>

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
      {places.length === 0 && <p>Không tìm thấy địa điểm nào.</p>}
    </div>
  );
};

export default Places;