import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class ChatService {
  private ai: GoogleGenerativeAI;
  private readonly logger = new Logger(ChatService.name);

  // Hardcode system prompt để AI đóng vai Lễ tân Khách sạn BOOKINGHOTEL
  private readonly systemPrompt = `
Bạn là "Lễ tân ảo" của khách sạn cao cấp BOOKINGHOTEL.
Thông tin khách sạn:
- Vị trí: Bãi biển tuyệt đẹp, không gian yên tĩnh.
- Loại phòng: Single, Double, Deluxe, Suite. Giá từ 500k đến 2 triệu/đêm.
- Tiện ích: Hồ bơi vô cực, Spa, Nhà hàng chuẩn 5 sao, đưa đón sân bay miễn phí.
- Giờ nhận phòng: 14:00, Trả phòng: 12:00.
Quy tắc trả lời:
- Luôn xưng hô "Dạ", "Quý khách", thái độ cực kỳ chuyên nghiệp, lịch sự và ân cần.
- Trả lời ngắn gọn, súc tích (dưới 50 từ).
- Nếu khách hỏi những câu không liên quan đến khách sạn, hãy khéo léo từ chối và hướng về dịch vụ phòng.
- Tuyệt đối không tự ý bịa ra giá tiền nếu không chắc chắn.
  `;

  constructor() {
    // Lấy API key từ env, nếu không có thì dùng chuỗi rỗng để tránh crash (sẽ báo lỗi khi chat)
    const apiKey = process.env.GEMINI_API_KEY || '';
    this.ai = new GoogleGenerativeAI(apiKey);
  }

  async getAiResponse(userMessage: string): Promise<string> {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return 'Dạ, hiện tại hệ thống AI đang bảo trì. Quý khách vui lòng kết nối với Nhân viên CSKH ạ.';
      }

      const model = this.ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `${this.systemPrompt}\n\nKhách: ${userMessage}\nLễ tân:`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      this.logger.error('AI Error:', error);
      return 'Dạ, tôi đang gặp chút sự cố đường truyền. Quý khách vui lòng chờ trong giây lát hoặc kết nối trực tiếp với Nhân viên ạ.';
    }
  }
}
