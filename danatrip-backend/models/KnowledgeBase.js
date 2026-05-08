const mongoose = require('mongoose');

const KnowledgeBaseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['tour', 'place', 'food', 'booking', 'payment', 'policy', 'faq', 'ai-training', 'other'],
      default: 'faq',
    },
    question: { type: String, default: '', trim: true },
    answer: { type: String, required: true, trim: true },
    tags: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ['draft', 'active', 'archived'],
      default: 'draft',
    },
    source: {
      type: String,
      enum: ['manual', 'chat', 'contact', 'review', 'system'],
      default: 'manual',
    },
    sourceRef: { type: String, default: '' },
    priority: { type: Number, default: 1, min: 1, max: 5 },
    usageCount: { type: Number, default: 0 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

KnowledgeBaseSchema.index({ status: 1, priority: -1, updatedAt: -1 });
KnowledgeBaseSchema.index({ title: 'text', question: 'text', answer: 'text', tags: 'text' });

module.exports = mongoose.model('KnowledgeBase', KnowledgeBaseSchema);
