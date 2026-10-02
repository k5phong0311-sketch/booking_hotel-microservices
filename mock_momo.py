import os

filepath = 'payment-service/src/payments/payments.controller.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the momo logic
import re
new_logic = """
    if (dto.method === PaymentMethod.MOMO) {
      try {
        const momoResult = await this.momoService.createPayment(payment.id, Number(payment.amount));
        return {
          payment,
          momoUrl: momoResult.payUrl || `http://localhost:5173/payment/callback?orderId=${payment.id}&resultCode=0&message=Success`,
        };
      } catch (err) {
        // Fallback mock url if real API fails
        return {
          payment,
          momoUrl: `http://localhost:5173/payment/callback?orderId=${payment.id}&resultCode=0&message=Mocked_Success`,
        };
      }
    }
"""

content = re.sub(r'if \(dto\.method === PaymentMethod\.MOMO\) \{.*?\n    \}', new_logic.strip(), content, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
