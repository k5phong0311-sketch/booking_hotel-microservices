import os

files_to_translate = {
    'frontend/src/pages/AdminDashboardPage.tsx': {
        'Admin Dashboard': 'Trang Qu\u1ea3n Tr\u1ecb',
        'Statistics': 'Th\u1ed1ng k\u00ea',
        'Room Management': 'Qu\u1ea3n l\u00fd Ph\u00f2ng',
        'User Management': 'Qu\u1ea3n l\u00fd User',
        'Customer Support': 'H\u1ed7 tr\u1ee3 Kh\u00e1ch h\u00e0ng',
        'Total Revenue': 'T\u1ed5ng doanh thu',
        'Expected Revenue': 'Doanh thu d\u1ef1 ki\u1ebfn',
        'Marketing Campaign': 'Chi\u1ebfn d\u1ecbch Marketing',
        'Voucher Code': 'M\u00e3 Voucher',
        'Discount (%)': 'Gi\u1ea3m (%)',
        'Quantity': 'S\u1ed1 l\u01b0\u1ee3ng',
        'ISSUE VOUCHER': 'PH\u00c1T H\u00c0NH VOUCHER',
        'Issuing Voucher...': '\u0110ang ph\u00e1t h\u00e0nh Voucher...',
        'Successfully issued': '\u0110\u00e3 ph\u00e1t h\u00e0nh th\u00e0nh c\u00f4ng',
        'vouchers': 'm\u00e3',
        'Image': 'H\u00ecnh \u1ea3nh',
        'Room Name': 'T\u00ean ph\u00f2ng',
        'Type': 'Lo\u1ea1i',
        'Price / Night': 'Gi\u00e1 / \u0110\u00eam',
        'Status': 'Tr\u1ea1ng th\u00e1i',
        'Empty': 'Tr\u1ed1ng',
        'Booked': '\u0110\u00e3 \u0111\u1eb7t',
        'User Name': 'T\u00ean ng\u01b0\u1eddi d\u00f9ng',
        'Role': 'Quy\u1ec1n (Role)',
        'Customer': 'Kh\u00e1ch h\u00e0ng',
        'All Messages': 'T\u1ea5t c\u1ea3 tin nh\u1eafn',
        'General Support Channel': 'C\u1ed5ng chat h\u1ed7 tr\u1ee3 chung',
        'Type a reply...': 'Nh\u1eadp c\u00e2u tr\u1ea3 l\u1eddi...',
        'Send': 'G\u1eedi',
    },
    'frontend/src/components/ChatWidget.tsx': {
        'Support agent just went offline. AI Assistant will continue to help you.': 'T\u01b0 v\u1ea5n vi\u00ean v\u1eeba offline. Tr\u1ee3 l\u00fd AI s\u1ebd ti\u1ebfp t\u1ee5c h\u1ed7 tr\u1ee3 b\u1ea1n.',
        'Hello! I am the AI receptionist of BOOKINGHOTEL. How can I help you today?': 'Xin ch\u00e0o! T\u00f4i l\u00e0 L\u1ec5 t\u00e2n \u1ea3o c\u1ee7a BOOKINGHOTEL. T\u00f4i c\u00f3 th\u1ec3 gi\u00fap g\u00ec cho b\u1ea1n h\u00f4m nay?',
        'Currently there are no Support Agents online!': 'Hi\u1ec7n t\u1ea1i kh\u00f4ng c\u00f3 nh\u00e2n vi\u00ean CSKH n\u00e0o online!',
        'Switched to Human Support mode. Please ask your question.': '\u0110\u00e3 chuy\u1ec3n sang ch\u1ebf \u0111\u1ed9 Chat v\u1edbi Nh\u00e2n vi\u00ean CSKH. Vui l\u00f2ng \u0111\u1eb7t c\u00e2u h\u1ecfi.',
        'Switched back to AI Assistant mode.': '\u0110\u00e3 quay l\u1ea1i ch\u1ebf \u0111\u1ed9 Chat v\u1edbi Tr\u1ee3 l\u00fd AI.',
        'Human Support': 'Nh\u00e2n vi\u00ean CSKH',
        'AI Assistant': 'Tr\u1ee3 l\u00fd AI',
        'Meet AI': 'G\u1eb7p AI',
        'Meet Human': 'G\u1eb7p L\u1ec5 t\u00e2n',
        'You': 'B\u1ea1n',
        'Support': 'CSKH',
        'Type a message...': 'Nh\u1eadp tin nh\u1eafn...',
        '>Send<': '>G\u1eedi<',
    },
    'frontend/src/components/BookingSlideOver.tsx': {
        'Booking Details': 'Chi Ti\u1ebft \u0110\u1eb7t Ph\u00f2ng',
        'Floor ': 'T\u1ea7ng ',
        'Check-out date must be after check-in date': 'Ng\u00e0y tr\u1ea3 ph\u00f2ng ph\u1ea3i sau ng\u00e0y nh\u1eadn ph\u00f2ng',
        'System error. Please try again.': 'L\u1ed7i h\u1ec7 th\u1ed1ng. Vui l\u00f2ng th\u1eed l\u1ea1i.',
        'You need to ': 'B\u1ea1n c\u1ea7n ',
        'log in': '\u0111\u0103ng nh\u1eadp',
        ' to make a booking.': ' \u0111\u1ec3 th\u1ef1c hi\u1ec7n \u0111\u1eb7t ph\u00f2ng.',
        'Check-in (14:00)': 'Ng\u00e0y Nh\u1eadn (14:00)',
        'Check-out (12:00)': 'Ng\u00e0y Tr\u1ea3 (12:00)',
        'Payment Method': 'H\u00ecnh th\u1ee9c thanh to\u00e1n',
        'PAY LATER - Pay at desk': '\u0110\u1eb6T TR\u01af\u1edaC - Thanh to\u00e1n t\u1ea1i qu\u1ea7y',
        'PAY NOW - Redirect to MoMo': 'THANH TO\u00c1N NGAY - Chuy\u1ec3n h\u01b0\u1edbng MoMo',
        'Stay duration:': 'Th\u1eddi gian l\u01b0u tr\u00fa:',
        ' nights': ' \u0111\u00eam',
        'Price per night:': 'Gi\u00e1 m\u1ed7i \u0111\u00eam:',
        'TOTAL:': 'T\u1ed4NG TI\u1ec0N:',
        'PROCESSING...': '\u0110ANG X\u1eec L\u00dd...',
        'CONFIRM & PAY': 'X\u00c1C NH\u1eacN & THANH TO\u00c1N',
    }
}

for filepath, replacements in files_to_translate.items():
    if not os.path.exists(filepath):
        print(f"Skipping {filepath} - not found")
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for eng, vie in replacements.items():
        content = content.replace(eng, vie)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Translated {filepath}")

print("Done translating all files!")
