const axios = require('axios');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const Tour = require('../models/Tour');

const SUCCESS_RESULT_CODES = new Set(['0', '9000']);

function parseBookingIdFromOrderId(orderId) {
  if (!orderId || typeof orderId !== 'string' || !orderId.startsWith('booking')) return null;
  const rest = orderId.slice(7).split('_')[0];
  return /^[a-f\d]{24}$/i.test(rest) ? rest : null;
}

function normalizeResultCode(resultCode) {
  return String(resultCode ?? '');
}

function buildMomoRawSignature(body, accessKey) {
  return (
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
    '&transId=' + body.transId
  );
}

function verifyMomoSignature(body) {
  const secretKey = process.env.MOMO_SECRET_KEY;
  const accessKey = process.env.MOMO_ACCESS_KEY;

  if (!body?.signature || !secretKey || !accessKey) {
    return false;
  }

  const expectedSig = crypto
    .createHmac('sha256', secretKey)
    .update(buildMomoRawSignature(body, accessKey))
    .digest('hex');

  return expectedSig === body.signature;
}

async function releaseSeatsForBooking(booking) {
  const tour = await Tour.findById(booking.tour);
  if (!tour) return;

  tour.soChoDaDat -= booking.soNguoiLon + booking.soTreEm;
  if (tour.soChoDaDat < 0) tour.soChoDaDat = 0;
  await tour.save();
}

async function syncBookingPaymentStatus(payload) {
  const bookingId = parseBookingIdFromOrderId(payload.orderId);
  if (!bookingId) {
    return { success: false, status: 400, message: 'orderId không hợp lệ' };
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return { success: false, status: 404, message: 'Không tìm thấy booking' };
  }

  if (booking.phuongThucThanhToan !== 'Momo') {
    return { success: false, status: 400, message: 'Booking không dùng MoMo' };
  }

  if (booking.momoOrderId && booking.momoOrderId !== payload.orderId) {
    return { success: false, status: 409, message: 'orderId không khớp với booking' };
  }

  if (String(booking.tongTien) !== String(payload.amount)) {
    return { success: false, status: 400, message: 'Số tiền không khớp booking' };
  }

  const resultCode = normalizeResultCode(payload.resultCode);
  const isSuccess = SUCCESS_RESULT_CODES.has(resultCode);
  let changed = false;

  booking.momoOrderId = payload.orderId || booking.momoOrderId;
  booking.momoRequestId = payload.requestId || booking.momoRequestId;
  booking.momoTransId = String(payload.transId || booking.momoTransId || '');
  booking.paymentResultCode = resultCode;
  booking.paymentUpdatedAt = new Date();

  if (isSuccess) {
    if (booking.trangThai !== 'Đã thanh toán' && booking.trangThai !== 'Đã hủy') {
      booking.trangThai = 'Đã thanh toán';
      changed = true;
    }
  } else if (booking.trangThai !== 'Đã hủy' && booking.trangThai !== 'Đã thanh toán') {
    await releaseSeatsForBooking(booking);
    booking.trangThai = 'Đã hủy';
    changed = true;
  }

  await booking.save();

  const finalStatusMessage =
    booking.trangThai === 'Đã thanh toán'
      ? 'Booking đang ở trạng thái Đã thanh toán'
      : booking.trangThai === 'Đã hủy'
        ? 'Booking đang ở trạng thái Đã hủy'
        : `Booking đang ở trạng thái ${booking.trangThai}`;

  return {
    success: true,
    status: 200,
    changed,
    booking,
    message: changed
      ? finalStatusMessage.replace('đang ở', 'đã được cập nhật sang')
      : finalStatusMessage,
  };
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
      booking.momoOrderId = orderId;
      booking.momoRequestId = requestId;
      booking.paymentResultCode = '';
      booking.momoTransId = '';
      booking.paymentUpdatedAt = null;
      await booking.save();

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
    if (!verifyMomoSignature(body)) {
      return res.status(400).end();
    }

    await syncBookingPaymentStatus(body);

    return res.status(204).end();
  } catch (error) {
    console.error('MoMo IPN:', error);
    return res.status(500).end();
  }
};

exports.syncMomoReturn = async (req, res) => {
  try {
    const payload = req.body || {};

    if (!verifyMomoSignature(payload)) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu trả về từ MoMo không hợp lệ',
      });
    }

    const result = await syncBookingPaymentStatus(payload);
    return res.status(result.status).json({
      success: result.success,
      message: result.message,
      data: result.booking,
    });
  } catch (error) {
    console.error('MoMo return sync:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể đồng bộ trạng thái thanh toán MoMo',
    });
  }
};
