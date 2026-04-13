import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import API from '../../api/axios';
import '../../styles/momoReturn.css';

const VNPayPaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const [syncMessage, setSyncMessage] = useState('');

  const payload = useMemo(
    () => Object.fromEntries(searchParams.entries()),
    [searchParams]
  );

  const {
    ok,
    responseCode,
    transactionStatus,
    message,
    txnRef,
    amount,
  } = useMemo(() => {
    const code = searchParams.get('vnp_ResponseCode') || '';
    const status = searchParams.get('vnp_TransactionStatus') || '';
    return {
      ok: code === '00' && (!status || status === '00'),
      responseCode: code,
      transactionStatus: status,
      message: searchParams.get('vnp_OrderInfo') || '',
      txnRef: searchParams.get('vnp_TxnRef') || '',
      amount: searchParams.get('vnp_Amount') || '',
    };
  }, [searchParams]);

  useEffect(() => {
    const shouldSync = txnRef && responseCode;
    if (!shouldSync) return undefined;

    let isMounted = true;

    const syncBookingStatus = async () => {
      try {
        const res = await API.post('/payment/vnpay-return-sync', payload);
        if (!isMounted) return;
        setSyncMessage(
          res.data?.message ||
            (ok
              ? 'Trạng thái booking đã được cập nhật thành Đã thanh toán.'
              : 'Trạng thái booking đã được cập nhật thành Đã hủy.')
        );
      } catch (error) {
        if (!isMounted) return;
        setSyncMessage(
          error.response?.data?.message ||
            'Chưa thể đồng bộ trạng thái booking tự động. Vui lòng kiểm tra lại trong lịch sử đặt tour.'
        );
      }
    };

    syncBookingStatus();

    return () => {
      isMounted = false;
    };
  }, [ok, payload, responseCode, txnRef]);

  return (
    <div className="page-container momo-return">
      <div className="momo-return__card">
        {ok ? (
          <>
            <div className="momo-return__icon momo-return__icon--success" aria-hidden>
              <FaCheckCircle />
            </div>
            <h1 className="momo-return__title">Thanh toán VNPay thành công</h1>
            <p className="momo-return__lead">
              {syncMessage || 'Giao dịch đã được ghi nhận và booking đang được đồng bộ trạng thái.'}
            </p>
          </>
        ) : (
          <>
            <div className="momo-return__icon momo-return__icon--warn" aria-hidden>
              <FaExclamationTriangle />
            </div>
            <h1 className="momo-return__title">Thanh toán VNPay chưa hoàn tất</h1>
            <p className="momo-return__lead">
              {syncMessage ||
                'Giao dịch không thành công hoặc đã bị hủy. Booking sẽ được chuyển sang Đã hủy.'}
            </p>
          </>
        )}

        <div className="momo-return__panel">
          <h2 className="momo-return__panel-title">Chi tiết giao dịch VNPay</h2>

          <div className="momo-return__row">
            <span className="momo-return__label">Mã đơn (vnp_TxnRef)</span>
            <span className="momo-return__value momo-return__value--code">
              {txnRef || '—'}
            </span>
          </div>

          <div className="momo-return__row">
            <span className="momo-return__label">Số tiền</span>
            <span className="momo-return__value momo-return__value--amount">
              {amount ? `${Number(amount / 100).toLocaleString('vi-VN')}đ` : '—'}
            </span>
          </div>

          <div className="momo-return__row">
            <span className="momo-return__label">Mã phản hồi</span>
            <span className="momo-return__badge">{responseCode || '—'}</span>
          </div>

          <div className="momo-return__row">
            <span className="momo-return__label">Trạng thái giao dịch</span>
            <span className="momo-return__badge">{transactionStatus || '—'}</span>
          </div>

          <div className="momo-return__row">
            <span className="momo-return__label">Nội dung</span>
            <span className="momo-return__value">{message || '—'}</span>
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

export default VNPayPaymentReturn;
