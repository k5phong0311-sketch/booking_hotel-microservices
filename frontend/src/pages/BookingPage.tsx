import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roomService } from '../services/room.service';
import { bookingService } from '../services/booking.service';
import { paymentService } from '../services/payment.service';
import { Room } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

type PaymentMethodType = 'MOMO' | 'MOMO_DOMESTIC' | 'MOMO_INTERNATIONAL' | 'CARD' | 'TRANSFER';

const BookingPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  
  // New fields
  const [name, setName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState('');
  const [voucher, setVoucher] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('MOMO_DOMESTIC');

  useEffect(() => {
    if (roomId) {
      roomService.getOne(Number(roomId))
        .then(data => { setRoom(data); setLoading(false); })
        .catch(() => { setError('Kh\u00f4ng t\u00ecm th\u1ea5y ph\u00f2ng.'); setLoading(false); });
    }
  }, [roomId]);

  const today = new Date().toISOString().split('T')[0];

  const calculateDays = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const nights = calculateDays();
  const rawTotal = nights * (room?.pricePerNight || 0);
  const finalTotal = rawTotal > discount ? rawTotal - discount : 0;
  const deposit = finalTotal * 0.3;

  const handleApplyVoucher = () => {
    if (voucher.toUpperCase() === 'KM100') {
      setDiscount(100000);
      alert('\u00c1p d\u1ee5ng m\u00e3 gi\u1ea3m gi\u00e1 100k th\u00e0nh c\u00f4ng!');
    } else {
      setDiscount(0);
      alert('M\u00e3 kh\u00f4ng h\u1ee3p l\u1ec7');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !room) return;
    if (nights <= 0) { setError('Ng\u00e0y tr\u1ea3 ph\u00f2ng ph\u1ea3i sau ng\u00e0y nh\u1eadn ph\u00f2ng'); return; }

    setError('');
    setSubmitting(true);
    try {
      const booking = await bookingService.create({
        userId: user.id, roomId: room.id, checkIn, checkOut,
      });

      const paymentRes = await paymentService.create({
        bookingId: booking.id,
        userId: user.id,
        amount: finalTotal,
        method: paymentMethod as any,
      });

      if (paymentMethod.startsWith('MOMO') && paymentRes.momoUrl) {
        window.location.href = paymentRes.momoUrl; 
      } else {
        navigate('/my-bookings', { state: { newBookingId: booking.id, status: booking.status } });
      }

    } catch (err: any) {
      setError(err.response?.data?.message || 'L\u1ed7i h\u1ec7 th\u1ed1ng. Vui l\u00f2ng th\u1eed l\u1ea1i.');
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="\u0110ang chu\u1ea9n b\u1ecb..." />;
  if (!room) return null;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button onClick={() => navigate(-1)} style={styles.back}>&#8592; TR\u1ede L\u1ea0I</button>
        <h2 style={styles.title}>TH\u00d4NG TIN \u0110\u1eb6T PH\u00d2NG</h2>

        <div style={styles.layout}>
          <div style={styles.formCard}>
            {error && <div style={styles.error}>{error}</div>}
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>NG\u00c0Y NH\u1eacN PH\u00d2NG</label>
                  <input style={styles.input} type="date" value={checkIn} min={today}
                    onChange={e => setCheckIn(e.target.value)} required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>NG\u00c0Y TR\u1ea2 PH\u00d2NG</label>
                  <input style={styles.input} type="date" value={checkOut} min={checkIn || today}
                    onChange={e => setCheckOut(e.target.value)} required />
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>H\u1ecc V\u00c0 T\u00caN</label>
                <input style={styles.input} value={name} onChange={e=>setName(e.target.value)} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>S\u1ed0 \u0110I\u1ec6N THO\u1ea0I</label>
                <input style={styles.input} value={phone} onChange={e=>setPhone(e.target.value)} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>\u0110\u1ecaA CH\u1ec8</label>
                <input style={styles.input} value={address} onChange={e=>setAddress(e.target.value)} required />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>M\u00c3 KHUY\u1ebeN M\u00c3I</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input style={{ ...styles.input, flex: 1 }} placeholder="V\u00ed d\u1ee5: KM100" value={voucher} onChange={e=>setVoucher(e.target.value)} />
                  <button type="button" onClick={handleApplyVoucher} style={{ ...styles.btn, padding: '0 20px', marginTop: 0 }}>\u00c1P D\u1ee4NG</button>
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>PH\u01af\u01a0NG TH\u1ee8C THANH TO\u00c1N</label>
                <select 
                  style={styles.select} 
                  value={paymentMethod} 
                  onChange={e => setPaymentMethod(e.target.value as PaymentMethodType)}
                >
                  <option value="MOMO_DOMESTIC">Thanh to\u00e1n MoMo (Th\u1ebb n\u1ed9i \u0111\u1ecba)</option>
                  <option value="MOMO_INTERNATIONAL">Thanh to\u00e1n MoMo (Th\u1ebb qu\u1ed1c t\u1ebf)</option>
                  <option value="CARD">Th\u1ebb t\u00edn d\u1ee5ng / Th\u1ebb ghi n\u1ee3</option>
                  <option value="TRANSFER">Chuy\u1ec3n kho\u1ea3n ng\u00e2n h\u00e0ng</option>
                </select>
              </div>

              {nights > 0 && (
                <div style={styles.summary}>
                  <div style={styles.summaryRow}>
                    <span>Th\u1eddi gian l\u01b0u tr\u00fa:</span>
                    <span>{nights} \u0111\u00eam</span>
                  </div>
                  <div style={styles.summaryRow}>
                    <span>Gi\u00e1 m\u1ed7i \u0111\u00eam:</span>
                    <span>{Number(room.pricePerNight).toLocaleString('vi-VN')} VND</span>
                  </div>
                  {discount > 0 && (
                    <div style={styles.summaryRow}>
                      <span style={{color: '#e74c3c'}}>Gi\u1ea3m gi\u00e1 voucher:</span>
                      <span style={{color: '#e74c3c'}}>-{discount.toLocaleString('vi-VN')} VND</span>
                    </div>
                  )}
                  <hr style={styles.divider} />
                  <div style={styles.summaryRow}>
                    <span style={{color: '#fff', fontSize: 16}}>T\u1ed4NG C\u1ed8NG:</span>
                    <span style={styles.total}>{finalTotal.toLocaleString('vi-VN')} VND</span>
                  </div>
                  <div style={styles.summaryRow}>
                    <span style={{color: '#888', fontSize: 12}}>Y\u00eau c\u1ea7u \u0111\u1eb7t c\u1ecdc (30%):</span>
                    <span style={{color: '#c5a059', fontSize: 14}}>{deposit.toLocaleString('vi-VN')} VND</span>
                  </div>
                </div>
              )}

              <button type="submit" style={styles.btn} disabled={submitting || nights <= 0}>
                {submitting ? '\u0110ANG X\u1eec L\u00dd...' : 'X\u00c1C NH\u1eacN \u0110\u1eb6T PH\u00d2NG'}
              </button>
            </form>
          </div>

          <div style={styles.roomCard}>
            <div style={styles.imgBox}>
               {room.imageUrl ? <img src={room.imageUrl} alt={room.name} style={styles.roomImg} /> : <div style={styles.placeholder}>BOOKINGHOTEL</div>}
            </div>
            <div style={styles.roomInfo}>
               <h4 style={styles.roomName}>{room.name}</h4>
               <p style={styles.roomType}>{room.type} / T\u1ea7ng {room.floor}</p>
               <p style={styles.roomDesc}>{room.description || 'Kh\u00f4ng gian sang tr\u1ecdng b\u1eadc nh\u1ea5t v\u1edbi t\u1ea7m nh\u00ecn to\u00e0n c\u1ea3nh th\u00e0nh ph\u1ed1.'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: { background: '#0b0c10', minHeight: '100vh', padding: '60px 20px', color: '#e0e0e0' },
  container: { maxWidth: 1000, margin: '0 auto' },
  back: { background: 'none', border: 'none', padding: '0 0 20px', cursor: 'pointer', color: '#c5a059', fontSize: 12, letterSpacing: '2px', fontWeight: 600 },
  title: { margin: '0 0 40px', fontSize: 28, color: '#fff', fontWeight: 400, letterSpacing: '3px', fontFamily: 'Montserrat' },
  layout: { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 40 },
  formCard: { background: '#111217', padding: 40, border: '1px solid #222' },
  error: { background: 'rgba(231, 76, 60, 0.1)', border: '1px solid #e74c3c', color: '#e74c3c', padding: 16, marginBottom: 24, fontSize: 13, letterSpacing: '1px' },
  form: { display: 'flex', flexDirection: 'column', gap: 24 },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  field: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 11, fontWeight: 600, color: '#c5a059', letterSpacing: '1.5px' },
  input: { padding: '12px 16px', background: '#0b0c10', border: '1px solid #333', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'Plus Jakarta Sans' },
  select: { padding: '12px 16px', background: '#0b0c10', border: '1px solid #333', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'Plus Jakarta Sans', cursor: 'pointer' },
  summary: { background: '#0b0c10', padding: 24, border: '1px solid #222', display: 'flex', flexDirection: 'column', gap: 12 },
  summaryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, color: '#aaa' },
  divider: { width: '100%', height: 1, background: '#222', border: 'none', margin: '8px 0' },
  total: { fontSize: 20, color: '#c5a059', fontFamily: 'Montserrat', fontWeight: 600 },
  btn: { background: '#c5a059', color: '#0b0c10', border: 'none', padding: '16px', marginTop: 10, fontSize: 13, fontWeight: 700, letterSpacing: '2px', cursor: 'pointer', transition: '0.3s' },
  roomCard: { background: '#111217', border: '1px solid #222', alignSelf: 'start', display: 'flex', flexDirection: 'column' },
  imgBox: { height: 280, background: '#0b0c10', position: 'relative' },
  roomImg: { width: '100%', height: '100%', objectFit: 'cover' },
  placeholder: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c5a059', fontSize: 32, letterSpacing: '4px', fontFamily: 'Montserrat' },
  roomInfo: { padding: 32 },
  roomName: { margin: '0 0 8px', fontSize: 22, color: '#fff', fontFamily: 'Montserrat', fontWeight: 400 },
  roomType: { margin: '0 0 16px', color: '#c5a059', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase' },
  roomDesc: { margin: 0, color: '#888', fontSize: 14, lineHeight: 1.6 },
};

export default BookingPage;
