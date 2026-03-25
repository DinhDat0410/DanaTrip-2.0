const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    ten: { type: String, required: true },
    email: { type: String, required: true },
    noiDung: { type: String, required: true },
    trangThai: {
      type: String,
      enum: ['Chưa xử lý', 'Đã xử lý'],
      default: 'Chưa xử lý',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Contact', ContactSchema);