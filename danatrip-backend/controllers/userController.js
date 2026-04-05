const User = require('../models/User');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

// @desc    Lấy danh sách users
// @route   GET /api/users
// @access  Admin
const getUsers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { hoTen: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const users = await User.find(query).select('-matKhau').sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy chi tiết 1 user
// @route   GET /api/users/:id
// @access  Admin
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-matKhau');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Tạo user mới
// @route   POST /api/users
// @access  Admin
const createUser = async (req, res) => {
  try {
    const { hoTen, email, matKhau, sdt, vaiTro, trangThai, hienThi } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email đã tồn tại' });
    }

    const user = await User.create({ hoTen, email, matKhau, sdt, vaiTro, trangThai, hienThi });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        hoTen: user.hoTen,
        email: user.email,
        sdt: user.sdt,
        vaiTro: user.vaiTro,
        trangThai: user.trangThai,
        hienThi: user.hienThi,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cập nhật user
// @route   PUT /api/users/:id
// @access  Admin
const updateUser = async (req, res) => {
  try {
    const { hoTen, email, matKhau, sdt, vaiTro, trangThai, hienThi } = req.body;

    const user = await User.findById(req.params.id).select('+matKhau');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email đã tồn tại' });
      }
      user.email = email;
    }

    if (hoTen !== undefined) user.hoTen = hoTen;
    if (sdt !== undefined) user.sdt = sdt;
    if (vaiTro !== undefined) user.vaiTro = vaiTro;
    if (trangThai !== undefined) user.trangThai = trangThai;
    if (hienThi !== undefined) user.hienThi = hienThi;

    // Chỉ cập nhật mật khẩu nếu có giá trị mới
    if (matKhau && matKhau.trim() !== '') {
      user.matKhau = matKhau;
    }

    await user.save();

    res.json({
      success: true,
      data: {
        _id: user._id,
        hoTen: user.hoTen,
        email: user.email,
        sdt: user.sdt,
        vaiTro: user.vaiTro,
        trangThai: user.trangThai,
        hienThi: user.hienThi,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Xóa user (và cascade bookings/reviews)
// @route   DELETE /api/users/:id
// @access  Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    // Cascade delete
    await Booking.deleteMany({ user: req.params.id });
    await Review.deleteMany({ user: req.params.id });
    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Đã xóa người dùng' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getUsers, getUser, createUser, updateUser, deleteUser };
