const fs = require('fs');
const path = require('path');

// @desc    Upload 1 ảnh
// @route   POST /api/upload
exports.uploadImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn file ảnh',
      });
    }

    // Tạo URL trả về
    const imageUrl = `/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: 'Upload thành công',
      data: {
        filename: req.file.filename,
        url: imageUrl,
        fullUrl: `${req.protocol}://${req.get('host')}${imageUrl}`,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload nhiều ảnh
// @route   POST /api/upload/multiple
exports.uploadMultipleImages = (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn ít nhất 1 file ảnh',
      });
    }

    const images = req.files.map((file) => ({
      filename: file.filename,
      url: `/uploads/${file.filename}`,
      fullUrl: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`,
      size: file.size,
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
// @route   DELETE /api/upload/:filename
exports.deleteImage = (req, res) => {
  try {
    const filePath = path.join(__dirname, '..', 'uploads', req.params.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy file',
      });
    }

    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: 'Đã xóa file',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};