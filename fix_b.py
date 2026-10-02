import os

bpage = 'frontend/src/pages/BookingPage.tsx'
with open(bpage, 'r', encoding='utf-8') as f:
    bc = f.read()

if 'const [voucher, setVoucher]' not in bc:
    bc = bc.replace(
        "const [error, setError] = useState('');",
        "const [error, setError] = useState('');\n  const [voucher, setVoucher] = useState('');\n  const [discount, setDiscount] = useState(0);\n  const [name, setName] = useState(user?.fullName || '');\n  const [phone, setPhone] = useState('');\n  const [address, setAddress] = useState('');\n  const [paymentMethod, setPaymentMethod] = useState('momo_domestic');"
    )

    bc = bc.replace(
        "const handleConfirm = async () => {",
        "const handleApplyVoucher = () => {\n    if (voucher.toUpperCase() === 'KM100') {\n      setDiscount(100000);\n      alert('\u00c1p d\u1ee5ng m\u00e3 gi\u1ea3m gi\u00e1 100k th\u00e0nh c\u00f4ng!');\n    } else {\n      setDiscount(0);\n      alert('M\u00e3 kh\u00f4ng h\u1ee3p l\u1ec7');\n    }\n  };\n\n  const handleConfirm = async () => {"
    )

    bc = bc.replace(
        "totalPrice: room.pricePerNight * calculateDays(),",
        "totalPrice: (room.pricePerNight * calculateDays()) - discount,"
    )

    ui = """
          <div className="mb-6 space-y-4">
            <div><label className="block text-sm font-bold text-gray-700 mb-1">H\u1ecd t\u00ean:</label><input className="w-full border p-2 rounded" value={name} onChange={e=>setName(e.target.value)} /></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-1">S\u1ed1 \u0111i\u1ec7n tho\u1ea1i:</label><input className="w-full border p-2 rounded" value={phone} onChange={e=>setPhone(e.target.value)} /></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-1">\u0110\u1ecba ch\u1ec9:</label><input className="w-full border p-2 rounded" value={address} onChange={e=>setAddress(e.target.value)} /></div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">M\u00e3 khuy\u1ebfn m\u00e3i:</label>
              <div className="flex gap-2">
                <input className="flex-1 border p-2 rounded" placeholder="Nh\u1eadp KM100 \u0111\u1ec3 gi\u1ea3m 100k..." value={voucher} onChange={e=>setVoucher(e.target.value)} />
                <button onClick={handleApplyVoucher} className="px-4 py-2 bg-gray-800 text-white font-bold rounded hover:bg-gray-700">\u00c1p d\u1ee5ng</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Ph\u01b0\u01a1ng th\u1ee9c thanh to\u00e1n:</label>
              <select className="w-full border p-2 rounded font-medium" value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value)}>
                <option value="momo_domestic">MoMo (Th\u1ebb n\u1ed9i \u0111\u1ecba)</option>
                <option value="momo_international">MoMo (Th\u1ebb qu\u1ed1c t\u1ebf)</option>
              </select>
            </div>
          </div>
"""
    bc = bc.replace('<div className="flex justify-between items-center mb-6">', ui + '          <div className="flex justify-between items-center mb-6">')
    
    # Update total UI display
    bc = bc.replace("{Number(room.pricePerNight * calculateDays()).toLocaleString('vi-VN')} \u0111", "{Number(room.pricePerNight * calculateDays() - discount).toLocaleString('vi-VN')} \u0111")
    
    with open(bpage, 'w', encoding='utf-8') as f:
        f.write(bc)


mpage = 'frontend/src/pages/MyBookingsPage.tsx'
with open(mpage, 'r', encoding='utf-8') as f:
    mc = f.read()

if 'setShowQR' not in mc:
    mc = mc.replace("const [bookings, setBookings] = useState<Booking[]>([]);", "const [bookings, setBookings] = useState<Booking[]>([]);\n  const [showQR, setShowQR] = useState<number | null>(null);")
    
    qr_modal = """
      {showQR !== null && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center relative shadow-2xl">
            <button onClick={() => setShowQR(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="text-2xl font-serif font-bold text-brand-dark mb-1">Th\u1ebb Ph\u00f2ng Online</h2>
            <p className="text-gray-500 text-sm mb-6">Booking #{showQR}</p>
            <div className="border-4 border-brand-DEFAULT p-4 rounded-xl inline-block mb-6 shadow-sm bg-gray-50">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=BOOKING_${showQR}`} alt="QR Code" className="w-48 h-48" />
            </div>
            <p className="font-bold text-gray-800">Qu\u00e9t m\u00e3 n\u00e0y t\u1ea1i qu\u1ea7y l\u1ec5 t\u00e2n \u0111\u1ec3 nh\u1eadn ph\u00f2ng nhanh ch\u00f3ng!</p>
          </div>
        </div>
      )}
"""
    mc = mc.replace('return (\n    <div', 'return (\n    <>\n' + qr_modal + '    <div')
    mc = mc.replace('</div>\n  );\n};', '</div>\n    </>\n  );\n};')

    btn = """
                    {booking.status === 'CONFIRMED' && (
                      <button 
                        onClick={() => setShowQR(booking.id)}
                        className="text-sm font-bold text-brand-dark hover:text-brand-DEFAULT hover:underline px-2 py-1 mr-4"
                      >
                        Xem th\u1ebb ph\u00f2ng
                      </button>
                    )}
"""
    mc = mc.replace('{(booking.status === \'PENDING\' || booking.status === \'CONFIRMED\') && (', btn + '\n                    {(booking.status === \'PENDING\' || booking.status === \'CONFIRMED\') && (')

    with open(mpage, 'w', encoding='utf-8') as f:
        f.write(mc)


rpage = 'frontend/src/pages/RoomDetailPage.tsx'
with open(rpage, 'r', encoding='utf-8') as f:
    rc = f.read()

if 'Hỏi CSKH' not in rc:
    cskh_btn = """
                <button 
                  onClick={() => {
                    const event = new CustomEvent('openChat', { detail: `T\u00f4i mu\u1ed1n h\u1ecfi v\u1ec1 ${room.name} (ID: ${room.id})` });
                    window.dispatchEvent(event);
                  }}
                  className="w-full mt-3 py-4 font-bold rounded text-brand-dark border-2 border-brand-dark hover:bg-gray-50 transition-colors"
                >
                  H\u1ecfi CSKH
                </button>
"""
    rc = rc.replace('</button>\n              </div>', '</button>\n' + cskh_btn + '              </div>')
    
    with open(rpage, 'w', encoding='utf-8') as f:
        f.write(rc)


cpage = 'frontend/src/components/ChatWidget.tsx'
with open(cpage, 'r', encoding='utf-8') as f:
    cc = f.read()

if 'window.addEventListener' not in cc:
    cc = cc.replace('useEffect(() => {', 'useEffect(() => {\n    const handleOpenChat = (e: any) => {\n      setIsOpen(true);\n      if (e.detail) setInput(e.detail);\n    };\n    window.addEventListener(\'openChat\', handleOpenChat);\n')
    cc = cc.replace('return () => {', 'return () => {\n      window.removeEventListener(\'openChat\', handleOpenChat);\n')
    with open(cpage, 'w', encoding='utf-8') as f:
        f.write(cc)
