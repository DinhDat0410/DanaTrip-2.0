import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import Loading from "../../components/common/Loading";
import { toast } from "react-toastify";
import { FaSave, FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";
import "../../styles/adminForm.css";
import ImageUpload from "../../components/common/ImageUpload";

const AdminPlaceEdit = () => {
  const { id } = useParams(); // nếu có id → sửa, không có → thêm mới
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    tenDiaDiem: "",
    noiDung: "",
    hinhAnhChinh: "",
    viTri: "Đà Nẵng",
    hienThi: true,
    diemThamQuan: [],
    view360: [],
  });

  // Load dữ liệu khi sửa
  useEffect(() => {
    if (isEdit) {
      const fetchPlace = async () => {
        try {
          const res = await API.get(`/places/${id}`);
          const data = res.data.data;
          setForm({
            tenDiaDiem: data.tenDiaDiem || "",
            noiDung: data.noiDung || "",
            hinhAnhChinh: data.hinhAnhChinh || "",
            viTri: data.viTri || "Đà Nẵng",
            hienThi: data.hienThi !== false,
            diemThamQuan: data.diemThamQuan || [],
            view360: data.view360 || [],
          });
        } catch (error) {
          toast.error("Không tìm thấy địa điểm");
          navigate("/admin/places");
        } finally {
          setLoading(false);
        }
      };
      fetchPlace();
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // === Điểm tham quan ===
  const addDiemThamQuan = () => {
    setForm((prev) => ({
      ...prev,
      diemThamQuan: [...prev.diemThamQuan, { tenDiem: "", moTa: "" }],
    }));
  };

  const updateDiemThamQuan = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.diemThamQuan];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, diemThamQuan: updated };
    });
  };

  const removeDiemThamQuan = (index) => {
    setForm((prev) => ({
      ...prev,
      diemThamQuan: prev.diemThamQuan.filter((_, i) => i !== index),
    }));
  };

  // === View 360 ===
  const addView360 = () => {
    setForm((prev) => ({
      ...prev,
      view360: [...prev.view360, { tieuDe: "", link360: "" }],
    }));
  };

  const updateView360 = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.view360];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, view360: updated };
    });
  };

  const removeView360 = (index) => {
    setForm((prev) => ({
      ...prev,
      view360: prev.view360.filter((_, i) => i !== index),
    }));
  };

  // === Submit ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tenDiaDiem.trim())
      return toast.error("Vui lòng nhập tên địa điểm");

    setSubmitting(true);
    try {
      if (isEdit) {
        await API.put(`/places/${id}`, form);
        toast.success("Cập nhật địa điểm thành công!");
      } else {
        await API.post("/places", form);
        toast.success("Thêm địa điểm thành công!");
      }
      navigate("/admin/places");
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi lưu");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>{isEdit ? "✏️ Sửa địa điểm" : "➕ Thêm địa điểm mới"}</h1>
        <button
          onClick={() => navigate("/admin/places")}
          className="btn-back-admin"
        >
          <FaArrowLeft /> Quay lại
        </button>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        {/* Thông tin cơ bản */}
        <div className="form-section">
          <h2>📋 Thông tin cơ bản</h2>

          <div className="form-grid">
            <div className="form-group">
              <label>Tên địa điểm *</label>
              <input
                type="text"
                name="tenDiaDiem"
                value={form.tenDiaDiem}
                onChange={handleChange}
                placeholder="VD: Bà Nà Hills"
                required
              />
            </div>

            <div className="form-group">
              <label>Vị trí</label>
              <input
                type="text"
                name="viTri"
                value={form.viTri}
                onChange={handleChange}
                placeholder="VD: Đà Nẵng"
              />
            </div>

            <div className="form-group span-2">
              <ImageUpload
                label="Hình ảnh chính"
                value={form.hinhAnhChinh}
                onChange={(url) =>
                  setForm((prev) => ({ ...prev, hinhAnhChinh: url }))
                }
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="hienThi"
                  checked={form.hienThi}
                  onChange={handleChange}
                />
                Hiển thị trên trang web
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Nội dung mô tả</label>
            <textarea
              name="noiDung"
              value={form.noiDung}
              onChange={handleChange}
              rows={5}
              placeholder="Mô tả chi tiết về địa điểm..."
            />
          </div>
        </div>

        {/* Điểm tham quan */}
        <div className="form-section">
          <div className="section-header">
            <h2>🏛️ Điểm tham quan</h2>
            <button
              type="button"
              onClick={addDiemThamQuan}
              className="btn-add-item"
            >
              <FaPlus /> Thêm
            </button>
          </div>

          {form.diemThamQuan.map((diem, i) => (
            <div key={i} className="dynamic-item">
              <div className="dynamic-item-fields">
                <input
                  type="text"
                  value={diem.tenDiem}
                  onChange={(e) =>
                    updateDiemThamQuan(i, "tenDiem", e.target.value)
                  }
                  placeholder="Tên điểm tham quan"
                />
                <input
                  type="text"
                  value={diem.moTa}
                  onChange={(e) =>
                    updateDiemThamQuan(i, "moTa", e.target.value)
                  }
                  placeholder="Mô tả"
                />
              </div>
              <button
                type="button"
                onClick={() => removeDiemThamQuan(i)}
                className="btn-remove-item"
              >
                <FaTrash />
              </button>
            </div>
          ))}

          {form.diemThamQuan.length === 0 && (
            <p className="empty-hint">
              Chưa có điểm tham quan. Nhấn "Thêm" để thêm mới.
            </p>
          )}
        </div>

        {/* View 360 */}
        <div className="form-section">
          <div className="section-header">
            <h2>🌐 View 360°</h2>
            <button type="button" onClick={addView360} className="btn-add-item">
              <FaPlus /> Thêm
            </button>
          </div>

          {form.view360.map((view, i) => (
            <div key={i} className="dynamic-item">
              <div className="dynamic-item-fields">
                <input
                  type="text"
                  value={view.tieuDe}
                  onChange={(e) => updateView360(i, "tieuDe", e.target.value)}
                  placeholder="Tiêu đề"
                />
                <input
                  type="text"
                  value={view.link360}
                  onChange={(e) => updateView360(i, "link360", e.target.value)}
                  placeholder="Link 360°"
                />
              </div>
              <button
                type="button"
                onClick={() => removeView360(i)}
                className="btn-remove-item"
              >
                <FaTrash />
              </button>
            </div>
          ))}

          {form.view360.length === 0 && (
            <p className="empty-hint">
              Chưa có view 360°. Nhấn "Thêm" để thêm mới.
            </p>
          )}
        </div>

        {/* Submit */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate("/admin/places")}
            className="btn-cancel-form"
          >
            Hủy
          </button>
          <button type="submit" className="btn-save" disabled={submitting}>
            <FaSave />{" "}
            {submitting ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm mới"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminPlaceEdit;
