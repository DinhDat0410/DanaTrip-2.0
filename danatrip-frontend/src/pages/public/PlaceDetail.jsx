import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../api/axios';
import Loading from '../../components/common/Loading';
import { getImageUrl } from '../../utils/image';

const PlaceDetail = () => {
  const { id } = useParams();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const res = await API.get(`/places/${id}`);
        setPlace(res.data.data);
      } catch (error) {
        console.error('Lỗi:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlace();
  }, [id]);

  if (loading) return <Loading />;
  if (!place) return <p>Không tìm thấy địa điểm</p>;

  return (
    <div className="page-container">
      <div className="detail-page">
        <img
          src={getImageUrl(place.hinhAnhChinh)}
          alt={place.tenDiaDiem}
          className="detail-hero-image"
        />

        <h1>{place.tenDiaDiem}</h1>
        <p className="location">📍 {place.viTri}</p>
        <p>{place.noiDung}</p>

        {/* Điểm tham quan */}
        {place.diemThamQuan?.length > 0 && (
          <section>
            <h2>🏛️ Điểm tham quan</h2>
            <div className="card-grid">
              {place.diemThamQuan.map((diem, i) => (
                <div key={i} className="info-card">
                  <h3>{diem.tenDiem}</h3>
                  <p>{diem.moTa}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* View 360 */}
        {place.view360?.length > 0 && (
          <section>
            <h2>🌐 Tham quan 360°</h2>
            {place.view360.map((view, i) => (
              <div key={i}>
                <h3>{view.tieuDe}</h3>
                <a href={view.link360} target="_blank" rel="noreferrer">
                  Xem 360° →
                </a>
              </div>
            ))}
          </section>
        )}

        <Link to="/places" className="btn-back">← Quay lại</Link>
      </div>
    </div>
  );
};

export default PlaceDetail;