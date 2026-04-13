const Tour = require('../models/Tour');

const MANAGEABLE_TOUR_FIELDS = [
  'diaDiem',
  'tenTour',
  'moTaNgan',
  'moTaChiTiet',
  'giaNguoiLon',
  'giaTreEm',
  'ngayKhoiHanh',
  'soCho',
  'trangThai',
  'hienThi',
  'tags',
  'hinhAnh',
  'highlights',
  'lichTrinh',
  'baoGom',
];

const pickTourPayload = (body = {}) => {
  return MANAGEABLE_TOUR_FIELDS.reduce((acc, key) => {
    if (body[key] !== undefined) {
      acc[key] = body[key];
    }
    return acc;
  }, {});
};

const canManageTour = (user, tour) => {
  if (!user || !tour) return false;
  if (user.vaiTro === 'WebsiteManager') return true;
  if (user.vaiTro === 'Partner') {
    return tour.partner && tour.partner.toString() === user._id.toString();
  }
  return false;
};

// @desc    Lấy tất cả tour (public)
// @route   GET /api/tours
exports.getTours = async (req, res) => {
  try {
    const query = { hienThi: true };

    if (req.query.search) {
      const escaped = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.tenTour = { $regex: escaped, $options: 'i' };
    }

    if (req.query.diaDiem) {
      query.diaDiem = req.query.diaDiem;
    }
    if (req.query.tag) {
      query.tags = { $in: [req.query.tag] };
    }
    if (req.query.giaMin || req.query.giaMax) {
      query.giaNguoiLon = {};
      if (req.query.giaMin) query.giaNguoiLon.$gte = Number(req.query.giaMin);
      if (req.query.giaMax) query.giaNguoiLon.$lte = Number(req.query.giaMax);
    }

    const tours = await Tour.find(query)
      .populate('diaDiem', 'tenDiaDiem hinhAnhChinh')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: tours.length,
      data: tours,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy chi tiết 1 tour
// @route   GET /api/tours/:id
exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id)
      .populate('diaDiem', 'tenDiaDiem hinhAnhChinh viTri')
      .populate('partner', 'hoTen email');

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tour',
      });
    }

    res.status(200).json({ success: true, data: tour });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy danh sách tour để quản trị
// @route   GET /api/tours/manage/all
exports.getManagedTours = async (req, res) => {
  try {
    const query = {};

    if (req.user.vaiTro === 'Partner') {
      query.partner = req.user._id;
    }

    const tours = await Tour.find(query)
      .populate('diaDiem', 'tenDiaDiem')
      .populate('partner', 'hoTen email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: tours.length,
      data: tours,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Tạo tour mới (WebsiteManager/Partner)
// @route   POST /api/tours
exports.createTour = async (req, res) => {
  try {
    const payload = pickTourPayload(req.body);

    if (req.user.vaiTro === 'Partner') {
      payload.partner = req.user._id;
    } else if (req.user.vaiTro === 'WebsiteManager') {
      payload.partner = req.body.partner || null;
    }

    const tour = await Tour.create(payload);

    res.status(201).json({ success: true, data: tour });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Cập nhật tour (WebsiteManager/Partner)
// @route   PUT /api/tours/:id
exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tour',
      });
    }

    if (!canManageTour(req.user, tour)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chỉnh sửa tour này',
      });
    }

    const payload = pickTourPayload(req.body);
    Object.assign(tour, payload);

    if (req.user.vaiTro === 'Partner') {
      tour.partner = req.user._id;
    } else if (req.user.vaiTro === 'WebsiteManager' && req.body.partner !== undefined) {
      tour.partner = req.body.partner || null;
    }

    await tour.save();

    res.status(200).json({ success: true, data: tour });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Xóa tour (WebsiteManager/Partner)
// @route   DELETE /api/tours/:id
exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tour',
      });
    }

    if (!canManageTour(req.user, tour)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa tour này',
      });
    }

    await tour.deleteOne();

    res.status(200).json({ success: true, message: 'Đã xóa tour' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy tour theo địa điểm
// @route   GET /api/tours/place/:placeId
exports.getToursByPlace = async (req, res) => {
  try {
    const tours = await Tour.find({
      diaDiem: req.params.placeId,
      hienThi: true,
    })
      .populate('diaDiem', 'tenDiaDiem')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: tours.length,
      data: tours,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
