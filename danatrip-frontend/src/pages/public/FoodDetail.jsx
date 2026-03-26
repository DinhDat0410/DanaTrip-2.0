import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../api/axios';
import Loading from '../../components/common/Loading';
import { FaUtensils, FaListOl, FaStore, FaArrowLeft } from 'react-icons/fa';
import '../../styles/foodDetail.css';
import '../../styles/detail.css';

const FoodDetail = () => {
  const { id } = useParams();
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFood = async () => {
      try {
        const res = await API.get(`/foods/${id}`);
        setFood(res.data.data);
      } catch (error) {
        console.error('Lỗi:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFood();
  }, [id]);

  if (loading) return <Loading />;
  if (!food) return <p className="page-container">Không tìm thấy món ăn</p>;

  return (
    <div className="page-container">
      <div className="food-detail">
        {/* Header */}
        <div className="food-header">
          <img
            src={food.hinhAnh || '/images/placeholder.jpg'}
            alt={food.tenMon}
            className="food-hero-image"
          />
          <div className="food-header-info">
            <h1>{food.tenMon}</h1>
            <p className="food-description">{food.moTa}</p>
          </div>
        </div>

        {/* Album ảnh */}
        {food.albumAnh?.length > 0 && (
          <section className="food-section">
            <h2>📸 Hình ảnh</h2>
            <div className="food-gallery">
              {food.albumAnh.map((img, i) => (
                <img key={i} src={img.urlAnh} alt={`${food.tenMon} ${i + 1}`} />
              ))}
            </div>
          </section>
        )}

        {/* Nguyên liệu */}
        {food.nguyenLieu?.length > 0 && (
          <section className="food-section">
            <h2><FaUtensils /> Nguyên liệu</h2>
            <div className="ingredient-grid">
              {food.nguyenLieu.map((nl, i) => (
                <div key={i} className="ingredient-item">
                  <span className="ingredient-number">{i + 1}</span>
                  <span>{nl.tenNguyenLieu}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Quy trình chế biến */}
        {food.quyTrinh?.length > 0 && (
          <section className="food-section">
            <h2><FaListOl /> Quy trình chế biến</h2>
            <div className="cooking-steps">
              {food.quyTrinh
                .sort((a, b) => a.thuTu - b.thuTu)
                .map((step, i) => (
                  <div key={i} className="cooking-step">
                    <div className="step-number">Bước {step.thuTu}</div>
                    <div className="step-content">
                      <p>{step.moTaBuoc}</p>
                      {step.thoiGian && (
                        <span className="step-time">⏱️ {step.thoiGian}</span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Quán ăn gợi ý */}
        {food.quanAn?.length > 0 && (
          <section className="food-section">
            <h2><FaStore /> Quán ăn gợi ý</h2>
            <div className="restaurant-grid">
              {food.quanAn.map((qa, i) => (
                <div key={i} className="restaurant-card">
                  <h3>{qa.tenQuanAn}</h3>
                  {qa.diaChi && <p>📍 {qa.diaChi}</p>}
                  {qa.sdt && <p>📞 {qa.sdt}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        <Link to="/foods" className="btn-back">
          <FaArrowLeft /> Quay lại danh sách
        </Link>
      </div>
    </div>
  );
};

export default FoodDetail;