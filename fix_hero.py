import os

filepath = 'frontend/src/pages/HomePage.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('opacity-40', 'opacity-100')
content = content.replace(
    '<div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-gray-50"></div>',
    '<div className="absolute inset-0 bg-white/60"></div>'
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
