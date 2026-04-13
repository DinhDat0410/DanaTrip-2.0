const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      default: '',
      index: true,
    },
    path: {
      type: String,
      default: '/',
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    referrer: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Visit', VisitSchema);
