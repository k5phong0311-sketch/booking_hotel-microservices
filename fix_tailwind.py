import os

filepath = 'frontend/tailwind.config.js'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("sans: ['Inter', 'sans-serif']", "sans: ['Playfair Display', 'serif']")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
