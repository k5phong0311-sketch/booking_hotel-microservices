# Hotel Booking System - Microservices Architecture

## 1. Giới thiệu (Understanding Summary)
*   **Mục đích (Why):** Xây dựng một dự án MVP phục vụ cho mục đích lab/học tập, mô phỏng lại các pattern thực tế của microservices.
*   **Đối tượng (Who):** Nhóm 5 thành viên phát triển hệ thống.
*   **Ràng buộc (Constraints):** Giữ độ phức tạp ở mức độ vừa phải để hiểu cốt lõi microservices, không áp dụng các công nghệ quá rườm rà.
*   **Tech Stack:** TypeScript (React cho Frontend, NestJS cho Backend), MySQL, Docker.

---

## 2. Nhật ký Quyết định (Decision Log)

| Quyết định | Lựa chọn | Lý do | Các lựa chọn khác đã cân nhắc |
| :--- | :--- | :--- | :--- |
| **Giao tiếp giữa các service** | **REST API (Đồng bộ)** | Dễ hiểu, dễ code, dễ debug cho người mới học. Hỗ trợ tốt trên NestJS bằng HTTP Module. | Message Broker (RabbitMQ/Kafka) - Bị loại vì setup phức tạp, over-engineering cho MVP. |
| **Cơ sở dữ liệu** | **MySQL (Database-per-service)** | Quen thuộc với nhóm. Đảm bảo tính độc lập của microservices. | PostgreSQL - Bị loại do nhóm không quen sử dụng. |
| **Kiểm soát truy cập** | **API Gateway + JWT** | Tập trung logic xác thực tại Gateway hoặc truyền token xuống dưới để tối ưu luồng request. | Session-based - Không phù hợp với Microservices. |

---

## 3. Danh sách Microservices & Phân công
Dự án được chia làm 5 service chính, mỗi người đảm nhận 1 phần:

1.  **API Gateway, Integration & Review Service:** Cổng giao tiếp chính, nhận request từ frontend, điều hướng xuống các service, xử lý xác thực (Auth middleware) và quản lý đánh giá (Review).
2.  **User & Auth Service:** Quản lý thông tin người dùng, đăng ký, đăng nhập, cấp phát JWT Token.
3.  **Room Catalog Service:** Quản lý danh mục phòng, loại phòng, giá cả và tồn kho (phòng trống/đã đặt).
4.  **Booking Service:** Lõi đặt phòng, xử lý logic tạo đơn, tính tiền, gọi sang Room để kiểm tra chỗ và gọi sang Payment để thanh toán.
5.  **Payment & Notification Service:** Xử lý thanh toán (giả lập hoặc tích hợp bên thứ 3) và gửi email/thông báo hệ thống khi đặt phòng thành công/thất bại.

---

## 4. Luồng dữ liệu (Data Flow) - Đặt phòng

1.  **Client (React)** gửi request đặt phòng tới `API Gateway`.
2.  **API Gateway** kiểm tra tính hợp lệ của Token qua `User Service` (hoặc tự verify nếu có public key).
3.  Gateway forward request xuống **Booking Service**.
4.  **Booking Service** gọi REST API sang **Room Catalog Service** kiểm tra số lượng phòng trống.
5.  Nếu còn phòng, **Booking Service** tạo bản ghi `Status: PENDING` và gọi tiếp **Payment Service**.
6.  **Payment Service** xử lý thanh toán, gọi ngược lại **Booking Service** update `Status: CONFIRMED` và trigger gửi thông báo.

---

## 5. Xử lý lỗi (Error Handling) & Data Consistency

*   **Timeout:** Các lệnh gọi HTTP giữa các service phải có `timeout` (ví dụ: 5000ms). Nếu quá hạn, trả về lỗi ngay lập tức.
*   **Global Exception Handling:** Mọi service sử dụng Exception Filter của NestJS. Format lỗi trả về phải chuẩn hóa (ví dụ: `statusCode`, `message`, `timestamp`).
*   **Compensating Transaction (Mức độ MVP):** Nếu Booking đã tạo (PENDING) nhưng Payment bị lỗi/timeout, Booking Service tự động chuyển đơn thành FAILED, không cần hệ thống queue phức tạp.

---

## 6. Môi trường phát triển (Development Setup)

*   Sử dụng **Docker Compose** để khởi tạo duy nhất 1 container MySQL.
*   Container MySQL này sẽ tự động chạy script tạo sẵn 5 database: `user_db`, `room_db`, `booking_db`, `payment_db`, `gateway_db`.
*   Mỗi thành viên dev ở máy local chỉ cần chạy Docker Compose để lấy DB, sau đó dùng `npm run start:dev` cho service mình phụ trách.
