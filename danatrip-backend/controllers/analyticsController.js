const Visit = require('../models/Visit');

exports.trackVisit = async (req, res) => {
  try {
    const { sessionId, path } = req.body;

    await Visit.create({
      sessionId: sessionId || '',
      path: path || '/',
      user: req.user?._id || null,
      referrer: req.headers.referer || '',
      userAgent: req.headers['user-agent'] || '',
    });

    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
