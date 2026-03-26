import { useState } from 'react';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';
import '../../styles/contact.css';

const Contact = () => {
  const [form, setForm] = useState({ ten: '', email: '', noiDung: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/contacts', form);
      toast.success('Gửi liên hệ thành công!');
      setForm({ ten: '', email: '', noiDung: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gửi thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1>📞 Liên hệ với chúng tôi</h1>

      <div className="contact-page">
        {/* Info bên trái */}
        <div className="contact-info">
          <h2>Hãy liên hệ ngay!</h2>
          <p>
            Bạn có thắc mắc về tour, địa điểm hay cần tư vấn lịch trình?
            Đội ngũ DANATrip luôn sẵn sàng hỗ trợ bạn.
          </p>

          <div className="contact-items">
            <div className="contact-item">
              <div className="contact-item-icon"><FaMapMarkerAlt /></div>
              <div>
                <strong>Địa chỉ</strong>
                <p>123 Nguyễn Văn Linh, Đà Nẵng</p>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-item-icon"><FaPhone /></div>
              <div>
                <strong>Điện thoại</strong>
                <p>0901 234 567</p>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-item-icon"><FaEnvelope /></div>
              <div>
                <strong>Email</strong>
                <p>info@danatrip.com</p>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-item-icon"><FaClock /></div>
              <div>
                <strong>Giờ làm việc</strong>
                <p>8:00 - 21:00 (T2 - CN)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form bên phải */}
        <div className="contact-form">
          <h2>Gửi tin nhắn</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Họ tên</label>
              <input type="text" value={form.ten} onChange={(e) => setForm({ ...form, ten: e.target.value })} placeholder="Nhập họ tên" required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Nhập email" required />
            </div>
            <div className="form-group">
              <label>Nội dung</label>
              <textarea value={form.noiDung} onChange={(e) => setForm({ ...form, noiDung: e.target.value })} rows={5} placeholder="Nhập nội dung tin nhắn..." required />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Đang gửi...' : '✉️ Gửi liên hệ'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;