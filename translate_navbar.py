import os

filepath = 'frontend/src/components/Navbar.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    '__NAV_DISCOVER__': 'Kh\u00e1m ph\u00e1',
    '__NAV_ABOUT__': 'V\u1ec1 ch\u00fang t\u00f4i',
    '__NAV_BOOKINGS__': 'L\u1ecbch s\u1eed \u0111\u1eb7t ph\u00f2ng',
    '__NAV_LOGOUT__': '\u0110\u0103ng xu\u1ea5t',
    '__NAV_LOGIN__': '\u0110\u0103ng nh\u1eadp',
    '__NAV_REGISTER__': '\u0110\u0103ng k\u00fd',
}

for k, v in replacements.items():
    content = content.replace(k, v)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
