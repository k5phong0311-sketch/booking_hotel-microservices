import os

filepath = 'frontend/src/pages/AdminDashboardPage.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    '__DASHBOARD_TITLE__': 'B\u1ea3ng \u0110i\u1ec1u Khi\u1ec3n Qu\u1ea3n Tr\u1ecb',
    '__DASHBOARD_SUBTITLE__': 'Qu\u1ea3n l\u00fd ph\u00f2ng, \u0111\u01a1n \u0111\u1eb7t, ng\u01b0\u1eddi d\u00f9ng v\u00e0 h\u1ed7 tr\u1ee3 kh\u00e1ch h\u00e0ng.',
    '__TAB_OVERVIEW__': 'T\u1ed5ng quan',
    '__TAB_ROOMS__': 'Ph\u00f2ng',
    '__TAB_BOOKINGS__': '\u0110\u01a1n \u0111\u1eb7t',
    '__TAB_USERS__': 'Ng\u01b0\u1eddi d\u00f9ng',
    '__TAB_CHAT__': 'H\u1ed7 tr\u1ee3 (Chat)',
    '__REVENUE__': 'Doanh thu 7 ng\u00e0y',
    '__MARKETING__': 'Chi\u1ebfn d\u1ecbch Marketing',
    '__VOUCHER_CODE__': 'M\u00e3 gi\u1ea3m gi\u00e1',
    '__DISCOUNT__': 'Gi\u1ea3m gi\u00e1 (%)',
    '__QTY__': 'S\u1ed1 l\u01b0\u1ee3ng',
    '__ISSUE_VOUCHER__': 'Ph\u00e1t h\u00e0nh',
    '__NEW_ROOM__': 'Th\u00eam Ph\u00f2ng',
    '__ROOM_NAME__': 'T\u00ean ph\u00f2ng',
    '__TYPE__': 'Lo\u1ea1i',
    '__PRICE__': 'Gi\u00e1/Ng\u00e0y',
    '__FLOOR__': 'T\u1ea7ng',
    '__IMAGE_URL__': 'Link \u1ea2nh',
    '__DESC__': 'M\u00f4 t\u1ea3',
    '__IS_AVAILABLE__': 'C\u00f2n tr\u1ed1ng',
    '__CANCEL__': 'H\u1ee7y',
    '__SAVE__': 'L\u01b0u ph\u00f2ng',
    '__EDIT__': 'S\u1eeda',
    '__DELETE__': 'X\u00f3a',
    '__BOOKER_ID__': 'ID Kh\u00e1ch',
    '__ROOM_ID__': 'ID Ph\u00f2ng',
    '__DATES__': 'Ng\u00e0y \u0111\u1eb7t',
    '__TOTAL_PRICE__': 'T\u1ed5ng ti\u1ec1n',
    '__STATUS__': 'Tr\u1ea1ng th\u00e1i',
    '__USERNAME__': 'T\u00ean ng\u01b0\u1eddi d\u00f9ng',
    '__ROLE__': 'Vai tr\u00f2',
    '__CUSTOMERS__': 'Kh\u00e1ch h\u00e0ng',
    '__ALL_MESSAGES__': 'T\u1ea5t c\u1ea3 tin nh\u1eafn',
    '__GENERAL_SUPPORT__': 'H\u1ed7 tr\u1ee3 chung',
    '__CUSTOMER__': 'Kh\u00e1ch',
    '__TYPE_MESSAGE__': 'Nh\u1eadp tin nh\u1eafn ph\u1ea3n h\u1ed3i...',
    '__SEND__': 'G\u1eedi',
}

for k, v in replacements.items():
    content = content.replace(k, v)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
