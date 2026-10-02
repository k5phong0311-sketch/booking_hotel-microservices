import os

filepath = 'frontend/src/pages/AdminDashboardPage.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("name: 'Truong Van Phong'", "fullName: 'Tr\u01b0\u1eddng V\u0103n Phong'")
content = content.replace("name: 'Nguyen Van Khach'", "fullName: 'Nguy\u1ec5n V\u0103n Kh\u00e1ch'")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
