const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  tinNhanNguoiDung: { type: String, default: '' },
  phanHoiAI: { type: String, default: '' },
  tourGoiY: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tour' }],
  placeGoiY: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Place' }],
  foodGoiY: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Food' }],
  thoiGian: { type: Date, default: Date.now },
});

const ChatHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    sessionId: { type: String, required: true },
    messages: [MessageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChatHistory', ChatHistorySchema);