import os

filepath = 'frontend/src/pages/AdminDashboardPage.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("fullName: 'Tr\u01b0\u1eddng V\u0103n Phong'", "fullName: 'Tr\u01b0\u1eddng V\u0103n Phong', createdAt: new Date().toISOString()")
content = content.replace("fullName: 'Nguy\u1ec5n V\u0103n Kh\u00e1ch'", "fullName: 'Nguy\u1ec5n V\u0103n Kh\u00e1ch', createdAt: new Date().toISOString()")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
