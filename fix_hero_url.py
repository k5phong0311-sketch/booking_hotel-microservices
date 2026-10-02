import os

filepath = 'frontend/src/pages/HomePage.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the old URL with the new guaranteed working one
content = content.replace(
    'https://images.unsplash.com/photo-1542314831-c6a4d1424869',
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32'
)

# And let's make the overlay even lighter so the background is extremely visible
content = content.replace(
    'bg-white/60',
    'bg-white/40'
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
