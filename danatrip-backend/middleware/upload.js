const multer = require('multer');
const storage = multer.memoryStorage();

// Lọc file: chỉ cho phép ảnh
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép upload file ảnh (jpg, png, gif, webp)'), false);
  }
};

// Upload 1 ảnh
const uploadSingle = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
}).single('image');

// Upload nhiều ảnh (tối đa 10)
const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).array('images', 10);

module.exports = { uploadSingle, uploadMultiple };
