import { useState } from 'react';
import API from '../../api/axios';
import { toast } from 'react-toastify';

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

      <form onSubmit={handleSubmit} className="contact-form">
        <div className="form-group">
          <label>Họ tên</label>
          <input
            type="text"
            value={form.ten}
            onChange={(e) => setForm({ ...form, ten: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Nội dung</label>
          <textarea
            value={form.noiDung}
            onChange={(e) => setForm({ ...form, noiDung: e.target.value })}
            rows={5}
            required
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Đang gửi...' : 'Gửi liên hệ'}
        </button>
      </form>
    </div>
  );
};

export default Contact;