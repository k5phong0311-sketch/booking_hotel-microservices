import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const MomoAtmGatewayPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get('orderId') || '1';
  const orderCode = searchParams.get('orderCode') || `${orderId}_${Date.now()}`;
  const amount = Number(searchParams.get('amount') || 500000);
  const orderInfo = searchParams.get('orderInfo') || `Thanh toan don hang #${orderId}`;

  const [cardNumber, setCardNumber] = useState('');
  const [cardIssueDate, setCardIssueDate] = useState('');
  const [cardFullName, setCardFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'CARD' | 'OTP'>('CARD');
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 19);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatIssueDate = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return digits;
  };

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const seconds = String(timeLeft % 60).padStart(2, '0');

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const rawCard = cardNumber.replace(/\s+/g, '');
    if (!rawCard.startsWith('9704') || rawCard.length < 16) {
      setErrorMsg('Số thẻ ATM nội địa (Napas) phải bắt đầu bằng 9704 và có từ 16-19 chữ số.');
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(cardIssueDate.trim())) {
      setErrorMsg('Ngày phát hành không hợp lệ (Định dạng MM/YY, ví dụ: 03/07 hoặc 07/15).');
      return;
    }
    if (!cardFullName.trim()) {
      setErrorMsg('Vui lòng nhập tên chủ thẻ (ví dụ: NGUYEN VAN A).');
      return;
    }

    // Check specific MoMo Sandbox error test cards if user intentionally tests failure scenarios
    if (rawCard === '9704000000000026') {
      setErrorMsg('Thẻ bị khóa (Card Locked). Vui lòng dùng thẻ 9704000000000018 hoặc 9704198526191432198.');
      return;
    }
    if (rawCard === '9704000000000034') {
      setErrorMsg('Nguồn tiền không đủ (Insufficient Funds).');
      return;
    }
    if (rawCard === '9704000000000042') {
      setErrorMsg('Vượt hạn mức thẻ (Exceeded Limit).');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('OTP');
    }, 600);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setErrorMsg('Vui lòng nhập mã xác thực OTP (nhập OTP hoặc 123456).');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      navigate(
        `/payment/callback?partnerCode=MOMOBKUN20180529&orderId=${orderCode}&extraData=${orderId}&amount=${amount}&transId=${Date.now()}&resultCode=0&message=Giao+dich+thanh+cong`
      );
    }, 700);
  };

  const handleCancel = () => {
    if (window.confirm('Bạn chắc chắn muốn hủy giao dịch thanh toán với Booking Hotel Microservices?')) {
      navigate(
        `/payment/callback?partnerCode=MOMOBKUN20180529&orderId=${orderCode}&extraData=${orderId}&amount=${amount}&resultCode=1006&message=Giao+dich+bi+huy+boi+nguoi+dung`
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5] font-sans text-[#303233]">
      {/* MoMo Official Header */}
      <header className="bg-[#a50064] text-white py-3 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center font-extrabold text-xl tracking-tighter">
            momo
          </div>
          <span className="text-lg font-medium">Cổng thanh toán MoMo</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        <div className="bg-[#fff0f6] border border-[#ffadd2] text-[#a50064] px-4 py-2.5 rounded-lg mb-6 text-sm flex items-center gap-2">
          <span>ℹ️</span>
          <span>Điền thông tin thẻ ATM nội địa (Napas) để thanh toán. Lưu ý: Không tắt trình duyệt này khi chưa hoàn tất.</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Order Summary */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-base font-bold text-gray-800 pb-3 border-b border-gray-100">
                Thông tin đơn hàng
              </h2>

              <div className="py-3 border-b border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Nhà cung cấp</p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-[#a50064] text-white flex items-center justify-center font-bold text-xs">
                    BH
                  </div>
                  <span className="font-semibold text-sm text-gray-900">Booking Hotel Microservices</span>
                </div>
              </div>

              <div className="py-3 border-b border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Mã đơn hàng</p>
                <p className="font-semibold text-sm text-gray-800 break-all">{orderCode}</p>
              </div>

              <div className="py-3 border-b border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Mô tả</p>
                <p className="font-medium text-sm text-gray-800">{orderInfo}</p>
              </div>

              <div className="pt-3">
                <p className="text-xs text-gray-500 mb-1">Số tiền</p>
                <p className="text-2xl font-bold text-[#a50064]">
                  {amount.toLocaleString('vi-VN')}đ
                </p>
              </div>
            </div>

            {/* Countdown Box */}
            <div className="bg-[#fff0f6] rounded-xl p-4 text-center border border-[#ffadd2]">
              <p className="text-xs text-gray-600 mb-2">Đơn hàng sẽ hết hạn sau:</p>
              <div className="flex justify-center gap-3">
                <div className="bg-white px-3 py-1.5 rounded-lg shadow-sm border border-pink-200">
                  <span className="text-lg font-bold text-[#a50064]">{minutes}</span>
                  <p className="text-[10px] text-gray-500">Phút</p>
                </div>
                <div className="bg-white px-3 py-1.5 rounded-lg shadow-sm border border-pink-200">
                  <span className="text-lg font-bold text-[#a50064]">{seconds}</span>
                  <p className="text-[10px] text-gray-500">Giây</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleCancel}
                className="text-sm font-semibold text-[#a50064] hover:underline"
              >
                ← Quay về
              </button>
            </div>
          </div>

          {/* Right Column: Napas ATM Form */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-center gap-2 pb-4 border-b border-gray-100 mb-6">
                <img
                  src="https://test-payment.momo.vn/v2/gateway/images/credit/atm.svg"
                  alt="ATM Napas"
                  className="w-8 h-8"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <h2 className="text-base font-bold text-gray-800">
                  {step === 'CARD' ? 'Nhập thông tin thẻ ATM nội địa (Napas) để thanh toán' : 'Xác thực giao dịch thẻ nội địa Napas (OTP)'}
                </h2>
              </div>

              {/* Visual Napas Card Preview */}
              <div className="max-w-sm mx-auto mb-6 rounded-xl p-5 text-white shadow-md bg-gradient-to-r from-[#2c3e50] via-[#34495e] to-[#1a252f] relative overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <div className="w-10 h-7 bg-yellow-400/80 rounded-md border border-yellow-200" />
                  <span className="text-xs font-bold tracking-widest uppercase bg-white/20 px-2 py-0.5 rounded">
                    NAPAS ATM
                  </span>
                </div>
                <div className="text-lg font-mono tracking-widest mb-4">
                  {cardNumber || '•••• •••• •••• ••••'}
                </div>
                <div className="flex justify-between items-end text-xs">
                  <div>
                    <div className="text-[9px] text-gray-300 uppercase">Tên chủ thẻ</div>
                    <div className="font-semibold uppercase tracking-wider">
                      {cardFullName || 'TÊN CHỦ THẺ'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] text-gray-300 uppercase">Ngày cấp</div>
                    <div className="font-semibold">{cardIssueDate || 'MM/YY'}</div>
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
                  {errorMsg}
                </div>
              )}

              {step === 'CARD' ? (
                <form onSubmit={handleCardSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    <div className="sm:col-span-7">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Số thẻ ATM (Napas) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nhập số thẻ (VD: 9704000000000018)"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#a50064] focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-5">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Ngày phát hành (MM/YY) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="MM/YY (VD: 03/07)"
                        value={cardIssueDate}
                        onChange={(e) => setCardIssueDate(formatIssueDate(e.target.value))}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#a50064] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    <div className="sm:col-span-7">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Tên chủ thẻ *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nhập tên chủ thẻ (VD: NGUYEN VAN A)"
                        value={cardFullName}
                        onChange={(e) => setCardFullName(e.target.value.toUpperCase())}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#a50064] focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-5">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="Nhập số điện thoại"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#a50064] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Quick Fill Test Card Helper */}
                  <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-3 text-xs text-gray-600 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-[#a50064]">Thẻ Test Napas chuẩn:</span>{' '}
                      Số thẻ <code className="font-bold text-gray-900">9704000000000018</code> | Ngày cấp{' '}
                      <code className="font-bold text-gray-900">03/07</code> | Tên{' '}
                      <code className="font-bold text-gray-900">NGUYEN VAN A</code>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCardNumber('9704 0000 0000 0018');
                        setCardIssueDate('03/07');
                        setCardFullName('NGUYEN VAN A');
                        setPhoneNumber('0901234567');
                        setErrorMsg('');
                      }}
                      className="px-2.5 py-1 bg-[#a50064]/10 text-[#a50064] font-bold rounded hover:bg-[#a50064]/20 transition"
                    >
                      Điền nhanh thẻ Test
                    </button>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-64 py-3 bg-[#a50064] hover:bg-[#8c0054] text-white font-bold rounded-lg shadow transition disabled:opacity-50"
                    >
                      {loading ? 'Đang kiểm tra thẻ...' : '🔒 Thanh Toán'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleOtpSubmit} className="max-w-md mx-auto space-y-4 py-2">
                  <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-lg text-xs">
                    Thẻ Napas <strong>{cardNumber}</strong> hợp lệ. Vui lòng nhập mã OTP để hoàn tất giao dịch.
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Nhập mã xác thực OTP * (Mặc định: <span className="text-[#a50064] font-bold">OTP</span> hoặc <span className="text-[#a50064] font-bold">123456</span>)
                    </label>
                    <input
                      type="text"
                      required
                      autoFocus
                      placeholder="Nhập OTP hoặc 123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-center text-lg font-bold tracking-widest focus:border-[#a50064] focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep('CARD')}
                      className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition text-sm"
                    >
                      Quay lại
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2.5 bg-[#a50064] hover:bg-[#8c0054] text-white font-bold rounded-lg shadow transition text-sm disabled:opacity-50"
                    >
                      {loading ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                    </button>
                  </div>
                </form>
              )}

              {/* Supported Domestic Banks Footer */}
              <div className="mt-8 pt-5 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 mb-3">
                  Ngân hàng nội địa (Napas) chấp nhận thanh toán
                </p>
                <div className="flex flex-wrap gap-2 text-[11px] font-bold text-gray-600">
                  {['Vietcombank', 'VietinBank', 'BIDV', 'Agribank', 'MBBank', 'Techcombank', 'ACB', 'VPBank', 'TPBank', 'Sacombank', 'HDBank', 'NCB', 'SaigonBank'].map(bank => (
                    <span key={bank} className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded">
                      {bank}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MoMo Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 text-xs text-gray-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap justify-between items-center gap-2">
          <span>© Cổng thanh toán MoMo - Napas ATM Sandbox</span>
          <span>Hỗ trợ khách hàng: 1900 54 54 41 | hotro@momo.vn</span>
        </div>
      </footer>
    </div>
  );
};

export default MomoAtmGatewayPage;
