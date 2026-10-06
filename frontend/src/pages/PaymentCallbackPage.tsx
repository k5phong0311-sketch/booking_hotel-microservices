import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

const PaymentCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'LOADING' | 'SUCCESS' | 'FAILED'>('LOADING');

  useEffect(() => {
    const resultCode = searchParams.get('resultCode');
    const paymentId = searchParams.get('extraData') || searchParams.get('orderId')?.split('_')[0] || searchParams.get('orderId');
    const transId = searchParams.get('transId') || 'MOMO_' + Date.now();

    if (resultCode === '0') {
      setStatus('SUCCESS');
      // Update backend payment status & confirm booking
      api.post('/payments/momo/ipn', {
         extraData: paymentId,
         resultCode: 0,
         transId: transId,
      }).catch(e => console.log('IPN error:', e));
    } else {
      setStatus('FAILED');
    }
  }, [searchParams]);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {status === 'LOADING' && <h2>⌛ Đang kiểm tra giao dịch...</h2>}
        
        {status === 'SUCCESS' && (
          <>
            <h2 style={{ color: '#2ecc71' }}>✔️ Thanh toán thành công!</h2>
            <p>Đơn đặt phòng của bạn đã được thanh toán.</p>
            <button style={styles.btn} onClick={() => navigate('/my-bookings')}>
              Xem lịch sử đặt phòng
            </button>
          </>
        )}

        {status === 'FAILED' && (
          <>
            <h2 style={{ color: '#e74c3c' }}>❌ Thanh toán thất bại</h2>
            <p>Giao dịch của bạn đã bị hủy hoặc xảy ra lỗi.</p>
            <button style={{ ...styles.btn, background: '#e74c3c' }} onClick={() => navigate('/')}>
              Quay lại trang chủ
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f7fa' },
  card: { background: '#fff', padding: 40, borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', textAlign: 'center' as const, maxWidth: 400 },
  btn: { marginTop: 20, padding: '12px 24px', background: '#3498db', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }
};

export default PaymentCallbackPage;
