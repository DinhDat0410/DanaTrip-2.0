import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../api/axios';
import Loading from '../../components/common/Loading';
import { FaArrowLeft } from 'react-icons/fa';
import { getImageUrl } from '../../utils/image';
import '../../styles/foodDetail.css';

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

        {/* Title with ĐẶC SẢN ĐÀ NẴNG label */}
        <div className="food-title-wrapper">
          <h1 className="title-mon">{food.tenMon}</h1>
        </div>

        {/* Description */}
        {food.moTa && (
          <p className="food-desc-main">{food.moTa}</p>
        )}

        {/* Image Grid (3 columns) */}
        {food.albumAnh?.length > 0 && (
          <div className="image-wrapper">
            {food.albumAnh.slice(0, 3).map((img, i) => (
              <img key={i} className="anh-mon" src={getImageUrl(img.urlAnh)} alt={`${food.tenMon} ${i + 1}`} />
            ))}
          </div>
        )}

        {/* 2-column layout: left content + right sidebar */}
        <div className="amthuc-layout">

          {/* Left Column */}
          <div className="amthuc-main">

            {/* Giới thiệu */}
            {food.moTaChiTiet && (
              <section className="food-section">
                <h2>📖 Giới thiệu</h2>
                <p>{food.moTaChiTiet}</p>
              </section>
            )}

            {/* Quy trình chế biến */}
            {food.quyTrinh?.length > 0 && (
              <section className="food-section quytrinh">
                <h2>👨‍🍳 Quy trình chế biến</h2>
                <div className="cooking-steps">
                  {food.quyTrinh
                    .sort((a, b) => a.thuTu - b.thuTu)
                    .map((step, i) => (
                      <div key={i} className="cooking-step">
                        <div className="step-number">{step.thuTu}</div>
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
          </div>

          {/* Right Sidebar */}
          <aside className="amthuc-sidebar">

            {/* Nguyên liệu chính */}
            {food.nguyenLieu?.length > 0 && (
              <div className="sidebar-box nguyenlieu-box">
                <h3>🥄 Nguyên liệu chính</h3>
                <ul className="nguyenlieu-list">
                  {food.nguyenLieu.map((nl, i) => (
                    <li key={i}>
                      <span className="ingredient-number">{i + 1}</span>
                      <span>{nl.tenNguyenLieu}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quán ăn nổi tiếng */}
            {food.quanAn?.length > 0 && (
              <div className="sidebar-box quanan">
                <h3>🏪 Quán ăn nổi tiếng</h3>
                {food.quanAn.map((qa, i) => (
                  <div key={i} className="quanan-item">
                    <h4>{qa.tenQuanAn}</h4>
                    {qa.diaChi && <p>📍 {qa.diaChi}</p>}
                    {qa.sdt && <p>📞 {qa.sdt}</p>}
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>

        <Link to="/foods" className="btn-back">
          <FaArrowLeft /> Quay lại danh sách
        </Link>
      </div>
    </div>
  );
};

export default FoodDetail;