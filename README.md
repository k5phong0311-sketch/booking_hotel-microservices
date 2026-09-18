# 🏨 Xây dựng hệ thống đặt phòng khách sạn BookingHotel theo kiến trúc Microservices

Hệ thống đặt phòng khách sạn được xây dựng theo kiến trúc **Microservices**, sử dụng **NestJS (TypeScript)** cho Backend và **React (TypeScript)** cho Frontend.

> Dự án được phát triển bởi nhóm 5 thành viên, phục vụ mục đích lab và học tập thực chiến về kiến trúc Microservices.

---

## 📋 Mục lục

1. [Tech Stack](#-tech-stack)
2. [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
3. [Danh sách Microservices](#-danh-sách-microservices)
4. [Luồng nghiệp vụ chính](#-luồng-nghiệp-vụ-chính)
5. [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
6. [Cài đặt & Chạy dự án](#-cài-đặt--chạy-dự-án)
7. [Biến môi trường](#-biến-môi-trường)
8. [Git Workflow (Quy trình làm việc nhóm)](#-git-workflow)
9. [API Reference](#-api-reference)
10. [Quyết định thiết kế](#-quyết-định-thiết-kế)

---

## 🛠 Tech Stack

| Layer | Công nghệ | Lý do lựa chọn |
|:---|:---|:---|
| **Ngôn ngữ chủ đạo** | TypeScript | Dùng thống nhất cho cả Frontend & Backend |
| **Frontend** | React + TypeScript (React thuần) | Phổ biến, tài liệu đồ sộ, tách biệt rõ ràng với backend |
| **Backend** | NestJS + TypeScript | Framework chuẩn hóa theo module, quản lý code chặt chẽ |
| **Database** | MySQL 8.0 | Quen thuộc, quan hệ rõ ràng, hỗ trợ tốt với TypeORM |
| **ORM** | TypeORM | Tích hợp sẵn với NestJS, hỗ trợ MySQL |
| **Auth** | JWT (JSON Web Token) | Stateless, phù hợp Microservices |
| **Giao tiếp services** | REST API (HTTP) | Đơn giản, dễ debug, phù hợp MVP |
| **Containerization** | Docker + Docker Compose | Đảm bảo môi trường nhất quán giữa các thành viên |
| **Version Control** | Git + GitHub | Quản lý code, làm việc nhóm qua Pull Request |

---

## 🏗 Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                       │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP Request
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   API GATEWAY (Port: 3000)                  │
│        - Điều hướng request đến đúng service               │
│        - Xác thực JWT Token                                 │
│        - Tích hợp Review Service                            │
└───┬───────────┬───────────┬───────────┬─────────────────────┘
    │           │           │           │
    ▼           ▼           ▼           ▼
┌───────┐ ┌─────────┐ ┌─────────┐ ┌───────────┐
│ User  │ │  Room   │ │Booking  │ │ Payment & │
│  &    │ │Catalog  │ │Service  │ │Notification│
│ Auth  │ │Service  │ │         │ │ Service   │
│:3001  │ │ :3002   │ │ :3003   │ │  :3004    │
└───┬───┘ └────┬────┘ └────┬────┘ └─────┬─────┘
    │          │           │            │
    ▼          ▼           ▼            ▼
┌───────┐ ┌─────────┐ ┌─────────┐ ┌───────────┐
│user_db│ │ room_db │ │booking_ │ │payment_db │
│(MySQL)│ │ (MySQL) │ │  db     │ │  (MySQL)  │
└───────┘ └─────────┘ │(MySQL)  │ └───────────┘
                      └─────────┘
```

> **Nguyên tắc thiết kế:** Mỗi microservice sở hữu một database riêng biệt (Database-per-service pattern), đảm bảo tính độc lập và tách rời hoàn toàn.

---

## 📦 Danh sách Microservices

### 1. 🔀 API Gateway + Review Service — `Port: 3000`
**Người phụ trách:** _(Truong Van Phong)_

- Nhận toàn bộ request từ Client React
- Xác thực JWT Token (gọi User Service hoặc tự verify)
- Điều hướng (proxy) request đến đúng service phía sau
- Quản lý đánh giá/nhận xét phòng (Review CRUD)
- **Database:** `gateway_db`

---

### 2. 👤 User & Auth Service — `Port: 3001`
**Người phụ trách:** _(Tran Duc Hai)_

- Đăng ký tài khoản mới (`POST /auth/register`)
- Đăng nhập và cấp phát JWT Access Token (`POST /auth/login`)
- Xem & cập nhật thông tin cá nhân (`GET/PATCH /users/:id`)
- **Database:** `user_db`

---

### 3. 🏠 Room Catalog Service — `Port: 3002`
**Người phụ trách:** _(Nguyen Thanh Hung)_

- Quản lý danh mục phòng (thêm/sửa/xóa phòng)
- Xem danh sách phòng theo loại, giá, tầng
- Kiểm tra tình trạng phòng còn trống trong khoảng thời gian nhất định
- Upload ảnh phòng
- **Database:** `room_db`

---

### 4. 📅 Booking Service — `Port: 3003`
**Người phụ trách:** _(Bui Dai Duong)_

- Tạo đơn đặt phòng mới (gọi Room Service để kiểm tra phòng trống)
- Quản lý vòng đời đơn đặt phòng: `PENDING` → `CONFIRMED` / `FAILED` / `CANCELED`
- Xem lịch sử đặt phòng của người dùng
- Hủy đặt phòng
- **Database:** `booking_db`

---

### 5. 💳 Payment & Notification Service — `Port: 3004`
**Người phụ trách:** _(Dau Ngoc Anh)_

- Xử lý thanh toán (giả lập hoặc tích hợp cổng thanh toán)
- Gọi ngược lại Booking Service để cập nhật trạng thái sau khi thanh toán
- Gửi email thông báo xác nhận đặt phòng thành công/thất bại
- **Database:** `payment_db`

---

## 🔄 Luồng nghiệp vụ chính

### Luồng Đặt phòng (Booking Flow)

```
Client
  │
  │ POST /api/bookings
  ▼
API Gateway
  │ 1. Verify JWT Token (gọi User Service)
  │ 2. Forward request
  ▼
Booking Service
  │ 3. Gọi Room Service: GET /rooms/:id/availability
  ▼
Room Catalog Service
  │ 4. Kiểm tra phòng → Trả về kết quả
  ▼
Booking Service
  │ 5. Tạo Booking (Status: PENDING)
  │ 6. Gọi Payment Service: POST /payments
  ▼
Payment & Notification Service
  │ 7. Xử lý thanh toán
  │ 8. Gọi Booking Service: PATCH /bookings/:id (Status: CONFIRMED)
  │ 9. Gửi email xác nhận cho User
  ▼
Client nhận phản hồi thành công
```

### Luồng Đăng nhập (Auth Flow)

```
Client
  │ POST /api/auth/login
  ▼
API Gateway → User & Auth Service
  │ Xác thực username/password
  │ Trả về JWT Access Token
  ▼
Client lưu Token → Gắn vào Header các request tiếp theo
  Authorization: Bearer <token>
```

---

## 📁 Cấu trúc thư mục

```
booking_hotel-microservices/
│
├── api-gateway/               # API Gateway + Review Service
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   ├── review/
│   │   │   ├── review.controller.ts
│   │   │   ├── review.service.ts
│   │   │   └── review.module.ts
│   │   └── proxy/             # Điều hướng request
│   ├── .env.example
│   └── package.json
│
├── user-service/              # User & Auth Service
│   ├── src/
│   │   ├── auth/
│   │   └── users/
│   ├── .env.example
│   └── package.json
│
├── room-service/              # Room Catalog Service
│   ├── src/
│   │   └── rooms/
│   ├── .env.example
│   └── package.json
│
├── booking-service/           # Booking Service
│   ├── src/
│   │   └── bookings/
│   ├── .env.example
│   └── package.json
│
├── payment-service/           # Payment & Notification Service
│   ├── src/
│   │   ├── payments/
│   │   └── notifications/
│   ├── .env.example
│   └── package.json
│
├── frontend/                  # React + TypeScript Client
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── services/          # API calls
│   └── package.json
│
├── docker-compose.yml         # Khởi tạo MySQL
├── init.sql                   # Script tạo các database
└── README.md
```

---

## 🚀 Cài đặt & Chạy dự án

### Yêu cầu
- [Node.js](https://nodejs.org/) >= 18
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)

### Bước 1: Clone dự án về máy
```bash
git clone https://github.com/k5phong0311-sketch/booking_hotel-microservices.git
cd booking_hotel-microservices
```

### Bước 2: Khởi động Database bằng Docker
```bash
# Chạy lệnh này 1 lần duy nhất (hoặc khi restart máy)
docker-compose up -d

# Kiểm tra MySQL đã chạy chưa
docker ps
```
> ✅ Lệnh này sẽ tự động tạo 5 database: `user_db`, `room_db`, `booking_db`, `payment_db`, `gateway_db`.

### Bước 3: Cấu hình biến môi trường
Vào thư mục service bạn phụ trách, copy file `.env.example` thành `.env` và điền thông tin phù hợp.
```bash
# Ví dụ cho user-service
cd user-service
cp .env.example .env
```

### Bước 4: Cài dependencies & Chạy service
```bash
# Cài thư viện
npm install

# Chạy ở chế độ development (tự reload khi sửa code)
npm run start:dev
```

---

## ⚙️ Biến môi trường

Mỗi service cần một file `.env` với nội dung mẫu như sau:

```env
# Server
PORT=3001

# Database (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=hotel_user
DB_PASSWORD=hotel_password
DB_NAME=user_db

# JWT (chỉ dùng cho User & Auth Service và API Gateway)
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
```

> ⚠️ **Lưu ý:** Không commit file `.env` lên GitHub. File này đã được thêm vào `.gitignore`.

---

## 🌿 Git Workflow

Nhóm sử dụng mô hình **Feature Branch Workflow**.

### Quy tắc đặt tên branch
```
feat/<tên-service>
# Ví dụ:
feat/user-auth
feat/room-catalog
feat/booking-service
feat/payment-notification
feat/api-gateway
```

### Quy trình làm việc hàng ngày
```bash
# 1. Cập nhật code mới nhất từ main về máy
git checkout main
git pull origin main

# 2. Tạo branch mới cho phần việc của mình
git checkout -b feat/tên-service

# 3. Code, code, code...

# 4. Lưu thay đổi và đẩy lên GitHub
git add .
git commit -m "feat: mô tả ngắn gọn bạn đã làm gì"
git push origin feat/tên-service

# 5. Vào GitHub → Tạo Pull Request → Nhờ thành viên khác review → Merge vào main
```

### Quy tắc viết commit message
| Tiền tố | Ý nghĩa | Ví dụ |
|:---|:---|:---|
| `feat:` | Thêm tính năng mới | `feat: add login endpoint` |
| `fix:` | Sửa lỗi | `fix: handle null token error` |
| `docs:` | Cập nhật tài liệu | `docs: update readme` |
| `refactor:` | Cải thiện code, không thêm tính năng | `refactor: clean up booking logic` |
| `chore:` | Cấu hình, setup | `chore: add docker compose` |

---

## 📡 API Reference

Tất cả request đều đi qua `API Gateway` tại `http://localhost:3000`.

> **Header xác thực** (bắt buộc với các route cần đăng nhập):
> ```
> Authorization: Bearer <your_jwt_token>
> ```

### Auth
| Method | Endpoint | Mô tả | Auth |
|:---|:---|:---|:---|
| POST | `/api/auth/register` | Đăng ký tài khoản | ❌ |
| POST | `/api/auth/login` | Đăng nhập, nhận JWT | ❌ |
| GET | `/api/users/me` | Xem thông tin cá nhân | ✅ |

### Rooms
| Method | Endpoint | Mô tả | Auth |
|:---|:---|:---|:---|
| GET | `/api/rooms` | Danh sách phòng | ❌ |
| GET | `/api/rooms/:id` | Chi tiết 1 phòng | ❌ |
| POST | `/api/rooms` | Thêm phòng mới (Admin) | ✅ |
| PATCH | `/api/rooms/:id` | Cập nhật phòng (Admin) | ✅ |
| DELETE | `/api/rooms/:id` | Xóa phòng (Admin) | ✅ |

### Bookings
| Method | Endpoint | Mô tả | Auth |
|:---|:---|:---|:---|
| POST | `/api/bookings` | Tạo đơn đặt phòng | ✅ |
| GET | `/api/bookings/my` | Lịch sử đặt phòng của tôi | ✅ |
| GET | `/api/bookings/:id` | Chi tiết đơn đặt phòng | ✅ |
| PATCH | `/api/bookings/:id/cancel` | Hủy đơn | ✅ |

### Payments
| Method | Endpoint | Mô tả | Auth |
|:---|:---|:---|:---|
| POST | `/api/payments` | Khởi tạo thanh toán | ✅ |
| GET | `/api/payments/:bookingId` | Xem trạng thái thanh toán | ✅ |

### Reviews
| Method | Endpoint | Mô tả | Auth |
|:---|:---|:---|:---|
| POST | `/api/reviews` | Viết đánh giá | ✅ |
| GET | `/api/reviews/room/:roomId` | Đánh giá của 1 phòng | ❌ |

---

## 📐 Quyết định thiết kế

| # | Quyết định | Lựa chọn | Lý do |
|:---|:---|:---|:---|
| 1 | Giao tiếp giữa services | **REST API đồng bộ** | Dễ hiểu, dễ debug cho nhóm mới học Microservices. Message Broker (Kafka/RabbitMQ) bị loại vì chưa được học. |
| 2 | Database | **MySQL (Database-per-service)** | Quen thuộc, dễ dùng với TypeORM. Mỗi service có DB riêng để đảm bảo tính độc lập. |
| 3 | Authentication | **JWT Stateless** | Không cần lưu session trên server, phù hợp hoàn toàn với kiến trúc microservices. |
| 4 | Backend Framework | **NestJS** | Chuẩn hóa theo module, tích hợp sẵn Dependency Injection, TypeORM, HTTP Module. |
| 5 | Frontend Framework | **React thuần (không Next.js)** | Tách biệt rõ ràng Frontend/Backend, tránh kiến trúc phức tạp không cần thiết. |
| 6 | Xử lý lỗi (MVP) | **Compensating Transaction đơn giản** | Nếu Payment lỗi, Booking tự chuyển sang FAILED. Không dùng Saga pattern để tránh over-engineering. |

---

## 👥 Thành viên nhóm

| Thành viên | Service phụ trách | Branch |
|:---|:---|:---|
| Truong Van Phong | API Gateway & Review Service | `feat/api-gateway` |
| Tran Duc Hai | User & Auth Service | `feat/user-auth` |
| Nguyen Thanh Hung | Room Catalog Service | `feat/room-catalog` |
| Bui Dai Duong | Booking Service | `feat/booking-service` |
| Dau Ngoc Anh | Payment & Notification Service | `feat/payment-notification` |

---

<p align="center">Made with ❤️ by Group TheLiemVietNam </p>
