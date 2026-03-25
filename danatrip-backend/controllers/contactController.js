const Contact = require('../models/Contact');

// @desc    Gửi liên hệ (Public - không cần đăng nhập)
// @route   POST /api/contacts
exports.createContact = async (req, res) => {
  try {
    const { ten, email, noiDung } = req.body;

    if (!ten || !email || !noiDung) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ tên, email và nội dung',
      });
    }

    const contact = await Contact.create({
      user: req.user ? req.user._id : null,
      ten,
      email,
      noiDung,
    });

    res.status(201).json({
      success: true,
      message: 'Gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất.',
      data: contact,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Lấy tất cả liên hệ (Admin)
// @route   GET /api/contacts
exports.getAllContacts = async (req, res) => {
  try {
    const query = {};
    if (req.query.trangThai) {
      query.trangThai = req.query.trangThai;
    }

    const contacts = await Contact.find(query)
      .populate('user', 'hoTen email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy chi tiết 1 liên hệ (Admin)
// @route   GET /api/contacts/:id
exports.getContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)
      .populate('user', 'hoTen email sdt');

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy liên hệ',
      });
    }

    res.status(200).json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cập nhật trạng thái liên hệ (Admin)
// @route   PUT /api/contacts/:id
exports.updateContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { trangThai: req.body.trangThai },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy liên hệ',
      });
    }

    res.status(200).json({ success: true, data: contact });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Xóa liên hệ (Admin)
// @route   DELETE /api/contacts/:id
exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy liên hệ',
      });
    }

    res.status(200).json({ success: true, message: 'Đã xóa liên hệ' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};