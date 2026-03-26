import { useState } from 'react';
import API from '../../api/axios';
import { FaCloudUploadAlt, FaTrash, FaSpinner } from 'react-icons/fa';
import '../../styles/imageUpload.css';

const API_BASE = import.meta.env.VITE_API_URL.replace('/api', '');

const ImageUpload = ({ value, onChange, label = 'Hình ảnh' }) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleUpload = async (file) => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await API.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Trả về URL cho parent component
      onChange(res.data.data.url);
    } catch (error) {
      alert(error.response?.data?.message || 'Upload thất bại');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    handleUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    handleUpload(file);
  };

  const handleRemove = async () => {
    if (value) {
      // Xóa file trên server
      const filename = value.split('/').pop();
      try {
        await API.delete(`/upload/${filename}`);
      } catch (error) {
        // Bỏ qua lỗi xóa file
      }
    }
    onChange('');
  };

  // Lấy full URL để hiển thị ảnh
  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_BASE}${url}`;
  };

  return (
    <div className="image-upload">
      <label className="upload-label">{label}</label>

      {value ? (
        // === Đã có ảnh: hiển thị preview ===
        <div className="upload-preview">
          <img src={getImageUrl(value)} alt="Preview" />
          <div className="preview-overlay">
            <button type="button" onClick={handleRemove} className="btn-remove-image">
              <FaTrash /> Xóa ảnh
            </button>
          </div>
        </div>
      ) : (
        // === Chưa có ảnh: hiển thị dropzone ===
        <div
          className={`upload-dropzone ${dragActive ? 'active' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          {uploading ? (
            <div className="upload-loading">
              <FaSpinner className="spin" />
              <p>Đang upload...</p>
            </div>
          ) : (
            <>
              <FaCloudUploadAlt className="upload-icon" />
              <p>Kéo thả ảnh vào đây hoặc</p>
              <label className="btn-choose-file">
                Chọn file
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  hidden
                />
              </label>
              <span className="upload-hint">JPG, PNG, GIF, WebP - Tối đa 5MB</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;