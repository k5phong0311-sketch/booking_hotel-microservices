import os

replacements = {
    '__404_TITLE__': '404 - Trang kh\u00f4ng t\u00ecm th\u1ea5y',
    '__404_BACK__': '\u2190 V\u1ec1 trang ch\u1ee7',
    
    '__ABOUT_TITLE__': 'V\u1ec1 Ch\u00fang T\u00f4i',
    '__ABOUT_SUBTITLE__': 'H\u00e0nh tr\u00ecnh ki\u1ebfn t\u1ea1o nh\u1eefng tr\u1ea3i nghi\u1ec7m l\u01b0u tr\u00fa \u0111\u1eb3ng c\u1ea5p.',
    
    '__ABOUT_STORY_LABEL__': 'C\u00e2u chuy\u1ec7n h\u00ecnh th\u00e0nh',
    '__ABOUT_STORY_HEADING__': 'T\u1eeb m\u1ed9t t\u1ea7m nh\u00ecn v\u01b0\u1ee3t th\u1eddi gian...',
    '__ABOUT_STORY_P1__': 'BOOKINGHOTEL \u0111\u01b0\u1ee3c th\u00e0nh l\u1eadp v\u1edbi \u0111\u1ecbnh h\u01b0\u1edbng tr\u1edf th\u00e0nh bi\u1ec3u t\u01b0\u1ee3ng c\u1ee7a s\u1ef1 sang tr\u1ecdng, tinh t\u1ebf v\u00e0 ho\u00e0n m\u1ef9. Ch\u00fang t\u00f4i hi\u1ec3u r\u1eb1ng m\u1ed7i chuy\u1ebfn \u0111i kh\u00f4ng ch\u1ec9 l\u00e0 s\u1ef1 di chuy\u1ec3n m\u00e0 c\u00f2n l\u00e0 nh\u1eefng k\u1ef7 ni\u1ec7m \u0111\u00e1ng gi\u00e1 nh\u1ea5t.',
    '__ABOUT_STORY_P2__': 'Tr\u1ea3i qua h\u01a1n m\u1ed9t th\u1eadp k\u1ef7 ph\u00e1t tri\u1ec3n, t\u1eeb m\u1ed9t kh\u00e1ch s\u1ea1n khi\u00eam t\u1ed1n, ch\u00fang t\u00f4i \u0111\u00e3 kh\u00f4ng ng\u1eebng v\u01b0\u01a1n m\u00ecnh \u0111\u1ec3 mang l\u1ea1i m\u1ed9t h\u1ec7 sinh th\u00e1i ngh\u1ec9 d\u01b0\u1ee1ng \u0111\u1eb3ng c\u1ea5p v\u00e0 mang \u0111\u1eadm b\u1ea3n s\u1eafc Vi\u1ec7t.',
    
    '__ABOUT_VALUES_TITLE__': 'Gi\u00e1 tr\u1ecb c\u1ed1t l\u00f5i',
    '__ABOUT_V1_TITLE__': 'Ch\u1ea5t l\u01b0\u1ee3ng qu\u1ed1c t\u1ebf',
    '__ABOUT_V1_DESC__': 'M\u1ecdi chi ti\u1ebft trong kh\u00f4ng gian v\u00e0 d\u1ecbch v\u1ee5 \u0111\u1ec1u \u0111\u01b0\u1ee3c thi\u1ebft k\u1ebf theo ti\u00eau chu\u1ea9n ngh\u1ec9 d\u01b0\u1ee1ng kh\u1eaft khe nh\u1ea5t th\u1ebf gi\u1edbi.',
    '__ABOUT_V2_TITLE__': 'Kh\u00e1ch h\u00e0ng l\u00e0 trung t\u00e2m',
    '__ABOUT_V2_DESC__': 'S\u1ef1 h\u00e0i l\u00f2ng c\u1ee7a b\u1ea1n l\u00e0 th\u01b0\u1edbc \u0111o duy nh\u1ea5t cho th\u00e0nh c\u00f4ng c\u1ee7a ch\u00fang t\u00f4i. Ph\u1ee5c v\u1ee5 t\u1eadn t\u00e2m, \u0111\u00f3n ti\u1ebfp nhi\u1ec7t th\u00e0nh.',
    '__ABOUT_V3_TITLE__': 'Ph\u00e1t tri\u1ec3n b\u1ec1n v\u1eefng',
    '__ABOUT_V3_DESC__': 'T\u00f4n tr\u1ecdng m\u00f4i tr\u01b0\u1eddng v\u00e0 v\u0103n h\u00f3a \u0111\u1ecba ph\u01b0\u01a1ng, ch\u00fang t\u00f4i \u01b0u ti\u00ean c\u00e1c gi\u1ea3i ph\u00e1p sinh th\u00e1i xanh, ti\u1ebft ki\u1ec7m n\u0103ng l\u01b0\u1ee3ng.',
    
    '__ABOUT_MILESTONES_TITLE__': 'H\u00e0nh tr\u00ecnh ph\u00e1t tri\u1ec3n',
    '__M1_YEAR__': '2010',
    '__M1_TITLE__': 'Nh\u1eefng vi\u00ean g\u1ea1ch \u0111\u1ea7u ti\u00ean',
    '__M1_DESC__': 'Kh\u1edfi ngu\u1ed3n v\u1edbi \u00fd t\u01b0\u1edfng v\u1ec1 m\u1ed9t kh\u00e1ch s\u1ea1n Boutique t\u1ea1i trung t\u00e2m th\u00e0nh ph\u1ed1, mang l\u1ea1i c\u1ea3m gi\u00e1c \u1ea5m c\u00fang v\u00e0 ho\u00e0n ho\u1ea3o.',
    '__M2_YEAR__': '2015',
    '__M2_TITLE__': 'V\u01b0\u01a1n m\u00ecnh m\u1ea1nh m\u1ebd',
    '__M2_DESC__': 'Khai tr\u01b0\u01a1ng chu\u1ed7i ngh\u1ec9 d\u01b0\u1ee1ng 5 sao t\u1ea1i c\u00e1c v\u00f9ng bi\u1ec3n \u0111\u1eb9p nh\u1ea5t Vi\u1ec7t Nam, \u0111\u00e1nh d\u1ea5u b\u01b0\u1edbc chuy\u1ec3n m\u00ecnh qu\u1ed1c t\u1ebf h\u00f3a.',
    '__M3_YEAR__': '2026',
    '__M3_TITLE__': 'Ti\u00ean phong c\u00f4ng ngh\u1ec7 s\u1ed1',
    '__M3_DESC__': 'Ra m\u1eaft \u1ee9ng d\u1ee5ng BOOKINGHOTEL c\u00f9ng h\u1ec7 th\u1ed1ng \u0111\u1eb7t ph\u00f2ng vi m\u00f4 (\u0111\u1eb7t theo gi\u1edd) v\u00e0 Chatbot AI th\u00f4ng minh.',
}

def translate_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for k, v in replacements.items():
        content = content.replace(k, v)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

translate_file('frontend/src/pages/AboutPage.tsx')
translate_file('frontend/src/App.tsx')
