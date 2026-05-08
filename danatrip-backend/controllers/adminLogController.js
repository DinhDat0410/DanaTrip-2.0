const AdminLog = require('../models/AdminLog');

exports.getAdminLogs = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 30, 1), 100);
    const skip = (page - 1) * limit;
    const query = {};

    if (req.query.resource) query.resource = req.query.resource;
    if (req.query.action) query.action = req.query.action;
    if (req.query.actorRole) query.actorRole = req.query.actorRole;

    if (req.query.search) {
      const escaped = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { actorName: { $regex: escaped, $options: 'i' } },
        { resourceName: { $regex: escaped, $options: 'i' } },
        { path: { $regex: escaped, $options: 'i' } },
      ];
    }

    const [logs, total] = await Promise.all([
      AdminLog.find(query).populate('actor', 'hoTen email vaiTro').sort('-createdAt').skip(skip).limit(limit),
      AdminLog.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
