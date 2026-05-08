const AdminLog = require('../models/AdminLog');

const getResourceName = (data = {}, fallback = '') => {
  const item = data.data || data.user || data;
  return (
    item.tenTour ||
    item.tenDiaDiem ||
    item.tenMon ||
    item.hoTen ||
    item.title ||
    item.email ||
    fallback ||
    ''
  );
};

const adminLogger = (action, resource) => (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = (body) => {
    const shouldLog = res.statusCode < 400 && req.user;

    if (shouldLog) {
      const payload = {
        actor: req.user._id,
        actorName: req.user.hoTen || req.user.email || 'Unknown',
        actorRole: req.user.vaiTro || 'Unknown',
        action,
        resource,
        resourceId: req.params.id || body?.data?._id || body?.user?._id || '',
        resourceName: getResourceName(body, req.body?.title || req.body?.tenTour || req.body?.tenDiaDiem || req.body?.tenMon),
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        metadata: {
          params: req.params,
          query: req.query,
          fields: Object.keys(req.body || {}).filter((key) => !/password|matKhau|token|secret/i.test(key)),
        },
        ip: req.ip,
        userAgent: req.get('user-agent') || '',
      };

      AdminLog.create(payload).catch((error) => {
        console.error('Admin log error:', error.message);
      });
    }

    return originalJson(body);
  };

  next();
};

module.exports = adminLogger;
