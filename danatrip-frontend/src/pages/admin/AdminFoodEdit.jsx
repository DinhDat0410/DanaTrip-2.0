import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import Loading from "../../components/common/Loading";
import { toast } from "react-toastify";
import { FaSave, FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";
import "../../styles/adminForm.css";
import ImageUpload from "../../components/common/ImageUpload";
import MultiImageUpload from "../../components/common/MultiImageUpload";

const AdminFoodEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    tenMon: "",
    moTa: "",
    hinhAnh: "",
    hienThi: true,
    albumAnh: [],
    nguyenLieu: [],
    quyTrinh: [],
    quanAn: [],
  });

  useEffect(() => {
    if (isEdit) {
      const fetchFood = async () => {
        try {
          const res = await API.get(`/foods/${id}`);
          const data = res.data.data;
          setForm({
            tenMon: data.tenMon || "",
            moTa: data.moTa || "",
            hinhAnh: data.hinhAnh || "",
            hienThi: data.hienThi !== false,
            albumAnh: data.albumAnh || [],
            nguyenLieu: data.nguyenLieu || [],
            quyTrinh: data.quyTrinh || [],
            quanAn: data.quanAn || [],
          });
        } catch (error) {
          toast.error("Không tìm thấy món ăn");
          navigate("/admin/foods");
        } finally {
          setLoading(false);
        }
      };
      fetchFood();
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // === Nguyên liệu ===
  const addNguyenLieu = () => {
    setForm((prev) => ({
      ...prev,
      nguyenLieu: [...prev.nguyenLieu, { tenNguyenLieu: "" }],
    }));
  };
  const updateNguyenLieu = (i, value) => {
    setForm((prev) => {
      const updated = [...prev.nguyenLieu];
      updated[i] = { tenNguyenLieu: value };
      return { ...prev, nguyenLieu: updated };
    });
  };
  const removeNguyenLieu = (i) => {
    setForm((prev) => ({
      ...prev,
      nguyenLieu: prev.nguyenLieu.filter((_, idx) => idx !== i),
    }));
  };

  // === Quy trình ===
  const addQuyTrinh = () => {
    setForm((prev) => ({
      ...prev,
      quyTrinh: [
        ...prev.quyTrinh,
        { thuTu: prev.quyTrinh.length + 1, moTaBuoc: "", thoiGian: "" },
      ],
    }));
  };
  const updateQuyTrinh = (i, field, value) => {
    setForm((prev) => {
      const updated = [...prev.quyTrinh];
      updated[i] = { ...updated[i], [field]: value };
      return { ...prev, quyTrinh: updated };
    });
  };
  const removeQuyTrinh = (i) => {
    setForm((prev) => ({
      ...prev,
      quyTrinh: prev.quyTrinh
        .filter((_, idx) => idx !== i)
        .map((qt, idx) => ({ ...qt, thuTu: idx + 1 })),
    }));
  };

  // === Quán ăn ===
  const addQuanAn = () => {
    setForm((prev) => ({
      ...prev,
      quanAn: [...prev.quanAn, { tenQuanAn: "", diaChi: "", sdt: "" }],
    }));
  };
  const updateQuanAn = (i, field, value) => {
    setForm((prev) => {
      const updated = [...prev.quanAn];
      updated[i] = { ...updated[i], [field]: value };
      return { ...prev, quanAn: updated };
    });
  };
  const removeQuanAn = (i) => {
    setForm((prev) => ({
      ...prev,
      quanAn: prev.quanAn.filter((_, idx) => idx !== i),
    }));
  };

  // === Submit ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tenMon.trim()) return toast.error("Vui lòng nhập tên món ăn");

    setSubmitting(true);
    try {
      if (isEdit) {
        await API.put(`/foods/${id}`, form);
        toast.success("Cập nhật món ăn thành công!");
      } else {
        await API.post("/foods", form);
        toast.success("Thêm món ăn thành công!");
      }
      navigate("/admin/foods");
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
        <h1>{isEdit ? "✏️ Sửa món ăn" : "➕ Thêm món ăn mới"}</h1>
        <button
          onClick={() => navigate("/admin/foods")}
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
              <label>Tên món *</label>
              <input
                type="text"
                name="tenMon"
                value={form.tenMon}
                onChange={handleChange}
                placeholder="VD: Mì Quảng"
                required
              />
            </div>
            <div className="form-group span-2">
              <ImageUpload
                label="Hình ảnh chính"
                value={form.hinhAnh}
                onChange={(url) =>
                  setForm((prev) => ({ ...prev, hinhAnh: url }))
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
                />{" "}
                Hiển thị
              </label>
            </div>
          </div>
          <div className="form-group">
            <label>Mô tả</label>
            <textarea
              name="moTa"
              value={form.moTa}
              onChange={handleChange}
              rows={4}
              placeholder="Mô tả về món ăn..."
            />
          </div>
        </div>
        <div className="form-section">
          <h2>📸 Album ảnh</h2>
          <MultiImageUpload
            label="Album ảnh món ăn"
            value={form.albumAnh || []}
            onChange={(images) =>
              setForm((prev) => ({ ...prev, albumAnh: images }))
            }
            max={10}
          />
        </div>
        {/* Nguyên liệu */}
        <div className="form-section">
          <div className="section-header">
            <h2>🥘 Nguyên liệu</h2>
            <button
              type="button"
              onClick={addNguyenLieu}
              className="btn-add-item"
            >
              <FaPlus /> Thêm
            </button>
          </div>
          {form.nguyenLieu.map((nl, i) => (
            <div key={i} className="dynamic-item">
              <span className="item-number">{i + 1}</span>
              <input
                type="text"
                value={nl.tenNguyenLieu}
                onChange={(e) => updateNguyenLieu(i, e.target.value)}
                placeholder="Tên nguyên liệu"
                className="flex-input"
              />
              <button
                type="button"
                onClick={() => removeNguyenLieu(i)}
                className="btn-remove-item"
              >
                <FaTrash />
              </button>
            </div>
          ))}
          {form.nguyenLieu.length === 0 && (
            <p className="empty-hint">Chưa có nguyên liệu.</p>
          )}
        </div>

        {/* Quy trình */}
        <div className="form-section">
          <div className="section-header">
            <h2>👨‍🍳 Quy trình chế biến</h2>
            <button
              type="button"
              onClick={addQuyTrinh}
              className="btn-add-item"
            >
              <FaPlus /> Thêm
            </button>
          </div>
          {form.quyTrinh.map((qt, i) => (
            <div key={i} className="dynamic-item">
              <span className="item-number">{qt.thuTu}</span>
              <div className="dynamic-item-fields">
                <input
                  type="text"
                  value={qt.moTaBuoc}
                  onChange={(e) =>
                    updateQuyTrinh(i, "moTaBuoc", e.target.value)
                  }
                  placeholder="Mô tả bước"
                />
                <input
                  type="text"
                  value={qt.thoiGian}
                  onChange={(e) =>
                    updateQuyTrinh(i, "thoiGian", e.target.value)
                  }
                  placeholder="Thời gian (VD: 5 phút)"
                  className="time-input"
                />
              </div>
              <button
                type="button"
                onClick={() => removeQuyTrinh(i)}
                className="btn-remove-item"
              >
                <FaTrash />
              </button>
            </div>
          ))}
          {form.quyTrinh.length === 0 && (
            <p className="empty-hint">Chưa có quy trình.</p>
          )}
        </div>

        {/* Quán ăn gợi ý */}
        <div className="form-section">
          <div className="section-header">
            <h2>🏪 Quán ăn gợi ý</h2>
            <button type="button" onClick={addQuanAn} className="btn-add-item">
              <FaPlus /> Thêm
            </button>
          </div>
          {form.quanAn.map((qa, i) => (
            <div key={i} className="dynamic-item">
              <div className="dynamic-item-fields three-cols">
                <input
                  type="text"
                  value={qa.tenQuanAn}
                  onChange={(e) => updateQuanAn(i, "tenQuanAn", e.target.value)}
                  placeholder="Tên quán"
                />
                <input
                  type="text"
                  value={qa.diaChi}
                  onChange={(e) => updateQuanAn(i, "diaChi", e.target.value)}
                  placeholder="Địa chỉ"
                />
                <input
                  type="text"
                  value={qa.sdt}
                  onChange={(e) => updateQuanAn(i, "sdt", e.target.value)}
                  placeholder="SĐT"
                />
              </div>
              <button
                type="button"
                onClick={() => removeQuanAn(i)}
                className="btn-remove-item"
              >
                <FaTrash />
              </button>
            </div>
          ))}
          {form.quanAn.length === 0 && (
            <p className="empty-hint">Chưa có quán ăn.</p>
          )}
        </div>

        {/* Submit */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate("/admin/foods")}
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

export default AdminFoodEdit;
