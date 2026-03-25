const adminOnly = (req, res, next) => {
  if (req.user && req.user.vaiTro === 'Admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Chỉ Admin mới có quyền truy cập',
    });
  }
};

module.exports = { adminOnly };