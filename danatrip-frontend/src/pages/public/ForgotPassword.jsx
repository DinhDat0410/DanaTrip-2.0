import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../../api/axios';
import '../../styles/auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post('/auth/forgot-password', { email });
      toast.success(res.data?.message || 'Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu');
      setEmail('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không gửi được email đặt lại mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>🔐Quên mật khẩu</h2>
        <p className="auth-helper">
          Nhập email tài khoản của bạn. 
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
          </button>
        </form>

        <p className="auth-switch">
          Nhớ mật khẩu rồi? <Link to="/login">Quay lại đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
