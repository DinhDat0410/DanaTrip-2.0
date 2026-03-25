const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sao: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    noiDung: { type: String, default: '' },
  },
  { timestamps: true }
);

// Mỗi user chỉ được đánh giá 1 tour 1 lần
ReviewSchema.index({ tour: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);