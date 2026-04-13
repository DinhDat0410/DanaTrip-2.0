const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema(
  {
    hoTen: {
      type: String,
      required: [true, 'Vui lòng nhập họ tên'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Vui lòng nhập email'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'],
    },
    matKhau: {
      type: String,
      required: [true, 'Vui lòng nhập mật khẩu'],
      minlength: 6,
      select: false,
    },
    sdt: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    vaiTro: {
      type: String,
      enum: ['User', 'Admin', 'WebsiteManager', 'Partner'],
      default: 'User',
    },
    trangThai: {
      type: String,
      enum: ['Hoạt động', 'Bị khóa'],
      default: 'Hoạt động',
    },
    provider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    hienThi: {
      type: Boolean,
      default: true,
    },
    resetPasswordToken: {
      type: String,
      default: null,
      select: false,
    },
    resetPasswordExpire: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ SỬA: Bỏ next, dùng async function thuần
UserSchema.pre('save', async function () {
  if (!this.isModified('matKhau')) return;

  const salt = await bcrypt.genSalt(10);
  this.matKhau = await bcrypt.hash(this.matKhau, salt);
});

// So sánh password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.matKhau);
};

// Tạo JWT token
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model('User', UserSchema);
