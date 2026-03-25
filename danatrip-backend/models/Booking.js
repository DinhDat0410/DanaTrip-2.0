const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
      required: true,
    },
    hoTen: { type: String, required: true },
    sdt: { type: String, required: true },
    email: { type: String, default: '' },
    soNguoiLon: { type: Number, default: 1, min: 1 },
    soTreEm: { type: Number, default: 0, min: 0 },
    tongTien: { type: Number, required: true },
    phuongThucThanhToan: {
      type: String,
      enum: ['Cash', 'Momo', 'ZaloPay', 'VNPay', 'BankTransfer'],
      default: 'Cash',
    },
    trangThai: {
      type: String,
      enum: ['Chờ xác nhận', 'Đã xác nhận', 'Đã thanh toán', 'Đã hủy'],
      default: 'Chờ xác nhận',
    },
    ghiChu: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', BookingSchema);