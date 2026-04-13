const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.vaiTro)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền truy cập chức năng này',
    });
  };
};

const adminOnly = allowRoles('Admin');

module.exports = { adminOnly, allowRoles };
