import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import API from '../../api/axios';
import '../../styles/auth.css';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Đang xác nhận email...');
  const verifiedTokenRef = useRef(null);
  const redirectTimerRef = useRef(null);

  useEffect(() => {
    if (!token || verifiedTokenRef.current === token) {
      return;
    }

    verifiedTokenRef.current = token;

    const verifyEmail = async () => {
      try {
        await API.get(`/auth/verify-email/${token}`);
        setStatus('success');
        setMessage('Xác nhận thành công');
        redirectTimerRef.current = setTimeout(() => {
          navigate('/login');
        }, 1500);
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Không thể xác nhận email');
      }
    };

    verifyEmail();

    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, [navigate, token]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>{status === 'success' ? 'Xác nhận thành công' : 'Xác nhận email'}</h2>
        <p className={`auth-result ${status}`}>{message}</p>

        <p className="auth-switch">
          {status === 'success' ? (
            <Link to="/login">Đăng nhập ngay</Link>
          ) : (
            <Link to="/login">Quay lại đăng nhập</Link>
          )}
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
