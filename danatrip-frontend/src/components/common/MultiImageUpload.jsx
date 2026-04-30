import { useState } from 'react';
import API from '../../api/axios';
import { FaTrash, FaSpinner, FaPlus, FaCloudUploadAlt } from 'react-icons/fa';
import '../../styles/imageUpload.css';

const API_BASE = import.meta.env.VITE_API_URL.replace('/api', '');

const MultiImageUpload = ({ value = [], onChange, label = 'Album ảnh', max = 10 }) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleUpload = async (files) => {
    if (!files.length) return;

    setUploading(true);
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('images', file));

    try {
      const res = await API.post('/upload/multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newImages = res.data.data.map((img) => ({ urlAnh: img.url }));
      onChange([...value, ...newImages]);
    } catch (error) {
      alert(error.response?.data?.message || 'Upload thất bại');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (index) => {
    const image = value[index];
    if (image?.urlAnh) {
      const filename = image.urlAnh.split('/').pop();
      try {
        await API.delete(`/upload/${filename}`);
      } catch (error) {
        // Bỏ qua
      }
    }
    onChange(value.filter((_, i) => i !== index));
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_BASE}${url}`;
  };

  return (
    <div className="multi-image-upload">
      <label className="upload-label">{label} ({value.length}/{max})</label>

      <div
        className={`multi-upload-dropzone ${dragActive ? 'active' : ''} ${uploading ? 'disabled' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleUpload(e.dataTransfer.files);
        }}
      >
        {uploading ? (
          <div className="upload-loading">
            <FaSpinner className="spin" />
            <p>Đang upload ảnh...</p>
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
                multiple
                onChange={(e) => handleUpload(e.target.files)}
                hidden
                disabled={uploading || value.length >= max}
              />
            </label>
            <span className="upload-hint">Có thể chọn nhiều ảnh cùng lúc. Tối đa {max} ảnh.</span>
          </>
        )}
      </div>

      <div className="multi-image-grid">
        {/* Ảnh đã upload */}
        {value.map((img, i) => (
          <div key={i} className="multi-image-item">
            <img src={getImageUrl(img.urlAnh)} alt={`Ảnh ${i + 1}`} />
            <div className="multi-image-order">{i + 1}</div>
            <button
              type="button"
              onClick={() => handleRemove(i)}
              className="btn-remove-multi"
            >
              <FaTrash />
            </button>
          </div>
        ))}

        {value.length < max && (
          <label className="multi-image-add-inline">
            <FaPlus />
            <span>Thêm ảnh</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleUpload(e.target.files)}
              hidden
              disabled={uploading}
            />
          </label>
        )}
      </div>
    </div>
  );
};

export default MultiImageUpload;
