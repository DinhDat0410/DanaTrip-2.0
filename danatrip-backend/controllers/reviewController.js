const Review = require('../models/Review');
const Tour = require('../models/Tour');
const Booking = require('../models/Booking');

// @desc    Lấy tất cả đánh giá của 1 tour
// @route   GET /api/reviews/tour/:tourId
exports.getReviewsByTour = async (req, res) => {
  try {
    const reviews = await Review.find({ tour: req.params.tourId })
      .populate('user', 'hoTen avatar')
      .sort('-createdAt');

    // Tính điểm trung bình
    const totalReviews = reviews.length;
    const avgRating =
      totalReviews > 0
        ? (reviews.reduce((sum, r) => sum + r.sao, 0) / totalReviews).toFixed(1)
        : 0;

    res.status(200).json({
      success: true,
      count: totalReviews,
      avgRating: Number(avgRating),
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy tất cả đánh giá (Admin)
// @route   GET /api/reviews
exports.getAllReviews = async (req, res) => {
  try {
    const query = {};
    if (req.query.tour) query.tour = req.query.tour;
    if (req.query.sao) query.sao = Number(req.query.sao);

    const reviews = await Review.find(query)
      .populate('user', 'hoTen email avatar')
      .populate('tour', 'tenTour')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Tạo đánh giá (User - phải đã booking tour đó)
// @route   POST /api/reviews
exports.createReview = async (req, res) => {
  try {
    const { tour, sao, noiDung } = req.body;

    // Kiểm tra tour tồn tại
    const tourExists = await Tour.findById(tour);
    if (!tourExists) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tour',
      });
    }

    // Kiểm tra user đã booking tour này chưa
    const hasBooked = await Booking.findOne({
      user: req.user._id,
      tour: tour,
      trangThai: { $in: ['Đã xác nhận', 'Đã thanh toán'] },
    });

    if (!hasBooked) {
      return res.status(400).json({
        success: false,
        message: 'Bạn cần đặt và hoàn thành tour trước khi đánh giá',
      });
    }

    // Kiểm tra đã đánh giá chưa (mỗi user chỉ đánh giá 1 lần / tour)
    const existingReview = await Review.findOne({
      user: req.user._id,
      tour: tour,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã đánh giá tour này rồi',
      });
    }

    const review = await Review.create({
      tour,
      user: req.user._id,
      sao,
      noiDung: noiDung || '',
    });

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'hoTen avatar')
      .populate('tour', 'tenTour');

    res.status(201).json({ success: true, data: populatedReview });
  } catch (error) {
    // Xử lý lỗi unique index (đánh giá trùng)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã đánh giá tour này rồi',
      });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Cập nhật đánh giá (User - chỉ sửa đánh giá của mình)
// @route   PUT /api/reviews/:id
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá',
      });
    }

    // Chỉ chủ đánh giá mới được sửa
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền sửa đánh giá này',
      });
    }

    // Chỉ cho sửa sao và nội dung
    if (req.body.sao) review.sao = req.body.sao;
    if (req.body.noiDung !== undefined) review.noiDung = req.body.noiDung;

    await review.save();

    const updatedReview = await Review.findById(review._id)
      .populate('user', 'hoTen avatar');

    res.status(200).json({ success: true, data: updatedReview });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Xóa đánh giá (User xóa của mình hoặc Admin xóa bất kỳ)
// @route   DELETE /api/reviews/:id
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá',
      });
    }

    // Kiểm tra quyền: chủ đánh giá hoặc Admin
    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.vaiTro !== 'Admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa đánh giá này',
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Đã xóa đánh giá' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};