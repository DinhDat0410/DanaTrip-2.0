import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import '../../styles/momoReturn.css';

/**
 * MoMo redirectUrl (GET): thêm query resultCode, orderId, message, amount, ...
 * Trạng thái đơn chính xác do IPN cập nhật; trang này chỉ để báo cho người dùng.
 */
const MomoPaymentReturn = () => {
  const [searchParams] = useSearchParams();

  const { ok, resultCode, message, orderId, amount } = useMemo(() => {
    const code = Number(searchParams.get('resultCode'));
    const success = code === 0 || code === 9000;
    return {
      ok: success,
      resultCode: searchParams.get('resultCode'),
      message: searchParams.get('message') || '',
      orderId: searchParams.get('orderId') || '',
      amount: searchParams.get('amount') || '',
    };
  }, [searchParams]);

  return (
    <div className="page-container momo-return">
      <div className="momo-return__card">
        {ok ? (
          <>
            <div className="momo-return__icon momo-return__icon--success" aria-hidden>
              <FaCheckCircle />
            </div>
            <h1 className="momo-return__title">Thanh toán MoMo thành công</h1>
            <p className="momo-return__lead">
              Giao dịch đã được ghi nhận. Trạng thái đơn có thể cập nhật trong vài giây
              sau khi MoMo thông báo tới hệ thống.
            </p>
          </>
        ) : (
          <>
            <div className="momo-return__icon momo-return__icon--warn" aria-hidden>
              <FaExclamationTriangle />
            </div>
            <h1 className="momo-return__title">Thanh toán chưa hoàn tất</h1>
            <p className="momo-return__lead">
              {message ||
                'Giao dịch không thành công hoặc đã bị hủy. Bạn có thể đặt tour lại và chọn thanh toán khác nếu cần.'}
            </p>
          </>
        )}

        <div className="momo-return__panel">
          <h2 className="momo-return__panel-title">Chi tiết giao dịch MoMo</h2>

          <div className="momo-return__row">
            <span className="momo-return__label">Mã đơn (orderId)</span>
            <span className="momo-return__value momo-return__value--code">
              {orderId || '—'}
            </span>
          </div>

          <div className="momo-return__row">
            <span className="momo-return__label">Số tiền</span>
            <span className="momo-return__value momo-return__value--amount">
              {amount ? `${Number(amount).toLocaleString('vi-VN')}đ` : '—'}
            </span>
          </div>

          <div className="momo-return__row">
            <span className="momo-return__label">Mã kết quả (resultCode)</span>
            <span className="momo-return__badge">{resultCode ?? '—'}</span>
          </div>
        </div>

        <div className="momo-return__actions">
          <Link to="/profile" className="btn-primary">
            Lịch sử đặt tour
          </Link>
          <Link to="/tours" className="btn-secondary">
            Về danh sách tour
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MomoPaymentReturn;
