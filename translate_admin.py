import os
import sys

def translate():
    filepath = 'frontend/src/pages/AdminDashboardPage.tsx'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    translations = {
        '__DASHBOARD_TITLE__': 'B\u1ea3ng \u0110i\u1ec1u Khi\u1ec3n (Admin)',
        '__DASHBOARD_SUBTITLE__': 'Qu\u1ea3n l\u00fd t\u1ed5ng quan h\u1ec7 th\u1ed1ng kh\u00e1ch s\u1ea1n',
        '__TAB_OVERVIEW__': 'T\u1ed5ng quan',
        '__TAB_ROOMS__': 'Qu\u1ea3n l\u00fd Ph\u00f2ng',
        '__TAB_BOOKINGS__': 'L\u1ecbch s\u1eed \u0110\u1eb7t Ph\u00f2ng',
        '__TAB_USERS__': 'Qu\u1ea3n l\u00fd T\u00e0i Kho\u1ea3n',
        '__TAB_CHAT__': 'H\u1ed7 tr\u1ee3 Kh\u00e1ch H\u00e0ng',
        '__REVENUE__': 'Doanh thu d\u1ef1 ki\u1ebfn',
        '__MARKETING__': 'Chi\u1ebfn d\u1ecbch Marketing',
        '__VOUCHER_CODE__': 'M\u00e3 Voucher',
        '__DISCOUNT__': 'Gi\u1ea3m (%)',
        '__QTY__': 'S\u1ed1 l\u01b0\u1ee3ng',
        '__ISSUE_VOUCHER__': 'PH\u00c1T H\u00c0NH VOUCHER',
        '__ISSUED_VOUCHER__': '\u0110\u00e3 ph\u00e1t h\u00e0nh th\u00e0nh c\u00f4ng voucher',
        '__QUANTITY__': 'S\u1ed1 l\u01b0\u1ee3ng',
        '__ROOM_LIST__': 'Danh s\u00e1ch Ph\u00f2ng',
        '__ADD_ROOM__': 'Th\u00eam ph\u00f2ng m\u1edbi',
        '__IMAGE__': 'H\u00ecnh \u1ea3nh',
        '__ROOM_NAME__': 'T\u00ean ph\u00f2ng',
        '__TYPE__': 'Lo\u1ea1i',
        '__PRICE__': 'Gi\u00e1 / \u0110\u00eam',
        '__STATUS__': 'Tr\u1ea1ng th\u00e1i',
        '__ACTIONS__': 'H\u00e0nh \u0111\u1ed9ng',
        '__AVAILABLE__': 'Tr\u1ed1ng',
        '__BOOKED__': '\u0110\u00e3 \u0111\u1eb7t',
        '__EDIT__': 'S\u1eeda',
        '__DELETE__': 'X\u00f3a',
        '__UPDATE_ROOM__': 'C\u1eadp nh\u1eadt ph\u00f2ng',
        '__PRICE_PER_NIGHT__': 'Gi\u00e1 m\u1ed7i \u0111\u00eam (VND)',
        '__FLOOR__': 'T\u1ea7ng',
        '__IMAGE_URL__': 'URL H\u00ecnh \u1ea3nh',
        '__DESC__': 'M\u00f4 t\u1ea3',
        '__IS_AVAILABLE__': 'C\u00f3 s\u1eb5n (Cho ph\u00e9p \u0111\u1eb7t)',
        '__CANCEL__': 'H\u1ee7y',
        '__SAVE__': 'L\u01b0u l\u1ea1i',
        '__ERROR__': '\u0110\u00e3 x\u1ea3y ra l\u1ed7i',
        '__CONFIRM_DELETE__': 'B\u1ea1n ch\u1eafc ch\u1eafn mu\u1ed1n x\u00f3a ph\u00f2ng n\u00e0y?',
        '__BOOKER_ID__': 'Ng\u01b0\u1eddi \u0111\u1eb7t (UserID)',
        '__ROOM_ID__': 'Ph\u00f2ng (RoomID)',
        '__DATES__': 'Nh\u1eadn/Tr\u1ea3 ph\u00f2ng',
        '__TOTAL_PRICE__': 'T\u1ed5ng ti\u1ec1n',
        '__USERNAME__': 'T\u00ean ng\u01b0\u1eddi d\u00f9ng',
        '__ROLE__': 'Quy\u1ec1n (Role)',
        '__CUSTOMERS__': 'Kh\u00e1ch h\u00e0ng',
        '__ALL_MESSAGES__': 'T\u1ea5t c\u1ea3 tin nh\u1eafn',
        '__GENERAL_SUPPORT__': 'C\u1ed5ng chat h\u1ed7 tr\u1ee3 chung',
        '__CUSTOMER__': 'Kh\u00e1ch h\u00e0ng',
        '__TYPE_MESSAGE__': 'Nh\u1eadp tin nh\u1eafn tr\u1ea3 l\u1eddi...',
        '__SEND__': 'G\u1eedi'
    }

    for k, v in translations.items():
        content = content.replace(k, v)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    translate()
