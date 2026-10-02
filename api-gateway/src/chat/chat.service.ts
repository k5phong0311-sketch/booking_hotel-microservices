import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class ChatService {
  private ai: GoogleGenerativeAI;
  private readonly logger = new Logger(ChatService.name);

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || '';
    this.ai = new GoogleGenerativeAI(apiKey);
  }

  async getAiResponse(userMessage: string): Promise<string> {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return 'Dạ, em là trợ lý ảo AI của khách sạn BOOKINGHOTEL. Bạn cần em hỗ trợ gì thêm về giá phòng hay cách đặt phòng ạ? (Lưu ý: Tính năng AI hiện đang dùng bản thử nghiệm)';
      }

      const model = this.ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Bạn là lễ tân. Khách: ${userMessage}\nLễ tân:`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      this.logger.error('AI Error:', error);
      return 'Dạ, tôi đang gặp chút sự cố đường truyền. Quý khách vui lòng chờ hoặc chat trực tiếp với nhân viên ạ.';
    }
  }
}
