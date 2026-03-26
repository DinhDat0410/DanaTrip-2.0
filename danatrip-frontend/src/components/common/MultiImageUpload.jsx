import { useState } from 'react';
import API from '../../api/axios';
import { FaCloudUploadAlt, FaTrash, FaSpinner, FaPlus } from 'react-icons/fa';
import '../../styles/imageUpload.css';

const API_BASE = import.meta.env.VITE_API_URL.replace('/api', '');

const MultiImageUpload = ({ value = [], onChange, label = 'Album ảnh', max = 10 }) => {
  const [uploading, setUploading] = useState(false);

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

      <div className="multi-image-grid">
        {/* Ảnh đã upload */}
        {value.map((img, i) => (
          <div key={i} className="multi-image-item">
            <img src={getImageUrl(img.urlAnh)} alt={`Ảnh ${i + 1}`} />
            <button type="button" onClick={() => handleRemove(i)} className="btn-remove-multi">
              <FaTrash />
            </button>
          </div>
        ))}

        {/* Nút thêm ảnh */}
        {value.length < max && (
          <label className="multi-image-add">
            {uploading ? (
              <FaSpinner className="spin" />
            ) : (
              <>
                <FaPlus />
                <span>Thêm ảnh</span>
              </>
            )}
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