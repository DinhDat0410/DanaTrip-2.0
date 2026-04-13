import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaCalendarCheck,
  FaChartLine,
  FaEnvelope,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaRoute,
  FaStar,
  FaUserFriends,
  FaUsers,
  FaEye,
} from 'react-icons/fa';
import API from '../../api/axios';
import Loading from '../../components/common/Loading';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/admin.css';

const periodOptions = [
  { value: 'monthly', label: 'Theo tháng' },
  { value: 'quarterly', label: 'Theo quý' },
  { value: 'yearly', label: 'Theo năm' },
];

const Dashboard = () => {
  const { user } = useAuth();
  const isPartner = user?.vaiTro === 'Partner';
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await API.get('/dashboard/overview');
        setDashboard(res.data?.data || null);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  const series = useMemo(() => {
    if (!dashboard?.revenue) return [];
    return dashboard.revenue[period] || [];
  }, [dashboard, period]);

  if (loading) return <Loading />;
  if (!dashboard) return <div className="admin-page">Không tải được dashboard</div>;

  const maxSeries = Math.max(...series.map((item) => item.total), 1);
  const hotTours = dashboard.hotTours || [];
  const maxHotScore = Math.max(...hotTours.map((item) => item.score || 0), 1);

  const summaryCards = [
    {
      icon: <FaMoneyBillWave />,
      title: isPartner ? 'Doanh thu đối tác' : 'Tổng doanh thu',
      value: `${(dashboard.stats?.totalRevenue || 0).toLocaleString('vi-VN')}đ`,
      tone: 'revenue-icon',
    },
    {
      icon: <FaCalendarCheck />,
      title: 'Số booking',
      value: dashboard.stats?.totalBookings || 0,
      tone: 'booking-icon',
    },
    {
      icon: <FaRoute />,
      title: 'Tour đang hoạt động',
      value: dashboard.stats?.activeTours || 0,
      tone: 'place-icon',
    },
    {
      icon: isPartner ? <FaStar /> : <FaUsers />,
      title: isPartner ? 'Tour hot đang theo dõi' : 'User mới 30 ngày',
      value: isPartner ? hotTours.length : dashboard.stats?.newUsers || 0,
      tone: 'user-icon',
    },
  ];

  const widgets = [];

  if (!isPartner) {
    widgets.push(
      {
        icon: <FaEye />,
        label: 'Lượt truy cập web',
        value: dashboard.stats?.totalVisits || 0,
        note: `${dashboard.stats?.uniqueVisitors || 0} visitor`,
      },
      {
        icon: <FaEnvelope />,
        label: 'Contact gửi về',
        value: dashboard.stats?.totalContacts || 0,
        note: `${dashboard.widgets?.unhandledContacts || 0} chưa xử lý`,
      }
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>{isPartner ? '📊 Dashboard đối tác' : '📊 Dashboard vận hành'}</h1>
        <p>
          {isPartner
            ? 'Theo dõi hiệu quả kinh doanh và booking của tour thuộc doanh nghiệp của bạn.'
            : 'Tổng quan doanh thu, hiệu suất booking, đối tác và hoạt động hệ thống.'}
        </p>
      </div>

      <div className="db-cards">
        {summaryCards.map((card) => (
          <div className="db-card" key={card.title}>
            <div className={`db-card-icon ${card.tone}`}>{card.icon}</div>
            <div className="db-card-info">
              <p>{card.title}</p>
              <h3>{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="db-top-grid">
        <section className="db-panel">
          <div className="table-header">
            <h2><FaChartLine /> Doanh thu theo chu kỳ</h2>
            <select className="filter-select" value={period} onChange={(e) => setPeriod(e.target.value)}>
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="db-revenue-summary">
            <div className="db-summary-pill">
              <span>Tháng hiện tại</span>
              <strong>{(dashboard.revenue?.totals?.month || 0).toLocaleString('vi-VN')}đ</strong>
            </div>
            <div className="db-summary-pill">
              <span>Quý hiện tại</span>
              <strong>{(dashboard.revenue?.totals?.quarter || 0).toLocaleString('vi-VN')}đ</strong>
            </div>
            <div className="db-summary-pill">
              <span>Năm hiện tại</span>
              <strong>{(dashboard.revenue?.totals?.year || 0).toLocaleString('vi-VN')}đ</strong>
            </div>
          </div>

          <div className="db-chart-grid">
            {series.map((item) => (
              <div className="db-chart-col" key={item.label}>
                <div className="db-chart-bar-wrap">
                  <div
                    className="db-chart-bar"
                    style={{ height: `${(item.total / maxSeries) * 100}%` }}
                    title={`${item.label}: ${item.total.toLocaleString('vi-VN')}đ`}
                  />
                </div>
                <span className="db-chart-label">{item.label}</span>
                <strong className="db-chart-value">{item.total > 0 ? `${Math.round(item.total / 1000000)}tr` : '0'}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="db-panel">
          <h2>📌 Trạng thái booking</h2>
          <div className="db-status-grid">
            {Object.entries(dashboard.bookingStatuses || {}).map(([label, value]) => (
              <div className="db-status-card" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>

          {!isPartner && widgets.length > 0 && (
            <div className="db-widget-list">
              {widgets.map((widget) => (
                <div className="db-widget" key={widget.label}>
                  <div className="db-widget-icon">{widget.icon}</div>
                  <div>
                    <p>{widget.label}</p>
                    <h3>{widget.value}</h3>
                    <span>{widget.note}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="db-middle">
        <section className="db-panel">
          <div className="table-header">
            <h2>🔥 Tour hot nhất</h2>
            <Link to="/admin/tours">Xem tour →</Link>
          </div>
          {hotTours.length > 0 ? (
            <div className="db-top-tours">
              {hotTours.map((tour, index) => (
                <div key={tour.id} className="db-top-item">
                  <span className="db-top-rank">#{index + 1}</span>
                  <div className="db-top-info">
                    <p>{tour.tenTour}</p>
                    <small className="db-meta-line">
                      {tour.partnerName} • {tour.bookingCount} booking • {tour.reviewCount} review
                    </small>
                    <div className="db-top-bar-wrap">
                      <div
                        className="db-top-bar"
                        style={{ width: `${((tour.score || 0) / maxHotScore) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="db-top-count">{tour.score}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty">Chưa có dữ liệu tour nổi bật</p>
          )}
        </section>

        <section className="db-panel">
          <div className="table-header">
            <h2>{isPartner ? '💼 Booking gần đây' : '📈 Xu hướng truy cập 7 ngày'}</h2>
            {!isPartner && <span className="db-inline-note">Web traffic</span>}
          </div>
          {isPartner ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tour</th>
                  <th>Trạng thái</th>
                  <th>Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {(dashboard.recentBookings || []).map((booking) => (
                  <tr key={booking._id}>
                    <td>{booking.tourName}</td>
                    <td><span className={`db-status ${getStatusClass(booking.trangThai)}`}>{booking.trangThai}</span></td>
                    <td>{(booking.tongTien || 0).toLocaleString('vi-VN')}đ</td>
                  </tr>
                ))}
                {(dashboard.recentBookings || []).length === 0 && (
                  <tr><td colSpan={3} className="empty">Chưa có booking nào</td></tr>
                )}
              </tbody>
            </table>
          ) : (
            <div className="db-visit-trend">
              {(dashboard.widgets?.visitTrend || []).map((item) => (
                <div key={item.label} className="db-visit-item">
                  <span>{item.label}</span>
                  <div className="db-bar-wrap">
                    <div
                      className="db-bar"
                      style={{ width: `${(item.total / Math.max(...(dashboard.widgets?.visitTrend || []).map((entry) => entry.total), 1)) * 100}%` }}
                    />
                  </div>
                  <strong>{item.total}</strong>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="db-bottom">
        {!isPartner && (
          <section className="db-panel">
            <div className="table-header">
              <h2><FaUserFriends /> Doanh thu từng đối tác</h2>
              <span className="db-inline-note">Theo booking đã thanh toán</span>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Đối tác</th>
                  <th>Tour hoạt động</th>
                  <th>Booking</th>
                  <th>Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {(dashboard.partnerRevenue || []).map((partner) => (
                  <tr key={partner.partnerId || partner.partnerName}>
                    <td>{partner.partnerName}</td>
                    <td>{partner.activeTours}</td>
                    <td>{partner.bookings}</td>
                    <td>{partner.revenue.toLocaleString('vi-VN')}đ</td>
                  </tr>
                ))}
                {(dashboard.partnerRevenue || []).length === 0 && (
                  <tr><td colSpan={4} className="empty">Chưa có dữ liệu đối tác</td></tr>
                )}
              </tbody>
            </table>
          </section>
        )}

        <section className="db-panel">
          <div className="table-header">
            <h2>{isPartner ? '🗺️ Tour nổi bật của bạn' : '📬 Contact gần đây'}</h2>
            {!isPartner && <Link to="/admin/contacts">Xem contact →</Link>}
          </div>

          {isPartner ? (
            <div className="db-top-tours">
              {hotTours.slice(0, 3).map((tour, index) => (
                <div key={tour.id} className="db-mini-card">
                  <div>
                    <strong>#{index + 1} {tour.tenTour}</strong>
                    <p>{tour.bookingCount} booking • {tour.reviewCount} review</p>
                  </div>
                  <span>{tour.score} điểm</span>
                </div>
              ))}
              {hotTours.length === 0 && <p className="empty">Chưa có tour nổi bật</p>}
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Trạng thái</th>
                  <th>Ngày gửi</th>
                </tr>
              </thead>
              <tbody>
                {(dashboard.recentContacts || []).map((contact) => (
                  <tr key={contact._id}>
                    <td>{contact.email}</td>
                    <td>{contact.trangThai}</td>
                    <td>{new Date(contact.createdAt).toLocaleDateString('vi-VN')}</td>
                  </tr>
                ))}
                {(dashboard.recentContacts || []).length === 0 && (
                  <tr><td colSpan={3} className="empty">Chưa có contact nào</td></tr>
                )}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
};

const getStatusClass = (status) => {
  switch (status) {
    case 'Chờ xác nhận':
      return 'pending';
    case 'Đã xác nhận':
      return 'confirmed';
    case 'Đã thanh toán':
      return 'success';
    case 'Đã hủy':
      return 'cancel';
    default:
      return '';
  }
};

export default Dashboard;
