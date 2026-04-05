const Place = require('../models/Place');

// @desc    Lấy tất cả địa điểm (public - chỉ hiển thị)
// @route   GET /api/places
exports.getPlaces = async (req, res) => {
  try {
    const query = { hienThi: true };

    if (req.query.search) {
      const escaped = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.tenDiaDiem = { $regex: escaped, $options: 'i' };
    }

    const places = await Place.find(query)
      .select('tenDiaDiem noiDung hinhAnhChinh viTri')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: places.length,
      data: places,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy chi tiết 1 địa điểm
// @route   GET /api/places/:id
exports.getPlace = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);

    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy địa điểm',
      });
    }

    res.status(200).json({ success: true, data: place });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Tạo địa điểm mới (Admin)
// @route   POST /api/places
exports.createPlace = async (req, res) => {
  try {
    const place = await Place.create(req.body);

    res.status(201).json({ success: true, data: place });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Cập nhật địa điểm (Admin)
// @route   PUT /api/places/:id
exports.updatePlace = async (req, res) => {
  try {
    const place = await Place.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy địa điểm',
      });
    }

    res.status(200).json({ success: true, data: place });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Xóa địa điểm (Admin)
// @route   DELETE /api/places/:id
exports.deletePlace = async (req, res) => {
  try {
    const place = await Place.findByIdAndDelete(req.params.id);

    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy địa điểm',
      });
    }

    res.status(200).json({ success: true, message: 'Đã xóa địa điểm' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};