const Booking = require('../models/Booking');
const Tour = require('../models/Tour');
const { hasMailConfig, sendBookingConfirmationEmail } = require('../utils/mailer');

// @desc    Tạo booking mới (User)
// @route   POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const { tour, soNguoiLon, soTreEm, hoTen, sdt, email, phuongThucThanhToan, ghiChu } = req.body;

    // Kiểm tra tour có tồn tại không
    const tourData = await Tour.findById(tour);
    if (!tourData) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tour',
      });
    }

    // Kiểm tra còn chỗ không
    const soChoYeuCau = (soNguoiLon || 1) + (soTreEm || 0);
    const soChoConLai = tourData.soCho - tourData.soChoDaDat;

    if (soChoYeuCau > soChoConLai) {
      return res.status(400).json({
        success: false,
        message: `Tour chỉ còn ${soChoConLai} chỗ trống`,
      });
    }

    // Tính tổng tiền
    const tongTien =
      (soNguoiLon || 1) * tourData.giaNguoiLon +
      (soTreEm || 0) * tourData.giaTreEm;

    // Tạo booking
    const booking = await Booking.create({
      user: req.user ? req.user._id : null,
      tour,
      hoTen,
      sdt,
      email,
      soNguoiLon: soNguoiLon || 1,
      soTreEm: soTreEm || 0,
      tongTien,
      phuongThucThanhToan: phuongThucThanhToan || 'Cash',
      ghiChu: ghiChu || '',
    });

    // Cập nhật số chỗ đã đặt trong Tour
    tourData.soChoDaDat += soChoYeuCau;
    await tourData.save();

    // Populate thông tin tour trả về
    const populatedBooking = await Booking.findById(booking._id)
      .populate('tour', 'tenTour giaNguoiLon giaTreEm ngayKhoiHanh')
      .populate('user', 'hoTen email');

    if (populatedBooking.email) {
      try {
        await sendBookingConfirmationEmail(populatedBooking);
      } catch (mailError) {
        console.error('Khong gui duoc email xac nhan booking:', mailError.message);
        if (!hasMailConfig) {
          console.warn('Email config chua day du. Kiem tra EMAIL_USER va EMAIL_PASS trong .env');
        }
      }
    }

    res.status(201).json({ success: true, data: populatedBooking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Lấy lịch sử booking của user hiện tại
// @route   GET /api/bookings/my
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('tour', 'tenTour giaNguoiLon ngayKhoiHanh hinhAnh')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy tất cả bookings (Admin)
// @route   GET /api/bookings
exports.getAllBookings = async (req, res) => {
  try {
    // Hỗ trợ filter theo trạng thái
    const query = {};
    if (req.query.trangThai) {
      query.trangThai = req.query.trangThai;
    }

    const bookings = await Booking.find(query)
      .populate('tour', 'tenTour ngayKhoiHanh')
      .populate('user', 'hoTen email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy chi tiết 1 booking
// @route   GET /api/bookings/:id
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('tour', 'tenTour giaNguoiLon giaTreEm ngayKhoiHanh lichTrinh')
      .populate('user', 'hoTen email sdt');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy booking',
      });
    }

    // User thường chỉ xem được booking của mình
    if (
      req.user.vaiTro !== 'Admin' &&
      booking.user &&
      booking.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem booking này',
      });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cập nhật trạng thái booking (Admin)
// @route   PUT /api/bookings/:id
exports.updateBooking = async (req, res) => {
  try {
    const { trangThai } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy booking',
      });
    }

    // Nếu hủy booking → trả lại số chỗ cho tour
    if (trangThai === 'Đã hủy' && booking.trangThai !== 'Đã hủy') {
      const tour = await Tour.findById(booking.tour);
      if (tour) {
        tour.soChoDaDat -= booking.soNguoiLon + booking.soTreEm;
        if (tour.soChoDaDat < 0) tour.soChoDaDat = 0;
        await tour.save();
      }
    }

    booking.trangThai = trangThai;
    await booking.save();

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Hủy booking (User tự hủy)
// @route   PUT /api/bookings/:id/cancel
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy booking',
      });
    }

    // Kiểm tra quyền: chỉ chủ booking mới được hủy
    if (
      booking.user &&
      booking.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền hủy booking này',
      });
    }

    // Chỉ hủy được khi đang ở trạng thái Chờ xác nhận
    if (booking.trangThai !== 'Chờ xác nhận') {
      return res.status(400).json({
        success: false,
        message: `Không thể hủy booking ở trạng thái "${booking.trangThai}"`,
      });
    }

    // Trả lại chỗ cho tour
    const tour = await Tour.findById(booking.tour);
    if (tour) {
      tour.soChoDaDat -= booking.soNguoiLon + booking.soTreEm;
      if (tour.soChoDaDat < 0) tour.soChoDaDat = 0;
      await tour.save();
    }

    booking.trangThai = 'Đã hủy';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Đã hủy booking thành công',
      data: booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
