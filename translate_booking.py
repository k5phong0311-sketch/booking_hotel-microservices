import os

filepath = 'frontend/src/components/BookingSlideOver.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

translations = {
    '__ERROR_DATES__': 'Ng\u00e0y tr\u1ea3 ph\u00f2ng ph\u1ea3i sau ng\u00e0y nh\u1eadn ph\u00f2ng',
    '__ERROR_SYSTEM__': 'L\u1ed7i h\u1ec7 th\u1ed1ng. Vui l\u00f2ng th\u1eed l\u1ea1i.',
    '__TITLE__': 'Chi Ti\u1ebft \u0110\u1eb7t Ph\u00f2ng',
    '__FLOOR__': 'T\u1ea7ng',
    '__NEED_LOGIN__': 'B\u1ea1n c\u1ea7n',
    '__LOGIN_LINK__': '\u0111\u0103ng nh\u1eadp',
    '__TO_BOOK__': '\u0111\u1ec3 th\u1ef1c hi\u1ec7n \u0111\u1eb7t ph\u00f2ng.',
    '__CHECK_IN__': 'Ng\u00e0y Nh\u1eadn (14:00)',
    '__CHECK_OUT__': 'Ng\u00e0y Tr\u1ea3 (12:00)',
    '__PAYMENT_METHOD__': 'H\u00ecnh th\u1ee9c thanh to\u00e1n',
    '__PAY_LATER__': '\u0110\u1eb6T TR\u01af\u1edaC - Thanh to\u00e1n t\u1ea1i qu\u1ea7y',
    '__PAY_NOW__': 'THANH TO\u00c1N NGAY - Chuy\u1ec3n h\u01b0\u1edbng MoMo',
    '__DURATION__': 'Th\u1eddi gian l\u01b0u tr\u00fa:',
    '__NIGHTS__': '\u0111\u00eam',
    '__PRICE_PER_NIGHT__': 'Gi\u00e1 m\u1ed7i \u0111\u00eam:',
    '__TOTAL__': 'T\u1ed4NG TI\u1ec0N:',
    '__PROCESSING__': '\u0110ANG X\u1eec L\u00dd...',
    '__CONFIRM_PAY__': 'X\u00c1C NH\u1eacN & THANH TO\u00c1N'
}

for k, v in translations.items():
    content = content.replace(k, v)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
