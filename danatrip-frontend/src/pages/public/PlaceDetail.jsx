import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../api/axios';
import Loading from '../../components/common/Loading';
import { getImageUrl } from '../../utils/image';
import '../../styles/placeDetail.css';

const PlaceDetail = () => {
  const { id } = useParams();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [current360, setCurrent360] = useState(0);

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

  const handleRandom360 = () => {
    if (place?.view360?.length > 1) {
      let next;
      do {
        next = Math.floor(Math.random() * place.view360.length);
      } while (next === current360);
      setCurrent360(next);
    }
  };

  if (loading) return <Loading />;
  if (!place) return <p>Không tìm thấy địa điểm</p>;

  const view360Item = place.view360?.[current360];

  return (
    <div className="pd">
      {/* Hero */}
      <div className="pd-hero">
        <div
          className="pd-hero-bg"
          style={{ backgroundImage: `url(${getImageUrl(place.hinhAnhChinh)})` }}
        />
        <div className="pd-hero-overlay">
          <h1>{place.tenDiaDiem}</h1>
          <p>{place.viTri}</p>
        </div>
      </div>

      {/* Content */}
      <div className="pd-content">
        {/* Giới thiệu */}
        {place.noiDung && (
          <section className="pd-section">
            <h2 className="pd-section-title">Giới thiệu</h2>
            <p className="pd-description">{place.noiDung}</p>
          </section>
        )}

        {/* Điểm tham quan chính */}
        {place.diemThamQuan?.length > 0 && (
          <section className="pd-section">
            <h2 className="pd-section-title">Các điểm tham quan chính</h2>
            <div className="pd-spot-grid">
              {place.diemThamQuan.map((diem, i) => (
                <div key={i} className="pd-spot-card">
                  {diem.hinhAnh && (
                    <div
                      className="pd-spot-img"
                      style={{ backgroundImage: `url(${getImageUrl(diem.hinhAnh)})` }}
                    />
                  )}
                  <div className="pd-spot-body">
                    <h3>{diem.tenDiem}</h3>
                    <p>{diem.moTa}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 360° */}
        {place.view360?.length > 0 && view360Item && (
          <section className="pd-section">
            <div className="pd-360-head">
              <h2 className="pd-section-title">Khám phá 360°</h2>
              {place.view360.length > 1 && (
                <button className="pd-btn-switch" onClick={handleRandom360}>
                  Lựa điểm khác
                </button>
              )}
            </div>
            <div className="pd-360-frame">
              <iframe
                src={view360Item.link360}
                title={view360Item.tieuDe || 'View 360°'}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </section>
        )}

        {/* Thông tin hữu ích */}
        {place.thongTin?.length > 0 && (
          <section className="pd-section">
            <h2 className="pd-section-title">Thông tin hữu ích</h2>
            <div className="pd-info-grid">
              {place.thongTin.map((info, i) => (
                <div key={i} className="pd-info-item">
                  <h4>{info.tieuDe}</h4>
                  <p>{info.noiDung}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tour gợi ý */}
        {place.tours?.length > 0 && (
          <section className="pd-section">
            <h2 className="pd-section-title">Tour gợi ý</h2>
            <div className="pd-tour-grid">
              {place.tours.map((tour) => (
                <div key={tour._id} className="pd-tour-card">
                  <div className="pd-tour-card-body">
                    <h4>{tour.tenTour}</h4>
                    <p>{tour.moTaNgan}</p>
                  </div>
                  <Link to={`/tours/${tour._id}`} className="pd-tour-link">
                    Xem chi tiết →
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        <Link to="/places" className="pd-back">← Quay lại danh sách</Link>
      </div>
    </div>
  );
};

export default PlaceDetail;