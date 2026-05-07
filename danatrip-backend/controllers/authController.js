const User = require('../models/User');
const crypto = require('crypto');
const { hasMailConfig, sendResetPasswordEmail, sendEmailChangeCode } = require('../utils/mailer');

const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const buildUserResponse = (user) => ({
  id: user._id,
  _id: user._id,
  hoTen: user.hoTen,
  email: user.email,
  sdt: user.sdt,
  avatar: user.avatar,
  vaiTro: user.vaiTro,
  provider: user.provider,
  createdAt: user.createdAt,
});

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

// @desc    Cập nhật thông tin cá nhân cơ bản
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { hoTen, sdt } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    if (hoTen !== undefined) {
      const normalizedName = String(hoTen).trim();
      if (!normalizedName) {
        return res.status(400).json({ success: false, message: 'Họ tên không được để trống' });
      }
      user.hoTen = normalizedName;
    }

    if (sdt !== undefined) {
      user.sdt = String(sdt).trim();
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      user: buildUserResponse(user),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// @desc    Đổi mật khẩu khi đã đăng nhập
// @route   PUT /api/auth/change-password
exports.changePassword = async (req, res) => {
  try {
    const { matKhauCu, matKhauMoi, xacNhanMatKhauMoi } = req.body;

    if (!matKhauCu || !matKhauMoi || !xacNhanMatKhauMoi) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ mật khẩu cũ và mật khẩu mới',
      });
    }

    if (matKhauMoi !== xacNhanMatKhauMoi) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới nhập lại không khớp',
      });
    }

    if (String(matKhauMoi).length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự',
      });
    }

    const user = await User.findById(req.user.id).select('+matKhau');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    if (user.provider !== 'local') {
      return res.status(400).json({
        success: false,
        message: 'Tài khoản đăng nhập bằng Google không thể đổi mật khẩu tại đây',
      });
    }

    const isMatch = await user.matchPassword(matKhauCu);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Mật khẩu cũ không đúng',
      });
    }

    user.matKhau = matKhauMoi;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Đổi mật khẩu thành công',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// @desc    Gửi mã xác nhận đổi email
// @route   POST /api/auth/request-email-change
exports.requestEmailChange = async (req, res) => {
  try {
    const { emailMoi } = req.body;
    const normalizedEmail = String(emailMoi || '').trim().toLowerCase();

    if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Email mới không hợp lệ',
      });
    }

    const user = await User.findById(req.user.id).select('+pendingEmail +emailChangeCode +emailChangeCodeExpire');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    if (normalizedEmail === user.email) {
      return res.status(400).json({
        success: false,
        message: 'Email mới phải khác email hiện tại',
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email này đã được sử dụng',
      });
    }

    const code = String(crypto.randomInt(100000, 1000000));
    user.pendingEmail = normalizedEmail;
    user.emailChangeCode = crypto.createHash('sha256').update(code).digest('hex');
    user.emailChangeCodeExpire = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    try {
      await sendEmailChangeCode({
        email: normalizedEmail,
        hoTen: user.hoTen,
        code,
      });

      return res.status(200).json({
        success: true,
        message: 'Đã gửi mã xác nhận đến email mới',
      });
    } catch (mailError) {
      user.pendingEmail = null;
      user.emailChangeCode = null;
      user.emailChangeCodeExpire = null;
      await user.save({ validateBeforeSave: false });

      console.error('Khong gui duoc ma doi email:', mailError.message);
      if (!hasMailConfig) {
        console.warn('Email config chua day du. Kiem tra EMAIL_USER va EMAIL_PASS trong .env');
      }

      return res.status(500).json({
        success: false,
        message: 'Không gửi được mã xác nhận đổi email',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// @desc    Xác nhận mã và đổi email
// @route   PUT /api/auth/confirm-email-change
exports.confirmEmailChange = async (req, res) => {
  try {
    const { maXacNhan } = req.body;
    const normalizedCode = String(maXacNhan || '').trim();

    if (!/^\d{6}$/.test(normalizedCode)) {
      return res.status(400).json({
        success: false,
        message: 'Mã xác nhận phải gồm 6 chữ số',
      });
    }

    const hashedCode = crypto.createHash('sha256').update(normalizedCode).digest('hex');
    const user = await User.findOne({
      _id: req.user.id,
      emailChangeCode: hashedCode,
      emailChangeCodeExpire: { $gt: Date.now() },
    }).select('+pendingEmail +emailChangeCode +emailChangeCodeExpire');

    if (!user || !user.pendingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Mã xác nhận không hợp lệ hoặc đã hết hạn',
      });
    }

    const existingUser = await User.findOne({
      email: user.pendingEmail,
      _id: { $ne: user._id },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email này đã được sử dụng',
      });
    }

    user.email = user.pendingEmail;
    user.pendingEmail = null;
    user.emailChangeCode = null;
    user.emailChangeCodeExpire = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Đổi email thành công',
      user: buildUserResponse(user),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// @desc    Đăng nhập bằng mạng xã hội (Google)
// @route   POST /api/auth/social-login
exports.socialLogin = async (req, res) => {
  try {
    const { email, hoTen, avatar, provider } = req.body;

    if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email không hợp lệ từ tài khoản mạng xã hội',
      });
    }

    if (provider !== 'google') {
      return res.status(400).json({
        success: false,
        message: 'Provider không hợp lệ',
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        hoTen: hoTen || email.split('@')[0],
        email,
        matKhau: crypto.randomBytes(32).toString('base64'),
        avatar: avatar || '',
        provider,
      });
    }

    if (user.trangThai === 'Bị khóa') {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản đã bị khóa',
      });
    }

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        hoTen: user.hoTen,
        email: user.email,
        vaiTro: user.vaiTro,
        avatar: user.avatar,
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

// @desc    Gửi email quên mật khẩu
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email',
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'Nếu email tồn tại trong hệ thống, chúng tôi đã gửi link đặt lại mật khẩu',
      });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    try {
      await sendResetPasswordEmail({
        email: user.email,
        hoTen: user.hoTen,
        resetUrl,
      });

      return res.status(200).json({
        success: true,
        message: 'Nếu email tồn tại trong hệ thống, chúng tôi đã gửi link đặt lại mật khẩu',
      });
    } catch (mailError) {
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;
      await user.save({ validateBeforeSave: false });

      console.error('Khong gui duoc email reset password:', mailError.message);
      if (!hasMailConfig) {
        console.warn('Email config chua day du. Kiem tra EMAIL_USER va EMAIL_PASS trong .env');
      }

      return res.status(500).json({
        success: false,
        message: 'Không gửi được email đặt lại mật khẩu',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// @desc    Đặt lại mật khẩu
// @route   PUT /api/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { matKhau } = req.body;

    if (!matKhau || String(matKhau).length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự',
      });
    }

    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpire +matKhau');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn',
      });
    }

    user.matKhau = matKhau;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Đặt lại mật khẩu thành công',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};
