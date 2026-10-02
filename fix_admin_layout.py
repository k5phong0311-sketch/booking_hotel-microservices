import os

filepath = 'frontend/src/pages/AdminDashboardPage.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('<table className="w-full text-left">', '<div className="overflow-x-auto"><table className="w-full text-left whitespace-nowrap">')
content = content.replace('</table>', '</table></div>')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
