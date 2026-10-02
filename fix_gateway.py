import os
import re

filepath = 'api-gateway/src/chat/chat.gateway.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Just replace everything between message: '...' and timestamp
content = re.sub(
    r"message: 'D.*?sau\.',",
    "message: 'D\\u1ea1, hi\\u1ec7n t\\u1ea1i t\\u1ea5t c\\u1ea3 t\\u01b0 v\\u1ea5n vi\\u00ean \\u0111\\u1ec1u \\u0111ang b\\u1eadn. Qu\\u00fd kh\\u00e1ch vui l\\u00f2ng th\\u1eed l\\u1ea1i sau.',",
    content
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
