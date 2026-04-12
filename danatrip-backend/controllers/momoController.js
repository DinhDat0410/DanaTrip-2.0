const axios = require('axios');
const crypto = require('crypto');
const Booking = require('../models/Booking');

function parseBookingIdFromOrderId(orderId) {
  if (!orderId || typeof orderId !== 'string' || !orderId.startsWith('booking')) return null;
  const rest = orderId.slice(7).split('_')[0];
  return /^[a-f\d]{24}$/i.test(rest) ? rest : null;
}

exports.createMomoPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ message: 'Thiếu bookingId' });
    }

    const booking = await Booking.findById(bookingId).populate('tour', 'tenTour');
    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy booking' });
    }
    if (!booking.user || booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Không có quyền thanh toán booking này' });
    }
    if (booking.phuongThucThanhToan !== 'Momo') {
      return res.status(400).json({ message: 'Booking không dùng phương thức MoMo' });
    }

    const partnerCode = process.env.MOMO_PARTNER_CODE;
    const accessKey = process.env.MOMO_ACCESS_KEY;
    const secretKey = process.env.MOMO_SECRET_KEY;
    const redirectUrl = process.env.MOMO_REDIRECT_URL;
    const ipnUrl = process.env.MOMO_IPN_URL;
    const endpoint = process.env.MOMO_ENDPOINT;

    const missingEnvVars = [
      !partnerCode?.trim() && 'MOMO_PARTNER_CODE',
      !accessKey?.trim() && 'MOMO_ACCESS_KEY',
      !secretKey?.trim() && 'MOMO_SECRET_KEY',
      !redirectUrl?.trim() && 'MOMO_REDIRECT_URL',
      !ipnUrl?.trim() && 'MOMO_IPN_URL',
      !endpoint?.trim() && 'MOMO_ENDPOINT',
    ].filter(Boolean);

    if (missingEnvVars.length) {
      return res.status(503).json({
        message:
          'Thiếu cấu hình MoMo trên server. Thêm các biến vào danatrip-backend/.env, rồi tắt và chạy lại backend (npm start / node server.js).',
        missingEnvVars,
      });
    }

    const amount = String(booking.tongTien);
    const orderInfo = `DanaTrip - ${booking.tour?.tenTour || 'Đặt tour'}`
      .slice(0, 255);
    const requestId = partnerCode + Date.now();
    const orderId = `booking${booking._id}_${Date.now()}`;
    const requestType = 'captureWallet';

    const rawSignature =
      'accessKey=' + accessKey +
      '&amount=' + amount +
      '&extraData=' +
      '&ipnUrl=' + ipnUrl +
      '&orderId=' + orderId +
      '&orderInfo=' + orderInfo +
      '&partnerCode=' + partnerCode +
      '&redirectUrl=' + redirectUrl +
      '&requestId=' + requestId +
      '&requestType=' + requestType;

    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    const requestBody = {
      partnerCode,
      accessKey,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      extraData: '',
      requestType,
      signature,
      lang: 'vi',
    };

    const response = await axios.post(endpoint, requestBody);
    const data = response.data;

    if (data && data.resultCode === 0 && data.payUrl) {
      return res.json({ payUrl: data.payUrl, orderId });
    }

    return res.status(400).json({
      message: data?.message || 'Tạo thanh toán MoMo thất bại',
      resultCode: data?.resultCode,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi create momo', error: error.message });
  }
};

// POST /api/payment/momo-ipn — MoMo yêu cầu HTTP 204, xác thực chữ ký (tài liệu MoMo v3)
exports.handleMomoIPN = async (req, res) => {
  try {
    const body = req.body;
    const secretKey = process.env.MOMO_SECRET_KEY;
    const accessKey = process.env.MOMO_ACCESS_KEY;

    if (!body?.signature || !secretKey || !accessKey) {
      return res.status(400).end();
    }

    const rawSignature =
      'accessKey=' + accessKey +
      '&amount=' + body.amount +
      '&extraData=' + (body.extraData || '') +
      '&message=' + body.message +
      '&orderId=' + body.orderId +
      '&orderInfo=' + body.orderInfo +
      '&orderType=' + body.orderType +
      '&partnerCode=' + body.partnerCode +
      '&payType=' + body.payType +
      '&requestId=' + body.requestId +
      '&responseTime=' + body.responseTime +
      '&resultCode=' + body.resultCode +
      '&transId=' + body.transId;

    const expectedSig = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    if (expectedSig !== body.signature) {
      return res.status(400).end();
    }

    const bookingId = parseBookingIdFromOrderId(body.orderId);
    if (bookingId && (body.resultCode === 0 || body.resultCode === 9000)) {
      const booking = await Booking.findById(bookingId);
      if (
        booking &&
        String(booking.tongTien) === String(body.amount)
      ) {
        booking.trangThai = 'Đã thanh toán';
        await booking.save();
      }
    }

    return res.status(204).end();
  } catch (error) {
    console.error('MoMo IPN:', error);
    return res.status(500).end();
  }
};