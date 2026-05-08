const mongoose = require('mongoose');

const AdminLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    actorName: { type: String, default: 'System' },
    actorRole: { type: String, default: 'System' },
    action: {
      type: String,
      enum: ['create', 'update', 'delete', 'status_change', 'generate', 'login', 'other'],
      default: 'other',
    },
    resource: { type: String, required: true },
    resourceId: { type: String, default: '' },
    resourceName: { type: String, default: '' },
    method: { type: String, default: '' },
    path: { type: String, default: '' },
    statusCode: { type: Number, default: 200 },
    metadata: { type: Object, default: {} },
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
  },
  { timestamps: true }
);

AdminLogSchema.index({ createdAt: -1 });
AdminLogSchema.index({ actor: 1, createdAt: -1 });
AdminLogSchema.index({ resource: 1, createdAt: -1 });

module.exports = mongoose.model('AdminLog', AdminLogSchema);
