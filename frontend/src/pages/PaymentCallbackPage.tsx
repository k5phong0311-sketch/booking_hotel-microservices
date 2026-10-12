import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

const PaymentCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'LOADING' | 'SUCCESS' | 'FAILED'>('LOADING');

  const paymentId = searchParams.get('extraData') || searchParams.get('orderId')?.split('_')[0] || searchParams.get('orderId');
  const transId = searchParams.get('transId') || 'MOMO_' + Date.now();
  const momoMessage = searchParams.get('message') || '';

  useEffect(() => {
    const resultCode = searchParams.get('resultCode');

    if (resultCode === '0') {
      setStatus('SUCCESS');
      api.post('/payments/momo/ipn', {
        extraData: paymentId,
        resultCode: 0,
        transId: transId,
      }).catch(e => console.log('IPN error:', e));
    } else {
      setStatus('FAILED');
    }
  }, [searchParams, paymentId, transId]);

  const handleForceConfirmDemo = async () => {
    try {
      setStatus('LOADING');
      await api.post('/payments/momo/ipn', {
        extraData: paymentId,
        resultCode: 0,
        transId: 'DEMO_' + Date.now(),
      });
      setStatus('SUCCESS');
    } catch (e) {
      alert('Không thể xác nhận giao dịch.');
      setStatus('FAILED');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {status === 'LOADING' && <h2>⌛ Đang kiểm tra giao dịch...</h2>}
        
        {status === 'SUCCESS' && (
          <>
            <h2 style={{ color: '#2ecc71', marginBottom: 12 }}>✔️ Thanh toán thành công!</h2>
            <p style={{ color: '#555' }}>Đơn đặt phòng của bạn đã được thanh toán và xác nhận.</p>
            <button style={styles.btn} onClick={() => navigate('/my-bookings')}>
              Xem lịch sử đặt phòng
            </button>
          </>
        )}

        {status === 'FAILED' && (
          <>
            <h2 style={{ color: '#e74c3c', marginBottom: 12 }}>❌ Thanh toán bị từ chối trên MoMo Sandbox</h2>
            {momoMessage && (
              <p style={{ color: '#c0392b', fontSize: 13, background: '#fdecea', padding: 10, borderRadius: 6, marginBottom: 12 }}>
                Lý do từ cổng MoMo: <strong>{momoMessage}</strong>
              </p>
            )}
            <div style={{ textAlign: 'left', background: '#f8f9fa', padding: 14, borderRadius: 8, fontSize: 13, color: '#333', marginBottom: 16, border: '1px solid #e0e0e0' }}>
              <div style={{ fontWeight: 'bold', marginBottom: 6, color: '#d82d8b' }}>📌 Lưu ý bộ thẻ Test chuẩn của MoMo Sandbox:</div>
              <div>• Số thẻ: <strong>4111111111111111</strong> (hoặc <strong>5200000000001096</strong>)</div>
              <div>• Ngày hết hạn (MM/YY): <strong>05/26</strong></div>
              <div>• Tên chủ thẻ: <strong>NGUYEN VAN A</strong></div>
              <div>• Số CVC: <strong>111</strong> | SĐT: <strong>0901234567</strong></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {paymentId && (
                <button style={{ ...styles.btn, marginTop: 0, background: '#2ecc71' }} onClick={handleForceConfirmDemo}>
                  ✔️ Xác nhận thanh toán ngay (Chế độ Demo)
                </button>
              )}
              <button style={{ ...styles.btn, marginTop: 0, background: '#e74c3c' }} onClick={() => navigate('/my-bookings')}>
                Xem đơn đặt phòng
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f7fa', padding: 20 },
  card: { background: '#fff', padding: 40, borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', textAlign: 'center' as const, maxWidth: 460, width: '100%' },
  btn: { marginTop: 20, padding: '12px 24px', background: '#3498db', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }
};

export default PaymentCallbackPage;
