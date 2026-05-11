import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import '../../styles/auth.css';

const Register = () => {
  const [hoTen, setHoTen] = useState('');
  const [email, setEmail] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const passwordHint =
    'Gợi ý mật khẩu an toàn: tối thiểu 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt.';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (matKhau !== xacNhanMatKhau) {
      return toast.error('Mật khẩu xác nhận không khớp');
    }

    setLoading(true);

    try {
      await register(hoTen, email, matKhau);
      toast.success('Đăng ký thành công');
      toast.info('Vui lòng kiểm tra email để xác nhận tài khoản');
      navigate('/login', { state: { email } });
    } catch (error) {
      const apiMessage = error.response?.data?.message;
      toast.error(apiMessage || 'Đăng ký thất bại');
      if (error.response?.data?.suggestLogin) {
        toast.info('Bạn có thể chuyển sang trang đăng nhập để tiếp tục.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>🏖️ Đăng ký</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Họ tên</label>
            <input
              type="text"
              value={hoTen}
              onChange={(e) => setHoTen(e.target.value)}
              placeholder="Nhập họ tên"
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email"
              required
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              value={matKhau}
              onChange={(e) => setMatKhau(e.target.value)}
              placeholder="Nhập mật khẩu"
              minLength={8}
              required
            />
            <small className="auth-note">{passwordHint}</small>
          </div>

          <div className="form-group">
            <label>Xác nhận mật khẩu</label>
            <input
              type="password"
              value={xacNhanMatKhau}
              onChange={(e) => setXacNhanMatKhau(e.target.value)}
              placeholder="Nhập lại mật khẩu"
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </form>

        <p className="auth-switch">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
