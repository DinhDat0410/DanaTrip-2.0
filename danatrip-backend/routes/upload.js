const express = require('express');
const router = express.Router();
const { uploadSingle, uploadMultiple } = require('../middleware/upload');
const {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
} = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const { allowRoles } = require('../middleware/admin');

// Middleware xử lý lỗi multer
const handleMulterError = (uploadFn) => {
  return (req, res, next) => {
    uploadFn(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File quá lớn. Tối đa 5MB',
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      next();
    });
  };
};

// Upload 1 ảnh (Admin)
router.post('/', protect, allowRoles('WebsiteManager', 'Partner'), handleMulterError(uploadSingle), uploadImage);

// Upload nhiều ảnh (Admin)
router.post('/multiple', protect, allowRoles('WebsiteManager', 'Partner'), handleMulterError(uploadMultiple), uploadMultipleImages);

// Xóa ảnh (Admin)
router.delete('/:filename', protect, allowRoles('WebsiteManager', 'Partner'), deleteImage);

module.exports = router;
