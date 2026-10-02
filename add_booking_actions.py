import os

filepath = 'frontend/src/pages/AdminDashboardPage.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add confirm and cancel booking functions
booking_functions = """
  const handleConfirmBooking = async (id: number) => {
    try {
      await bookingService.updateStatus(id, 'CONFIRMED');
      fetchData();
    } catch(err) {
      alert('\u0110\u00e3 x\u1ea3y ra l\u1ed7i');
    }
  };

  const handleCancelBooking = async (id: number) => {
    if(confirm('B\u1ea1n mu\u1ed1n h\u1ee7y \u0111\u01a1n n\u00e0y?')) {
      try {
        await bookingService.cancel(id);
        fetchData();
      } catch(err) {
        alert('\u0110\u00e3 x\u1ea3y ra l\u1ed7i');
      }
    }
  };
"""

content = content.replace("  const handleDeleteRoom", booking_functions + "\n  const handleDeleteRoom")

# Add Action column
content = content.replace(
    '<th className="px-6 py-4 font-bold text-gray-900">Tr\u1ea1ng th\u00e1i</th>',
    '<th className="px-6 py-4 font-bold text-gray-900">Tr\u1ea1ng th\u00e1i</th>\n                <th className="px-6 py-4 font-bold text-gray-900">H\u00e0nh \u0111\u1ed9ng</th>'
)

# Add Action buttons
action_buttons = """
                  <td className="px-6 py-4 flex space-x-2">
                    {b.status === 'PENDING' && (
                      <button onClick={() => handleConfirmBooking(b.id)} className="text-green-600 font-bold text-sm">X\u00e1c nh\u1eadn</button>
                    )}
                    {b.status !== 'CANCELED' && (
                      <button onClick={() => handleCancelBooking(b.id)} className="text-red-600 font-bold text-sm">H\u1ee7y</button>
                    )}
                  </td>
"""

content = content.replace(
    '</span>\n                  </td>\n                </tr>',
    '</span>\n                  </td>\n' + action_buttons + '                </tr>'
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
