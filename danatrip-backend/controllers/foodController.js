const Food = require('../models/Food');

// @desc    Lấy tất cả món ăn (public)
// @route   GET /api/foods
exports.getFoods = async (req, res) => {
  try {
    // Hỗ trợ tìm kiếm theo tên
    const query = { hienThi: true };

    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    const foods = await Food.find(query)
      .select('tenMon moTa hinhAnh')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: foods.length,
      data: foods,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy chi tiết 1 món ăn (gồm nguyên liệu, quy trình, quán ăn)
// @route   GET /api/foods/:id
exports.getFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy món ăn',
      });
    }

    res.status(200).json({ success: true, data: food });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Tạo món ăn mới (Admin)
// @route   POST /api/foods
exports.createFood = async (req, res) => {
  try {
    const food = await Food.create(req.body);

    res.status(201).json({ success: true, data: food });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Cập nhật món ăn (Admin)
// @route   PUT /api/foods/:id
exports.updateFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy món ăn',
      });
    }

    res.status(200).json({ success: true, data: food });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Xóa món ăn (Admin)
// @route   DELETE /api/foods/:id
exports.deleteFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy món ăn',
      });
    }

    res.status(200).json({ success: true, message: 'Đã xóa món ăn' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};