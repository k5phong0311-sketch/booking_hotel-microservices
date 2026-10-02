import os

filepath = 'frontend/src/pages/HomePage.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'className="absolute inset-0 bg-[url(\'https://images.unsplash.com/photo-1542314831-c6a4d1424869?q=80&w=2000&auto=format&fit=crop\')] bg-cover bg-center bg-no-repeat opacity-40"',
    'className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40" style={{ backgroundImage: "url(\'https://images.unsplash.com/photo-1542314831-c6a4d1424869?q=80&w=2000&auto=format&fit=crop\')" }}'
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
