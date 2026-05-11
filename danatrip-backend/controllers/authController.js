const User = require('../models/User');
const crypto = require('crypto');
const {
  hasMailConfig,
  sendResetPasswordEmail,
  sendEmailVerificationEmail,
  sendEmailChangeCode,
} = require('../utils/mailer');

const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const isStrongPassword = (password = '') => {
  const value = String(password);
  return (
    value.length >= 8 &&
    /[A-Z]/.test(value) &&
    /[a-z]/.test(value) &&
    /\d/.test(value) &&
    /[^A-Za-z0-9]/.test(value)
  );
};

const passwordSuggestion =
  'Mật khẩu chưa đủ mạnh. Gợi ý: tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.';

const buildUserResponse = (user) => ({
  id: user._id,
  _id: user._id,
  hoTen: user.hoTen,
  email: user.email,
  sdt: user.sdt,
  avatar: user.avatar,
  vaiTro: user.vaiTro,
  provider: user.provider,
  isEmailVerified: user.isEmailVerified,
  createdAt: user.createdAt,
});

const buildEmailVerificationUrl = (token) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  return `${frontendUrl}/verify-email/${token}`;
};

const sendVerificationForUser = async (user) => {
  const verificationToken = user.getEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  await sendEmailVerificationEmail({
    email: user.email,
    hoTen: user.hoTen,
    verificationUrl: buildEmailVerificationUrl(verificationToken),
  });
};

// @desc    Đăng ký
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { hoTen, email, matKhau } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!hoTen || !normalizedEmail || !matKhau) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu',
      });
    }

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Email không hợp lệ',
      });
    }

    if (!isStrongPassword(matKhau)) {
      return res.status(400).json({
        success: false,
        message: passwordSuggestion,
        passwordSuggestion: true,
      });
    }

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Tài khoản đã tồn tại',
        suggestLogin: true,
      });
    }

    // Tạo user mới
    const user = await User.create({
      hoTen: String(hoTen).trim(),
      email: normalizedEmail,
      matKhau,
      isEmailVerified: false,
    });

    try {
      await sendVerificationForUser(user);
    } catch (mailError) {
      await User.deleteOne({ _id: user._id });
      console.error('Khong gui duoc email xac nhan tai khoan:', mailError.message);
      if (!hasMailConfig) {
        console.warn('Email config chua day du. Kiem tra EMAIL_USER va EMAIL_PASS trong .env');
      }

      return res.status(500).json({
        success: false,
        message: 'Không gửi được email xác nhận tài khoản',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác nhận tài khoản',
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

// @desc    Đăng nhập
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, matKhau } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    // Validate
    if (!normalizedEmail || !matKhau) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email và mật khẩu',
      });
    }

    // Tìm user (phải select matKhau vì đã set select: false)
    const user = await User.findOne({ email: normalizedEmail }).select('+matKhau');

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

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        emailVerificationRequired: true,
        message: 'Vui lòng xác nhận email trước khi đăng nhập',
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
        isEmailVerified: user.isEmailVerified,
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
    user.isEmailVerified = true;
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

// @desc    Xác nhận email tài khoản
// @route   GET /api/auth/verify-email/:token
exports.verifyEmail = async (req, res) => {
  try {
    const emailVerificationToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken,
      emailVerificationExpire: { $gt: Date.now() },
    }).select('+emailVerificationToken +emailVerificationExpire');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Link xác nhận không hợp lệ hoặc đã hết hạn',
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpire = null;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Xác nhận email thành công. Bạn có thể đăng nhập',
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

// @desc    Gửi lại email xác nhận tài khoản
// @route   POST /api/auth/resend-verification-email
exports.resendVerificationEmail = async (req, res) => {
  try {
    const normalizedEmail = String(req.body.email || '').trim().toLowerCase();

    if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Email không hợp lệ',
      });
    }

    const user = await User.findOne({ email: normalizedEmail }).select(
      '+emailVerificationToken +emailVerificationExpire'
    );

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'Nếu email tồn tại và chưa xác nhận, chúng tôi đã gửi lại link xác nhận',
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email này đã được xác nhận',
      });
    }

    try {
      await sendVerificationForUser(user);

      return res.status(200).json({
        success: true,
        message: 'Đã gửi lại email xác nhận tài khoản',
      });
    } catch (mailError) {
      console.error('Khong gui duoc email xac nhan tai khoan:', mailError.message);
      if (!hasMailConfig) {
        console.warn('Email config chua day du. Kiem tra EMAIL_USER va EMAIL_PASS trong .env');
      }

      return res.status(500).json({
        success: false,
        message: 'Không gửi được email xác nhận tài khoản',
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

// @desc    Đăng nhập bằng mạng xã hội (Google)
// @route   POST /api/auth/social-login
exports.socialLogin = async (req, res) => {
  try {
    const { email, hoTen, avatar, provider } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
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

    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = await User.create({
        hoTen: hoTen || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        matKhau: crypto.randomBytes(32).toString('base64'),
        avatar: avatar || '',
        provider,
        isEmailVerified: true,
      });
    } else if (!user.isEmailVerified) {
      user.isEmailVerified = true;
      user.emailVerificationToken = null;
      user.emailVerificationExpire = null;
      await user.save({ validateBeforeSave: false });
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
        isEmailVerified: user.isEmailVerified,
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
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email',
      });
    }

    const user = await User.findOne({ email: normalizedEmail });

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
