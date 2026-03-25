const Tour = require('../models/Tour');

// @desc    Lấy tất cả tour (public)
// @route   GET /api/tours
exports.getTours = async (req, res) => {
  try {
    // Hỗ trợ filter theo địa điểm, tag, giá
    const query = { hienThi: true };

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
      .populate('diaDiem', 'tenDiaDiem hinhAnhChinh viTri');

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

// @desc    Tạo tour mới (Admin)
// @route   POST /api/tours
exports.createTour = async (req, res) => {
  try {
    const tour = await Tour.create(req.body);

    res.status(201).json({ success: true, data: tour });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Cập nhật tour (Admin)
// @route   PUT /api/tours/:id
exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tour',
      });
    }

    res.status(200).json({ success: true, data: tour });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Xóa tour (Admin)
// @route   DELETE /api/tours/:id
exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tour',
      });
    }

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