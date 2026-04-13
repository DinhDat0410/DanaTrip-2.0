import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../../api/axios';
import '../../styles/auth.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [matKhau, setMatKhau] = useState('');
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (matKhau.length < 6) {
      return toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
    }

    if (matKhau !== xacNhanMatKhau) {
      return toast.error('Mật khẩu xác nhận không khớp');
    }

    setLoading(true);

    try {
      const res = await API.put(`/auth/reset-password/${token}`, { matKhau });
      toast.success(res.data?.message || 'Đặt lại mật khẩu thành công');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không đặt lại được mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>🗝️ Đặt lại mật khẩu</h2>
        <p className="auth-helper">
          Nhập mật khẩu mới cho tài khoản của bạn. Link này chỉ dùng được trong thời gian ngắn.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Mật khẩu mới</label>
            <input
              type="password"
              value={matKhau}
              onChange={(e) => setMatKhau(e.target.value)}
              placeholder="Nhập mật khẩu mới"
              required
            />
          </div>

          <div className="form-group">
            <label>Xác nhận mật khẩu</label>
            <input
              type="password"
              value={xacNhanMatKhau}
              onChange={(e) => setXacNhanMatKhau(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
          </button>
        </form>

        <p className="auth-switch">
          <Link to="/login">Quay lại đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
