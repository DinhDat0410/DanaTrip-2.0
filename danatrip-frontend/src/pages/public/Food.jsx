import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import '../../styles/searchBar.css';

const Foods = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const params = search ? `?search=${search}` : '';
        const res = await API.get(`/foods${params}`);
        setFoods(res.data.data || []);
      } catch (error) {
        console.error('Lỗi:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFoods();
  }, [search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    setSearch(e.target.elements.search.value);
  };

  if (loading) return <Loading />;

  return (
    <div className="page-container">
      <h1>🍜 Ẩm thực Đà Nẵng</h1>

      {/* Thanh tìm kiếm */}
      <form onSubmit={handleSearch} className="search-bar">
        <input
          type="text"
          name="search"
          placeholder="Tìm món ăn... (vd: bún, mì quảng)"
          className="search-input"
        />
        <button type="submit" className="btn-search">Tìm kiếm</button>
      </form>

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
      {foods.length === 0 && <p>Không tìm thấy món ăn nào.</p>}
    </div>
  );
};

export default Foods;