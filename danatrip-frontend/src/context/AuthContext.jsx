import { createContext, useState, useEffect } from 'react';
import API from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Kiểm tra token khi app load
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await API.get('/auth/me');
          setUser(res.data.user);
        } catch (error) {
          // Token hết hạn
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  // Đăng nhập
  const login = async (email, matKhau) => {
    const res = await API.post('/auth/login', { email, matKhau });
    const { token: newToken, user: userData } = res.data;

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);

    return userData;
  };

  // Đăng ký
  const register = async (hoTen, email, matKhau) => {
    const res = await API.post('/auth/register', { hoTen, email, matKhau });
    const { token: newToken, user: userData } = res.data;

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);

    return userData;
  };

  // Đăng nhập bằng mạng xã hội
  const socialLogin = async (email, hoTen, avatar, provider) => {
    const res = await API.post('/auth/social-login', { email, hoTen, avatar, provider });
    const { token: newToken, user: userData } = res.data;

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);

    return userData;
  };

  // Đăng xuất
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        socialLogin,
        isAuthenticated: !!token,
        isAdmin: user?.vaiTro === 'Admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};