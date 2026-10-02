import os

filepath = 'frontend/src/pages/HomePage.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

translations = {
    '__ERROR_SERVER__': 'L\u1ed7i k\u1ebft n\u1ed1i \u0111\u1ebfn m\u00e1y ch\u1ee7.',
    '__ALL__': 'T\u1ea5t C\u1ea3',
    '__SINGLE__': 'Ph\u00f2ng \u0110\u01a1n',
    '__DOUBLE__': 'Ph\u00f2ng \u0110\u00f4i',
    '__SUITE__': 'Suite Th\u01b0\u1ee3ng H\u1ea1ng',
    '__DELUXE__': 'Ph\u00f2ng Deluxe',
    '__HERO_SUBTITLE__': '\u0110\u1eb6T PH\u00d2NG KH\u00c1CH S\u1ea0N TR\u1ef0C TUY\u1ebeN',
    '__HERO_TITLE_1__': 'Tr\u1ea3i nghi\u1ec7m l\u01b0u tr\u00fa',
    '__HERO_TITLE_2__': 'ho\u00e0n h\u1ea3o',
    '__HERO_TITLE_3__': 'cho k\u1ef3 ngh\u1ec9 c\u1ee7a b\u1ea1n.',
    '__HERO_DESC__': 'H\u00e0ng ng\u00e0n l\u1ef1a ch\u1ecdn ph\u00f2ng ngh\u1ec9 ti\u1ec7n nghi, gi\u00e1 t\u1ed1t v\u00e0 d\u1ecbch v\u1ee5 ch\u0103m s\u00f3c kh\u00e1ch h\u00e0ng 24/7.',
    '__HERO_CTA__': 'Xem ph\u00f2ng tr\u1ed1ng ngay',
    '__ROOM_LIST_TITLE__': 'Danh S\u00e1ch Ph\u00f2ng Ngh\u1ec9',
    '__LOADING__': '\u0110ang t\u1ea3i danh s\u00e1ch ph\u00f2ng...',
    '__FOUND__': 'T\u00ecm th\u1ea5y',
    '__MATCHES__': 'kh\u00f4ng gian ph\u00f9 h\u1ee3p',
    '__NO_MATCHES__': 'Kh\u00f4ng c\u00f3 ph\u00f2ng n\u00e0o ph\u00f9 h\u1ee3p v\u1edbi l\u1ef1a ch\u1ecdn c\u1ee7a qu\u00fd kh\u00e1ch.'
}

for k, v in translations.items():
    content = content.replace(k, v)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
