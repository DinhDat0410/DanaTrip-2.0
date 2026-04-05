import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import API from '../../api/axios';
import Loading from '../../components/common/Loading';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import '../../styles/adminForm.css';

const AdminUserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    hoTen: '',
    email: '',
    sdt: '',
    matKhau: '',
    vaiTro: 'User',
    trangThai: 'Hoạt động',
    hienThi: true,
    createdAt: '',
  });

  useEffect(() => {
    if (!isEdit) return;
    const fetchUser = async () => {
      try {
        const res = await API.get(`/users/${id}`);
        const u = res.data.data;
        setForm({
          hoTen: u.hoTen || '',
          email: u.email || '',
          sdt: u.sdt || '',
          matKhau: '',
          vaiTro: u.vaiTro || 'User',
          trangThai: u.trangThai || 'Hoạt động',
          hienThi: u.hienThi !== false,
          createdAt: u.createdAt || '',
        });
      } catch {
        toast.error('Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.hoTen.trim() || !form.email.trim()) {
      toast.error('Vui lòng nhập họ tên và email');
      return;
    }
    if (!isEdit && !form.matKhau.trim()) {
      toast.error('Vui lòng nhập mật khẩu khi tạo mới');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        hoTen: form.hoTen,
        email: form.email,
        sdt: form.sdt,
        vaiTro: form.vaiTro,
        trangThai: form.trangThai,
        hienThi: form.hienThi,
      };
      if (form.matKhau.trim()) {
        payload.matKhau = form.matKhau;
      }

      if (isEdit) {
        await API.put(`/users/${id}`, payload);
        toast.success('Cập nhật người dùng thành công');
      } else {
        await API.post('/users', { ...payload, matKhau: form.matKhau });
        toast.success('Thêm người dùng thành công');
      }
      navigate('/admin/users');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>{isEdit ? '✏️ Chỉnh sửa người dùng' : '➕ Thêm người dùng mới'}</h1>
        <Link to="/admin/users" className="btn-back-sm">
          <FaArrowLeft /> Quay lại
        </Link>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        {/* Thông tin cơ bản */}
        <div className="form-section">
          <h2>Thông tin tài khoản</h2>
          <div className="form-grid">
            <div>
              <label>Họ tên <span className="required">*</span></label>
              <input
                type="text"
                name="hoTen"
                value={form.hoTen}
                onChange={handleChange}
                placeholder="Nhập họ tên"
                required
              />
            </div>
            <div>
              <label>Email <span className="required">*</span></label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="example@email.com"
                required
              />
            </div>
            <div>
              <label>Số điện thoại</label>
              <input
                type="text"
                name="sdt"
                value={form.sdt}
                onChange={handleChange}
                placeholder="0xxxxxxxxx"
              />
            </div>
            <div>
              <label>
                Mật khẩu {isEdit && <span className="field-note">(để trống = giữ nguyên)</span>}
                {!isEdit && <span className="required"> *</span>}
              </label>
              <input
                type="password"
                name="matKhau"
                value={form.matKhau}
                onChange={handleChange}
                placeholder={isEdit ? 'Nhập mật khẩu mới (tùy chọn)' : 'Nhập mật khẩu'}
                minLength={form.matKhau ? 6 : undefined}
              />
            </div>
          </div>
        </div>

        {/* Vai trò & Trạng thái */}
        <div className="form-section">
          <h2>Vai trò & Trạng thái</h2>
          <div className="form-grid">
            <div>
              <label>Vai trò</label>
              <select name="vaiTro" value={form.vaiTro} onChange={handleChange}>
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div>
              <label>Trạng thái</label>
              <select name="trangThai" value={form.trangThai} onChange={handleChange}>
                <option value="Hoạt động">Hoạt động</option>
                <option value="Bị khóa">Bị khóa</option>
              </select>
            </div>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="hienThi"
                  checked={form.hienThi}
                  onChange={handleChange}
                />
                Kích hoạt / Hiển thị tài khoản
              </label>
            </div>
            {isEdit && form.createdAt && (
              <div>
                <label>Ngày tạo</label>
                <input
                  type="text"
                  value={new Date(form.createdAt).toLocaleString('vi-VN')}
                  readOnly
                  style={{ background: '#f5f5f5', cursor: 'default' }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <Link to="/admin/users" className="btn-back-sm">
            <FaArrowLeft /> Quay lại
          </Link>
          <button type="submit" className="btn-save" disabled={saving}>
            <FaSave /> {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminUserEdit;
