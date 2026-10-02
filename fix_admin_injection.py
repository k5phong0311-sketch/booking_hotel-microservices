import os
import re

filepath = 'frontend/src/pages/AdminDashboardPage.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# The injection in the users map looks like:
bad_code = """
                  <td className="px-6 py-4 flex space-x-2">
                    {b.status === 'PENDING' && (
                      <button onClick={() => handleConfirmBooking(b.id)} className="text-green-600 font-bold text-sm">X\u00e1c nh\u1eadn</button>
                    )}
                    {b.status !== 'CANCELED' && (
                      <button onClick={() => handleCancelBooking(b.id)} className="text-red-600 font-bold text-sm">H\u1ee7y</button>
                    )}
                  </td>"""

# we want to remove the SECOND occurrence of it, which is inside `users.map`
parts = content.split(bad_code)
if len(parts) == 3:
    # it matched twice
    content = parts[0] + bad_code + parts[1] + parts[2]
elif len(parts) > 3:
    content = parts[0] + bad_code + parts[1] + "".join(parts[2:])

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
