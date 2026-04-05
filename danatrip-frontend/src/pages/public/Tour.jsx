import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import '../../styles/searchBar.css';

const Tours = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const params = search ? `?search=${encodeURIComponent(search)}` : '';
        const res = await API.get(`/tours${params}`);
        setTours(res.data.data || []);
      } catch (error) {
        console.error('Lỗi:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTours();
  }, [search]);

  const handleSearch = (e) => {
    e.preventDefault();
    const value = e.target.elements.search.value;
    if (value !== search) {
      setLoading(true);
      setSearch(value);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="page-container">
      <h1>🗺️ Tour du lịch Đà Nẵng</h1>

      <form onSubmit={handleSearch} className="search-bar">
        <input
          type="text"
          name="search"
          placeholder="Tìm tour... (vd: Bà Nà, Hội An)"
          className="search-input"
        />
        <button type="submit" className="btn-search">🔍 Tìm kiếm</button>
      </form>

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