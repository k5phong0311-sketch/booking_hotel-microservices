# BOOKINGHOTEL - H\u1ec7 Th\u1ed1ng \u0110\u1eb7t Ph\u00f2ng Kh\u00e1ch S\u1ea1n (Microservices)

![Banner](https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80)

\u0110\u00e2y l\u00e0 \u0111\u1ed3 \u00e1n h\u1ec7 th\u1ed1ng \u0111\u1eb7t ph\u00f2ng kh\u00e1ch s\u1ea1n **BOOKINGHOTEL** \u0111\u01b0\u1ee3c x\u00e2y d\u1ef1ng theo ki\u1ebfn tr\u00fac **Microservices** s\u1eed d\u1ee5ng NestJS v\u00e0 React. H\u1ec7 th\u1ed1ng h\u1ed7 tr\u1ee3 \u0111\u1eb7t ph\u00f2ng, thanh to\u00e1n online (MoMo), c\u1ea5p th\u1ebb ph\u00f2ng QR \u0111i\u1ec7n t\u1eed, v\u00e0 Chat CSKH Realtime v\u1edbi admin ho\u1eb7c AI t\u1ef1 \u0111\u1ed9ng.

## \u2728 T\u00ednh n\u0103ng n\u1ed5i b\u1eadt

1. **Giao di\u1ec7n Kh\u00e1ch h\u00e0ng (Frontend):**
   - T\u00ecm ki\u1ebfm v\u00e0 xem chi ti\u1ebft ph\u00f2ng tr\u1ef1c quan.
   - Lu\u1ed3ng \u0111\u1eb7t ph\u00f2ng y\u00eau c\u1ea7u \u0111\u0103ng nh\u1eadp v\u1edbi \u0111\u1ea7y \u0111\u1ee7 th\u00f4ng tin (\u0111\u1ecba ch\u1ec9, SDT, h\u1ecd t\u00ean).
   - T\u00edch h\u1ee3p nh\u1eadp M\u00e3 khuy\u1ebfn m\u00e3i (Voucher).
   - C\u1ed5ng thanh to\u00e1n \u0111a d\u1ea1ng (MoMo N\u1ed9i \u0111\u1ecba/Qu\u1ed1c t\u1ebf, Th\u1ebb T\u00edn d\u1ee5ng, Chuy\u1ec3n kho\u1ea3n).
   - **Th\u1ebb ph\u00f2ng Online (QR Code):** Sau khi \u0111\u1eb7t th\u00e0nh c\u00f4ng, nh\u1eadn ngay th\u1ebb ph\u00f2ng QR \u0111\u1ec3 check-in.
   - **Live Chat:** T\u01b0\u01a1ng t\u00e1c Realtime v\u1edbi nh\u00e2n vi\u00ean CSKH (\u1ee7ng h\u1ed9 AI Fallback khi nh\u00e2n vi\u00ean b\u1eadn).

2. **Giao di\u1ec7n Qu\u1ea3n tr\u1ecb (Admin Dashboard):**
   - **Overview:** Bi\u1ec3u \u0111\u1ed3 th\u1ed1ng k\u00ea doanh thu th\u1ef1c t\u1ebf l\u1ea5y t\u1eeb l\u1ecbch s\u1eed \u0111\u1eb7t ph\u00f2ng.
   - **Qu\u1ea3n l\u00fd Users (CRUD):** Xem, x\u00f3a, v\u00e0 ph\u00e2n quy\u1ec1n (Admin/Customer) tr\u1ef1c ti\u1ebfp t\u1eeb b\u1ea3ng \u0111i\u1ec1u khi\u1ec3n.
   - **Qu\u1ea3n l\u00fd Ph\u00f2ng & \u0110\u1a1n h\u00e0ng:** Ph\u00ea duy\u1ec7t/h\u1ee7y b\u1ecf \u0111\u01a1n \u0111\u1eb7t ph\u00f2ng, \u0111i\u1ec1u ch\u1ec9nh th\u00f4ng tin ph\u00f2ng.
   - **H\u1ed9p tho\u1ea1i CSKH:** Nh\u1eadn tin nh\u1eafn tr\u1ef1c ti\u1ebfp t\u1eeb User v\u00e0 ph\u1ea3n h\u1ed3i th\u00f4ng qua WebSocket.

## \ud83d\udee0 C\u00f4ng ngh\u1ec7 s\u1eed d\u1ee5ng

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Recharts.
- **Backend:** NestJS, TypeScript, TypeORM.
- **Database:** MySQL (Database-per-service).
- **Giao ti\u1ebfp:** REST API, WebSocket (Socket.io ch\u1ecbu tr\u00e1ch nhi\u1ec7m Chat Realtime).
- **Deployment:** Docker & Docker Compose.

## \ud83d\udc65 Ph\u00e2n c\u00f4ng c\u00f4ng vi\u1ec7c

| H\u1ecd t\u00ean | Email | Service ph\u1ee5 tr\u00e1ch & Ch\u1ee9c n\u0103ng hi\u1ec7n t\u1ea1i | Branch |
|:---|:---|:---|:---|
| **Tr\u01b0\u01a1ng V\u0103n Phong** | k5phong0311@gmail.com | **API Gateway** & **Chat Service**: X\u00e2y d\u1ef1ng c\u1ed5ng API chung. Thi\u1ebft l\u1eadp WebSocket Server t\u1ea1o lu\u1ed3ng tin nh\u1eafn Realtime gi\u1eefa Admin v\u00e0 User, AI t\u1ef1 \u0111\u1ed9ng. | `feat/api-gateway` |
| **Tr\u1ea7n \u0110\u1ee9c H\u1ea3i** | 2311060742@hunre.edu.vn | **User & Auth Service**: H\u1ec7 th\u1ed1ng x\u00e1c th\u1ef1c JWT, b\u1ea3o m\u1eadt \u0111\u0103ng nh\u1eadp. X\u00e2y d\u1ef1ng API CRUD cho user \u0111\u1ec3 Admin Dashboard g\u1ecdi v\u00e0 thao t\u00e1c (Delete/Update Role). | `feat/user-auth` |
| **Nguy\u1ec5n Th\u00e0nh H\u01b0ng** | 2311060608@hunre.edu.vn | **Room Catalog Service**: Qu\u1ea3n l\u00fd danh s\u00e1ch ph\u00f2ng, t\u00ecm ki\u1ebfm, x\u1eed l\u00fd tr\u1ea1ng th\u00e1i tr\u1ed1ng. X\u00e2y d\u1ef1ng giao di\u1ec7n hi\u1ec3n th\u1ecb **Th\u1ebb Ph\u00f2ng QR Code** sau khi thanh to\u00e1n. | `feat/room-catalog` |
| **B\u00f9i \u0110\u1ea1i D\u0169ng** | 2311060706@hunre.edu.vn | **Booking Service**: V\u00f2ng \u0111\u1eddi c\u1ee7a \u0111\u01a1n \u0111\u1eb7t ph\u00f2ng. Ph\u1ee5 tr\u00e1ch ch\u00ednh giao di\u1ec7n **BookingPage**: Th\u00eam tr\u01b0\u1eddng t\u00ean, S\u0110T, v\u00e0 \u00e1p d\u1ee5ng m\u00e3 khuy\u1ebfn m\u00e3i (Voucher). | `feat/booking-service` |
| **\u0110\u1ea5u Ng\u1ecdc Anh** | daungocanh90@gmail.com | **Payment Service**: T\u00edch h\u1ee3p Payment logic (MoMo mock url). Ch\u1ecbu tr\u00e1ch nhi\u1ec7m thi\u1ebft l\u1eadp Frontend Dashboard (\u0111\u1ed5 d\u1eef li\u1ec7u bi\u1ec3u \u0111\u1ed3 th\u1ef1c v\u00e0 lu\u1ed3ng thanh to\u00e1n \u0111a ph\u01b0\u01a1ng th\u1ee9c). | `feat/payment-notification` |

## \ud83d\ude80 C\u00e0i \u0111\u1eb7t & Ch\u1ea1y d\u1ef1 \u00e1n

D\u1ef1 \u00e1n ch\u1ea1y to\u00e0n b\u1ed9 tr\u00ean n\u1ec1n t\u1ea3ng Docker. B\u1ea1n kh\u00f4ng c\u1ea7n c\u00e0i Node.js t\u1eebng d\u1ef1 \u00e1n m\u00e0 ch\u1ec9 c\u1ea7n c\u00f3 **Docker** v\u00e0 **Docker Compose**.

```bash
# 1. Clone d\u1ef1 \u00e1n
git clone https://github.com/k5phong0311-sketch/booking_hotel-microservices.git
cd booking_hotel-microservices

# 2. Build v\u00e0 kh\u1edfi ch\u1ea1y c\u00e1c services
docker-compose up --build -d

# 3. Ki\u1ec3m tra c\u00e1c container (frontend, 5 nestjs backend, 5 mysql db)
docker ps
```
- **Frontend** ch\u1ea1y t\u1ea1i: `http://localhost:5173`
- **API Gateway** ch\u1ea1y t\u1ea1i: `http://localhost:3000`

## \ud83d\udee1\ufe0f T\u00e0i kho\u1ea3n Test
- **Admin**: `admin@bookinghotel.com` / `admin123` (Tr\u1ef1c ti\u1ebfp v\u00e0o menu Qu\u1ea3n tr\u1ecb, nh\u1eadn Chat t\u1eeb kh\u00e1ch)
- **Customer**: `customer@bookinghotel.com` / `123456`

---
*D\u1ef1 \u00e1n thi\u1ebft k\u1ebf t\u1eeb thi\u1ebft th\u1ef1c t\u1ebf, h\u01b0\u1edbng \u0111\u1ebfn m\u1ed9t ki\u1ebfn tr\u00fac h\u1ec7 th\u1ed1ng m\u1edf r\u1ed9ng cho ng\u00e0nh ngh\u1ec9 d\u01b0\u1ee1ng v\u00e0 du l\u1ecbch.*
