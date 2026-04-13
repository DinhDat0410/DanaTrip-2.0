const crypto = require('crypto');
const Booking = require('../models/Booking');
const Tour = require('../models/Tour');

function parseBookingIdFromTxnRef(txnRef) {
  if (!txnRef || typeof txnRef !== 'string' || !txnRef.startsWith('booking')) return null;
  const rest = txnRef.slice(7).split('_')[0];
  return /^[a-f\d]{24}$/i.test(rest) ? rest : null;
}

function sortObject(input) {
  return Object.keys(input)
    .sort()
    .reduce((result, key) => {
      const value = input[key];
      if (value !== undefined && value !== null && value !== '') {
        result[key] = value;
      }
      return result;
    }, {});
}

function buildSignedQuery(params) {
  const sorted = sortObject(params);
  return Object.keys(sorted)
    .map((key) => `${key}=${encodeURIComponent(String(sorted[key])).replace(/%20/g, '+')}`)
    .join('&');
}

function formatVNPayDate(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0');

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join('');
}

function verifyVNPaySignature(payload = {}) {
  const secretKey = process.env.VNP_HASHSECRET;
  const providedHash = payload.vnp_SecureHash;

  if (!secretKey || !providedHash) {
    return false;
  }

  const params = { ...payload };
  delete params.vnp_SecureHash;
  delete params.vnp_SecureHashType;

  const signData = buildSignedQuery(params);
  const expectedHash = crypto
    .createHmac('sha512', secretKey)
    .update(signData)
    .digest('hex');

  return expectedHash === providedHash;
}

async function releaseSeatsForBooking(booking) {
  const tour = await Tour.findById(booking.tour);
  if (!tour) return;

  tour.soChoDaDat -= booking.soNguoiLon + booking.soTreEm;
  if (tour.soChoDaDat < 0) tour.soChoDaDat = 0;
  await tour.save();
}

async function syncBookingPaymentStatus(payload) {
  const txnRef = payload.vnp_TxnRef || '';
  const bookingId = parseBookingIdFromTxnRef(txnRef);

  if (!bookingId) {
    return { success: false, status: 400, message: 'vnp_TxnRef không hợp lệ' };
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return { success: false, status: 404, message: 'Không tìm thấy booking' };
  }

  if (booking.phuongThucThanhToan !== 'VNPay') {
    return { success: false, status: 400, message: 'Booking không dùng VNPay' };
  }

  if (booking.vnpTxnRef && booking.vnpTxnRef !== txnRef) {
    return { success: false, status: 409, message: 'vnp_TxnRef không khớp với booking' };
  }

  if (Number(booking.tongTien) * 100 !== Number(payload.vnp_Amount)) {
    return { success: false, status: 400, message: 'Số tiền không khớp booking' };
  }

  const responseCode = String(payload.vnp_ResponseCode || '');
  const transactionStatus = String(payload.vnp_TransactionStatus || '');
  const isSuccess = responseCode === '00' && (!transactionStatus || transactionStatus === '00');
  let changed = false;

  booking.vnpTxnRef = txnRef;
  booking.vnpTransactionNo = String(payload.vnp_TransactionNo || booking.vnpTransactionNo || '');
  booking.paymentResultCode = transactionStatus
    ? `${responseCode}|${transactionStatus}`
    : responseCode;
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
    booking,
    message: changed
      ? finalStatusMessage.replace('đang ở', 'đã được cập nhật sang')
      : finalStatusMessage,
  };
}

exports.createVNPayPayment = async (req, res) => {
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
    if (booking.phuongThucThanhToan !== 'VNPay') {
      return res.status(400).json({ message: 'Booking không dùng phương thức VNPay' });
    }

    const tmnCode = process.env.VNP_TMNCODE;
    const secretKey = process.env.VNP_HASHSECRET;
    const vnpUrl = process.env.VNP_URL;
    const returnUrl = process.env.VNP_RETURNURL;

    const missingEnvVars = [
      !tmnCode?.trim() && 'VNP_TMNCODE',
      !secretKey?.trim() && 'VNP_HASHSECRET',
      !vnpUrl?.trim() && 'VNP_URL',
      !returnUrl?.trim() && 'VNP_RETURNURL',
    ].filter(Boolean);

    if (missingEnvVars.length) {
      return res.status(503).json({
        message:
          'Thiếu cấu hình VNPay trên server. Thêm các biến vào danatrip-backend/.env, rồi tắt và chạy lại backend (npm start / node server.js).',
        missingEnvVars,
      });
    }

    const txnRef = `booking${booking._id}_${Date.now()}`;
    const ipAddr =
      (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
      req.socket?.remoteAddress ||
      req.ip ||
      '127.0.0.1';

    const params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `Thanh toan DanaTrip ${booking.tour?.tenTour || booking._id}`.slice(0, 255),
      vnp_OrderType: 'other',
      vnp_Amount: Number(booking.tongTien) * 100,
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: formatVNPayDate(),
    };

    const signData = buildSignedQuery(params);
    const secureHash = crypto
      .createHmac('sha512', secretKey)
      .update(signData)
      .digest('hex');

    booking.vnpTxnRef = txnRef;
    booking.vnpTransactionNo = '';
    booking.paymentResultCode = '';
    booking.paymentUpdatedAt = null;
    await booking.save();

    return res.json({
      payUrl: `${vnpUrl}?${signData}&vnp_SecureHash=${secureHash}`,
      txnRef,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi create VNPay', error: error.message });
  }
};

exports.syncVNPayReturn = async (req, res) => {
  try {
    const payload = req.body || {};

    if (!verifyVNPaySignature(payload)) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu trả về từ VNPay không hợp lệ',
      });
    }

    const result = await syncBookingPaymentStatus(payload);
    return res.status(result.status).json({
      success: result.success,
      message: result.message,
      data: result.booking,
    });
  } catch (error) {
    console.error('VNPay return sync:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể đồng bộ trạng thái thanh toán VNPay',
    });
  }
};
