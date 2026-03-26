import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Loading from '../../components/common/Loading';
import { toast } from 'react-toastify';
import { FaSave, FaArrowLeft, FaPlus, FaTrash } from 'react-icons/fa';
import '../../styles/adminForm.css';

const AdminTourEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [places, setPlaces] = useState([]);

  const [form, setForm] = useState({
    tenTour: '',
    moTaNgan: '',
    moTaChiTiet: '',
    diaDiem: '',
    giaNguoiLon: 0,
    giaTreEm: 0,
    soCho: 20,
    ngayKhoiHanh: '',
    hienThi: true,
    tags: [],
    highlights: [],
    lichTrinh: [],
    baoGom: [],
  });

  // Load places cho dropdown + load tour nếu edit
  useEffect(() => {
    const fetchData = async () => {
      try {
        const placesRes = await API.get('/places');
        setPlaces(placesRes.data.data || []);

        if (isEdit) {
          const tourRes = await API.get(`/tours/${id}`);
          const data = tourRes.data.data;
          setForm({
            tenTour: data.tenTour || '',
            moTaNgan: data.moTaNgan || '',
            moTaChiTiet: data.moTaChiTiet || '',
            diaDiem: data.diaDiem?._id || data.diaDiem || '',
            giaNguoiLon: data.giaNguoiLon || 0,
            giaTreEm: data.giaTreEm || 0,
            soCho: data.soCho || 20,
            ngayKhoiHanh: data.ngayKhoiHanh ? data.ngayKhoiHanh.split('T')[0] : '',
            hienThi: data.hienThi !== false,
            tags: data.tags || [],
            highlights: data.highlights || [],
            lichTrinh: data.lichTrinh || [],
            baoGom: data.baoGom || [],
          });
        }
      } catch (error) {
        toast.error('Lỗi tải dữ liệu');
        navigate('/admin/tours');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  // === Tags ===
  const [tagInput, setTagInput] = useState('');
  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };
  const removeTag = (index) => {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((_, i) => i !== index) }));
  };

  // === Highlights ===
  const addHighlight = () => {
    setForm((prev) => ({ ...prev, highlights: [...prev.highlights, { noiDung: '' }] }));
  };
  const updateHighlight = (index, value) => {
    setForm((prev) => {
      const updated = [...prev.highlights];
      updated[index] = { noiDung: value };
      return { ...prev, highlights: updated };
    });
  };
  const removeHighlight = (index) => {
    setForm((prev) => ({ ...prev, highlights: prev.highlights.filter((_, i) => i !== index) }));
  };

  // === Lịch trình ===
  const addLichTrinh = () => {
    setForm((prev) => ({
      ...prev,
      lichTrinh: [...prev.lichTrinh, { thuTu: prev.lichTrinh.length + 1, tieuDe: '', moTa: '' }],
    }));
  };
  const updateLichTrinh = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.lichTrinh];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, lichTrinh: updated };
    });
  };
  const removeLichTrinh = (index) => {
    setForm((prev) => ({
      ...prev,
      lichTrinh: prev.lichTrinh.filter((_, i) => i !== index).map((lt, i) => ({ ...lt, thuTu: i + 1 })),
    }));
  };

  // === Bao gồm ===
  const addBaoGom = (loai) => {
    setForm((prev) => ({ ...prev, baoGom: [...prev.baoGom, { noiDung: '', loai }] }));
  };
  const updateBaoGom = (index, value) => {
    setForm((prev) => {
      const updated = [...prev.baoGom];
      updated[index] = { ...updated[index], noiDung: value };
      return { ...prev, baoGom: updated };
    });
  };
  const removeBaoGom = (index) => {
    setForm((prev) => ({ ...prev, baoGom: prev.baoGom.filter((_, i) => i !== index) }));
  };

  // === Submit ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tenTour.trim()) return toast.error('Vui lòng nhập tên tour');

    setSubmitting(true);
    try {
      if (isEdit) {
        await API.put(`/tours/${id}`, form);
        toast.success('Cập nhật tour thành công!');
      } else {
        await API.post('/tours', form);
        toast.success('Thêm tour thành công!');
      }
      navigate('/admin/tours');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi lưu');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>{isEdit ? '✏️ Sửa tour' : '➕ Thêm tour mới'}</h1>
        <button onClick={() => navigate('/admin/tours')} className="btn-back-admin">
          <FaArrowLeft /> Quay lại
        </button>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        {/* Thông tin cơ bản */}
        <div className="form-section">
          <h2>📋 Thông tin cơ bản</h2>
          <div className="form-grid">
            <div className="form-group span-2">
              <label>Tên tour *</label>
              <input type="text" name="tenTour" value={form.tenTour} onChange={handleChange} placeholder="VD: Tour Sơn Trà 1 ngày" required />
            </div>
            <div className="form-group">
              <label>Địa điểm</label>
              <select name="diaDiem" value={form.diaDiem} onChange={handleChange}>
                <option value="">-- Chọn địa điểm --</option>
                {places.map((p) => (
                  <option key={p._id} value={p._id}>{p.tenDiaDiem}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Ngày khởi hành</label>
              <input type="date" name="ngayKhoiHanh" value={form.ngayKhoiHanh} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Giá người lớn *</label>
              <input type="number" name="giaNguoiLon" value={form.giaNguoiLon} onChange={handleChange} min="0" />
            </div>
            <div className="form-group">
              <label>Giá trẻ em</label>
              <input type="number" name="giaTreEm" value={form.giaTreEm} onChange={handleChange} min="0" />
            </div>
            <div className="form-group">
              <label>Số chỗ</label>
              <input type="number" name="soCho" value={form.soCho} onChange={handleChange} min="1" />
            </div>
            <div className="form-group checkbox-group">
              <label><input type="checkbox" name="hienThi" checked={form.hienThi} onChange={handleChange} /> Hiển thị</label>
            </div>
          </div>

          <div className="form-group">
            <label>Mô tả ngắn</label>
            <textarea name="moTaNgan" value={form.moTaNgan} onChange={handleChange} rows={2} placeholder="Mô tả ngắn hiển thị ở danh sách..." />
          </div>
          <div className="form-group">
            <label>Mô tả chi tiết</label>
            <textarea name="moTaChiTiet" value={form.moTaChiTiet} onChange={handleChange} rows={5} placeholder="Mô tả chi tiết đầy đủ..." />
          </div>
        </div>

        {/* Tags */}
        <div className="form-section">
          <h2>🏷️ Tags</h2>
          <div className="tag-input-row">
            <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Nhập tag (VD: nature, adventure)" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} />
            <button type="button" onClick={addTag} className="btn-add-item">Thêm</button>
          </div>
          <div className="tags-list">
            {form.tags.map((tag, i) => (
              <span key={i} className="tag-chip">
                {tag}
                <button type="button" onClick={() => removeTag(i)}>×</button>
              </span>
            ))}
          </div>
        </div>

        {/* Highlights */}
        <div className="form-section">
          <div className="section-header">
            <h2>✨ Điểm nổi bật</h2>
            <button type="button" onClick={addHighlight} className="btn-add-item"><FaPlus /> Thêm</button>
          </div>
          {form.highlights.map((h, i) => (
            <div key={i} className="dynamic-item">
              <input type="text" value={h.noiDung} onChange={(e) => updateHighlight(i, e.target.value)} placeholder="Điểm nổi bật..." className="flex-input" />
              <button type="button" onClick={() => removeHighlight(i)} className="btn-remove-item"><FaTrash /></button>
            </div>
          ))}
          {form.highlights.length === 0 && <p className="empty-hint">Chưa có. Nhấn "Thêm" để thêm.</p>}
        </div>

        {/* Lịch trình */}
        <div className="form-section">
          <div className="section-header">
            <h2>📋 Lịch trình</h2>
            <button type="button" onClick={addLichTrinh} className="btn-add-item"><FaPlus /> Thêm</button>
          </div>
          {form.lichTrinh.map((lt, i) => (
            <div key={i} className="dynamic-item schedule-item">
              <span className="item-number">{lt.thuTu}</span>
              <div className="dynamic-item-fields">
                <input type="text" value={lt.tieuDe} onChange={(e) => updateLichTrinh(i, 'tieuDe', e.target.value)} placeholder="Tiêu đề (VD: Sáng)" />
                <input type="text" value={lt.moTa} onChange={(e) => updateLichTrinh(i, 'moTa', e.target.value)} placeholder="Mô tả hoạt động" />
              </div>
              <button type="button" onClick={() => removeLichTrinh(i)} className="btn-remove-item"><FaTrash /></button>
            </div>
          ))}
          {form.lichTrinh.length === 0 && <p className="empty-hint">Chưa có lịch trình.</p>}
        </div>

        {/* Bao gồm / Không bao gồm */}
        <div className="form-section">
          <div className="section-header">
            <h2>✅ Bao gồm / ❌ Không bao gồm</h2>
            <div className="btn-group">
              <button type="button" onClick={() => addBaoGom('included')} className="btn-add-item">✅ Thêm</button>
              <button type="button" onClick={() => addBaoGom('excluded')} className="btn-add-item btn-add-excluded">❌ Thêm</button>
            </div>
          </div>
          {form.baoGom.map((bg, i) => (
            <div key={i} className={`dynamic-item ${bg.loai === 'included' ? 'included' : 'excluded'}`}>
              <span className="item-label">{bg.loai === 'included' ? '✅' : '❌'}</span>
              <input type="text" value={bg.noiDung} onChange={(e) => updateBaoGom(i, e.target.value)} placeholder="Nội dung..." className="flex-input" />
              <button type="button" onClick={() => removeBaoGom(i)} className="btn-remove-item"><FaTrash /></button>
            </div>
          ))}
          {form.baoGom.length === 0 && <p className="empty-hint">Chưa có.</p>}
        </div>

        {/* Submit */}
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/admin/tours')} className="btn-cancel-form">Hủy</button>
          <button type="submit" className="btn-save" disabled={submitting}>
            <FaSave /> {submitting ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm mới'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminTourEdit;