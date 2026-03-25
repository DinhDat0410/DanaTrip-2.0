const User = require('../models/User');

// @desc    Đăng ký
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { hoTen, email, matKhau } = req.body;

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng',
      });
    }

    // Tạo user mới
    const user = await User.create({
      hoTen,
      email,
      matKhau,
    });

    // Trả về token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        hoTen: user.hoTen,
        email: user.email,
        vaiTro: user.vaiTro,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// @desc    Đăng nhập
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, matKhau } = req.body;

    // Validate
    if (!email || !matKhau) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email và mật khẩu',
      });
    }

    // Tìm user (phải select matKhau vì đã set select: false)
    const user = await User.findOne({ email }).select('+matKhau');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng',
      });
    }

    // So sánh password
    const isMatch = await user.matchPassword(matKhau);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng',
      });
    }

    // Trả về token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        hoTen: user.hoTen,
        email: user.email,
        vaiTro: user.vaiTro,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// @desc    Lấy thông tin user hiện tại
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
};