# 💳 Payment & Notification Service

**Người phụ trách:** Đậu Ngọc Anh  
**Branch:** `feat/payment-notification`  
**Port:** `3004`  
**Database:** `payment_db` (MySQL)  

---

## 🚀 Danh sách API

### 1. Quản lý Thanh toán (Payments)
| Phương thức | Đường dẫn | Chức năng | Ghi chú |
|:---|:---|:---|:---|
| `POST` | `/api/payments` | Tạo thanh toán | Hỗ trợ MOMO, CARD, TRANSFER, CASH |
| `GET` | `/api/payments` | Lấy danh sách giao dịch | Có lọc theo `status`, `method` và phân trang |
| `GET` | `/api/payments/stats/summary` | Thống kê doanh thu | Tổng doanh thu, MoMo, hoàn tiền, số giao dịch |
| `GET` | `/api/payments/:id` | Chi tiết giao dịch | Xem thông tin một giao dịch |
| `GET` | `/api/payments/booking/:bookingId` | Tìm theo mã booking | Lấy thông tin thanh toán của đơn đặt |
| `GET` | `/api/payments/user/:userId` | Lịch sử thanh toán | Lấy tất cả giao dịch của khách hàng |
| `POST` | `/api/payments/:id/refund` | Hoàn tiền giao dịch | Hoàn tiền và cập nhật booking sang CANCELLED |
| `POST` | `/api/payments/:id/cancel` | Hủy thanh toán | Hủy giao dịch đang ở trạng thái PENDING |
| `POST` | `/api/payments/momo/ipn` | Webhook MoMo | Nhận kết quả thanh toán từ cổng MoMo |

---

### 2. Quản lý Thông báo (Notifications)
| Phương thức | Đường dẫn | Chức năng |
|:---|:---|:---|
| `POST` | `/api/notifications/send` | Gửi thông báo thủ công |
| `GET` | `/api/notifications/user/:userId` | Danh sách thông báo của người dùng |
| `GET` | `/api/notifications/user/:userId/unread-count` | Đếm số lượng thông báo chưa đọc |
| `GET` | `/api/notifications/booking/:bookingId` | Thông báo liên quan đến booking |
| `PATCH` | `/api/notifications/:id/read` | Đánh dấu thông báo đã đọc |
