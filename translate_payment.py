import os

filepath = 'frontend/src/pages/PaymentCallbackPage.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    '__CHECKING__': '\u231b \u0110ang ki\u1ec3m tra giao d\u1ecbch...',
    '__SUCCESS_TITLE__': '\u2714\ufe0f Thanh to\u00e1n th\u00e0nh c\u00f4ng!',
    '__SUCCESS_DESC__': '\u0110\u01a1n \u0111\u1eb7t ph\u00f2ng c\u1ee7a b\u1ea1n \u0111\u00e3 \u0111\u01b0\u1ee3c thanh to\u00e1n.',
    '__BTN_BOOKINGS__': 'Xem l\u1ecbch s\u1eed \u0111\u1eb7t ph\u00f2ng',
    '__FAILED_TITLE__': '\u274c Thanh to\u00e1n th\u1ea5t b\u1ea1i',
    '__FAILED_DESC__': 'Giao d\u1ecbch c\u1ee7a b\u1ea1n \u0111\u00e3 b\u1ecb h\u1ee7y ho\u1eb7c x\u1ea3y ra l\u1ed7i.',
    '__BTN_HOME__': 'Quay l\u1ea1i trang ch\u1ee7'
}

for k, v in replacements.items():
    content = content.replace(k, v)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
