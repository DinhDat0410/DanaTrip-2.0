import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../config/firebase';
import { FaGoogle } from 'react-icons/fa';
import '../../styles/auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, socialLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(email, matKhau);
      toast.success(`Xin chào, ${user.hoTen}!`);

      if (user.vaiTro === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      const user = await socialLogin(
        firebaseUser.email,
        firebaseUser.displayName,
        firebaseUser.photoURL,
        'google'
      );
      toast.success(`Xin chào, ${user.hoTen}!`);
      navigate(user.vaiTro === 'Admin' ? '/admin' : '/');
    } catch (error) {
      const msg = error.code === 'auth/popup-closed-by-user'
        ? 'Đăng nhập bị hủy'
        : error.code === 'auth/network-request-failed'
        ? 'Lỗi kết nối mạng'
        : 'Đăng nhập Google thất bại';
      toast.error(msg);
      console.error(error);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>🏖️ Đăng nhập</h2>

        <form onSubmit={handleSubmit}>
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
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="social-divider">
          <span>hoặc đăng nhập bằng</span>
        </div>

        <div className="social-buttons">
          <button className="btn-google" onClick={handleGoogleLogin}>
            <FaGoogle /> Google
          </button>
        </div>

        <p className="auth-switch">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;