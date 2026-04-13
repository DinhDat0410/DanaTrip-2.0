const nodemailer = require('nodemailer');

const hasMailConfig = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

const transporter = hasMailConfig
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  : null;

const formatCurrency = (value = 0) =>
  Number(value).toLocaleString('vi-VN');

const formatDate = (value) => {
  if (!value) return 'Chưa cập nhật';
  return new Date(value).toLocaleDateString('vi-VN');
};

const sendMail = async (to, subject, html) => {
  if (!hasMailConfig || !transporter) {
    throw new Error('Thiếu cấu hình EMAIL_USER hoặc EMAIL_PASS');
  }

  const mailOptions = {
    from: `"DANATrip" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  return transporter.sendMail(mailOptions);
};

const buildBookingConfirmationTemplate = (booking) => {
  const tourName = booking.tour?.tenTour || 'Tour đã đặt';
  const departureDate = formatDate(booking.tour?.ngayKhoiHanh);
  const paymentMethod = booking.phuongThucThanhToan || 'Cash';
  const bookingCode = booking._id?.toString() || '';

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 640px; margin: 0 auto;">
      <h2 style="color: #0f766e;">Xác nhận đặt tour thành công</h2>
      <p>Xin chào <strong>${booking.hoTen}</strong>,</p>
      <p>Cảm ơn bạn đã đặt tour tại <strong>DANATrip</strong>. Dưới đây là thông tin booking của bạn:</p>

      <div style="background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p><strong>Mã booking:</strong> ${bookingCode}</p>
        <p><strong>Tên tour:</strong> ${tourName}</p>
        <p><strong>Ngày khởi hành:</strong> ${departureDate}</p>
        <p><strong>Người lớn:</strong> ${booking.soNguoiLon}</p>
        <p><strong>Trẻ em:</strong> ${booking.soTreEm}</p>
        <p><strong>Tổng tiền:</strong> ${formatCurrency(booking.tongTien)}đ</p>
        <p><strong>Phương thức thanh toán:</strong> ${paymentMethod}</p>
        <p><strong>Trạng thái:</strong> ${booking.trangThai}</p>
        <p><strong>Số điện thoại:</strong> ${booking.sdt}</p>
        ${booking.ghiChu ? `<p><strong>Ghi chú:</strong> ${booking.ghiChu}</p>` : ''}
      </div>

      <p>Chúng tôi sẽ liên hệ với bạn sớm nếu cần xác nhận thêm thông tin.</p>
      <p>Trân trọng,<br /><strong>DANATrip</strong></p>
    </div>
  `;
};

const sendBookingConfirmationEmail = async (booking) => {
  if (!booking?.email) {
    return null;
  }

  const subject = `DANATrip - Xác nhận booking ${booking.tour?.tenTour || ''}`.trim();
  const html = buildBookingConfirmationTemplate(booking);

  return sendMail(booking.email, subject, html);
};

const sendResetPasswordEmail = async ({ email, hoTen, resetUrl }) => {
  if (!email) {
    return null;
  }

  const subject = 'DANATrip - Đặt lại mật khẩu';
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 640px; margin: 0 auto;">
      <h2 style="color: #0f766e;">Yêu cầu đặt lại mật khẩu</h2>
      <p>Xin chào <strong>${hoTen || 'bạn'}</strong>,</p>
      <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản DANATrip của bạn.</p>
      <p>Hãy bấm vào nút bên dưới để tạo mật khẩu mới. Link này có hiệu lực trong <strong>10 phút</strong>.</p>
      <p style="margin: 24px 0;">
        <a href="${resetUrl}" style="display: inline-block; background: #0f766e; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: bold;">
          Đặt lại mật khẩu
        </a>
      </p>
      <p>Nếu nút không hoạt động, bạn có thể copy link này vào trình duyệt:</p>
      <p style="word-break: break-all;"><a href="${resetUrl}">${resetUrl}</a></p>
      <p>Nếu bạn không yêu cầu đổi mật khẩu, hãy bỏ qua email này.</p>
      <p>Trân trọng,<br /><strong>DANATrip</strong></p>
    </div>
  `;

  return sendMail(email, subject, html);
};

module.exports = {
  hasMailConfig,
  sendMail,
  sendBookingConfirmationEmail,
  sendResetPasswordEmail,
};
