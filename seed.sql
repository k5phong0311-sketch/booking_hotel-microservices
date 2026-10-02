USE room_db;

TRUNCATE TABLE rooms;

INSERT INTO rooms (name, type, pricePerNight, description, imageUrl, isAvailable, floor, createdAt) VALUES
('Phòng Standard Hướng Phố', 'SINGLE', 850000.00, 'Phòng tiêu chuẩn với giường đơn, cửa sổ hướng phố nhộn nhịp, đầy đủ tiện nghi cơ bản phù hợp cho khách lẻ đi công tác ngắn ngày.', 'https://images.unsplash.com/photo-1598928506311-c55dd61df898?q=80&w=1000&auto=format&fit=crop', 1, 1, NOW()),
('Phòng Superior Đôi', 'DOUBLE', 1250000.00, 'Phòng Superior với giường đôi cỡ lớn, không gian thoáng đãng, phòng tắm đứng sang trọng với vòi sen mưa.', 'https://images.unsplash.com/photo-1590490359683-658d34c8f178?q=80&w=1000&auto=format&fit=crop', 1, 2, NOW()),
('Phòng Deluxe Hướng Biển', 'DELUXE', 2500000.00, 'Tận hưởng bình minh trên biển ngay từ ban công riêng biệt. Giường King size cao cấp, minibar miễn phí và dịch vụ phòng 24/7.', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000&auto=format&fit=crop', 1, 3, NOW()),
('Suite Hoàng Gia (Premium)', 'SUITE', 5800000.00, 'Trải nghiệm đỉnh cao lưu trú với không gian 120m2 bao gồm phòng khách, phòng ngủ riêng biệt, bồn tắm sục Jacuzzi và view toàn cảnh 360 độ.', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1000&auto=format&fit=crop', 1, 5, NOW()),
('Phòng Standard Tiết Kiệm', 'SINGLE', 600000.00, 'Phòng 1 giường đơn gọn gàng, sạch sẽ, phù hợp nghỉ chân qua đêm.', 'https://images.unsplash.com/photo-1618773928120-2c15c328080f?q=80&w=1000&auto=format&fit=crop', 1, 1, NOW()),
('Phòng Deluxe Góc (Corner)', 'DELUXE', 3200000.00, 'Phòng góc với 2 mặt kính cường lực, ngắm trọn vẹn thành phố về đêm cực kỳ lãng mạn.', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1000&auto=format&fit=crop', 1, 4, NOW()),
('Suite Gia Đình 2 Phòng Ngủ', 'SUITE', 4500000.00, 'Rất thích hợp cho gia đình có trẻ em. Gồm 1 phòng Master và 1 phòng Twin, thiết kế thông nhau tiện lợi.', 'https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=1000&auto=format&fit=crop', 1, 3, NOW());
