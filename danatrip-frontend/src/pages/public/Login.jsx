import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../config/firebase';
import API from '../../api/axios';
import { FaGoogle } from 'react-icons/fa';
import '../../styles/auth.css';

const ADMIN_PANEL_ROLES = ['Admin', 'WebsiteManager', 'Partner'];

const Login = () => {
  const [email, setEmail] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const { login, socialLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
      setNeedsVerification(true);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(email, matKhau);
      toast.success(`Xin chào, ${user.hoTen}!`);

      if (ADMIN_PANEL_ROLES.includes(user.vaiTro)) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      if (error.response?.data?.emailVerificationRequired) {
        setNeedsVerification(true);
      }
      toast.error(error.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      return toast.error('Vui lòng nhập email để gửi lại xác nhận');
    }

    setResending(true);
    try {
      const res = await API.post('/auth/resend-verification-email', { email });
      toast.success(res.data?.message || 'Đã gửi lại email xác nhận');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không gửi được email xác nhận');
    } finally {
      setResending(false);
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
      navigate(ADMIN_PANEL_ROLES.includes(user.vaiTro) ? '/admin' : '/');
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

        {needsVerification && (
          <div className="auth-notice">
            <p>Tài khoản này cần xác nhận email trước khi đăng nhập.</p>
            <button type="button" className="auth-link-button" onClick={handleResendVerification} disabled={resending}>
              {resending ? 'Đang gửi...' : 'Gửi lại email xác nhận'}
            </button>
          </div>
        )}

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

          <div className="auth-actions">
            <Link to="/forgot-password" className="auth-link">
              Quên mật khẩu?
            </Link>
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
