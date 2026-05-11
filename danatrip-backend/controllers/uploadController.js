const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const cloudinary = require('../config/cloudinary');

const getCloudinaryPublicIdFromUrl = (url) => {
  if (!url || !url.includes('res.cloudinary.com')) return null;

  const marker = '/upload/';
  const idx = url.indexOf(marker);
  if (idx === -1) return null;

  let tail = url.slice(idx + marker.length);
  tail = tail.replace(/^v\d+\//, '');
  tail = tail.split('?')[0];
  tail = tail.replace(/\.[^/.]+$/, '');

  return tail || null;
};

const uploadBufferToCloudinary = (file) => {
  const publicId = `danatrip/img-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      }
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });
};

// @desc    Upload 1 ảnh
// @route   POST /api/upload
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn file ảnh',
      });
    }

    const uploaded = await uploadBufferToCloudinary(req.file);

    res.status(200).json({
      success: true,
      message: 'Upload thành công',
      data: {
        filename: uploaded.public_id,
        publicId: uploaded.public_id,
        url: uploaded.secure_url,
        fullUrl: uploaded.secure_url,
        size: uploaded.bytes,
        mimetype: req.file.mimetype,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload nhiều ảnh
// @route   POST /api/upload/multiple
exports.uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn ít nhất 1 file ảnh',
      });
    }

    const uploadedFiles = await Promise.all(req.files.map((file) => uploadBufferToCloudinary(file)));
    const images = uploadedFiles.map((file) => ({
      filename: file.public_id,
      publicId: file.public_id,
      url: file.secure_url,
      fullUrl: file.secure_url,
      size: file.bytes,
    }));

    res.status(200).json({
      success: true,
      message: `Upload thành công ${images.length} ảnh`,
      count: images.length,
      data: images,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Xóa 1 ảnh
// @route   DELETE /api/upload
// @route   DELETE /api/upload/:filename (backward-compatible local cleanup)
exports.deleteImage = async (req, res) => {
  try {
    const publicIdFromQuery = req.query.publicId;
    const urlFromQuery = req.query.url;
    const filenameParam = req.params.filename;

    const publicId = publicIdFromQuery || getCloudinaryPublicIdFromUrl(urlFromQuery);
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
      return res.status(200).json({
        success: true,
        message: 'Đã xóa ảnh trên Cloudinary',
      });
    }

    if (!filenameParam) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu publicId hoặc filename để xóa ảnh',
      });
    }

    const filename = path.basename(filenameParam);
    const filePath = path.join(__dirname, '..', 'uploads', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy file',
      });
    }

    fs.unlinkSync(filePath);

    return res.status(200).json({
      success: true,
      message: 'Đã xóa file',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
