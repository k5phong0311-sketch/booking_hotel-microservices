import os

filepath = 'frontend/src/pages/AdminDashboardPage.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("name: 'Tr\u01b0\u1eddng V\u0103n Phong'", "fullName: 'Tr\u01b0\u1eddng V\u0103n Phong'")
content = content.replace("name: 'Nguy\u1ec5n V\u0103n Kh\u00e1ch'", "fullName: 'Nguy\u1ec5n V\u0103n Kh\u00e1ch'")
content = content.replace("type: e.target.value})", "type: e.target.value as any})")
content = content.replace("b.checkInDate", "b.checkIn")
content = content.replace("b.checkOutDate", "b.checkOut")
content = content.replace("CANCELLED", "CANCELED")
content = content.replace("u.fullName || u.name", "u.fullName")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
