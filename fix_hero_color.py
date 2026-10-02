import os

filepath = 'frontend/src/pages/HomePage.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the previous URL with a blue/white themed luxury resort image
content = content.replace(
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945'
)

# Adjust the overlay to have a slight cool blue tint to perfectly match the brand colors
content = content.replace(
    '<div className="absolute inset-0 bg-white/40"></div>',
    '<div className="absolute inset-0 bg-white/40"></div>\n        <div className="absolute inset-0 bg-blue-900/10 mix-blend-multiply"></div>'
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
