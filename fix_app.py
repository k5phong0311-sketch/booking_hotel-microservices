import os

filepath = 'frontend/src/App.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add import
if "import AboutPage" not in content:
    content = content.replace("import HomePage from './pages/HomePage';", "import HomePage from './pages/HomePage';\nimport AboutPage from './pages/AboutPage';")

# Add route
if 'path="/about"' not in content:
    content = content.replace('<Route path="/" element={<HomePage />} />', '<Route path="/" element={<HomePage />} />\n          <Route path="/about" element={<AboutPage />} />')

# Find the 404 text using a generic regex or simple replace
import re
content = re.sub(r'<h2>.*?</h2>', '<h2>__404_TITLE__</h2>', content)
content = re.sub(r'<a href="/" style={{ color: \'#e94560\' }}>.*?</a>', '<a href="/" style={{ color: \'#e94560\' }}>__404_BACK__</a>', content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
