import os

filepath = 'api-gateway/src/chat/chat.service.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# I will just write a whole new ChatService
new_service = """import { Injectable, Logger } from '@nestjs/common';
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
        return 'D\u1ea1, em l\u00e0 tr\u1ee3 l\u00fd \u1ea3o AI c\u1ee7a kh\u00e1ch s\u1ea1n BOOKINGHOTEL. B\u1ea1n c\u1ea7n em h\u1ed7 tr\u1ee3 g\u00ec th\u00eam v\u1ec1 gi\u00e1 ph\u00f2ng hay c\u00e1ch \u0111\u1eb7t ph\u00f2ng \u1ea1? (L\u01b0u \u00fd: T\u00ednh n\u0103ng AI hi\u1ec7n \u0111ang d\u00f9ng b\u1ea3n th\u1eed nghi\u1ec7m)';
      }

      const model = this.ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `B\u1ea1n l\u00e0 l\u1ec5 t\u00e2n. Kh\u00e1ch: ${userMessage}\\nL\u1ec5 t\u00e2n:`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      this.logger.error('AI Error:', error);
      return 'D\u1ea1, t\u00f4i \u0111ang g\u1eb7p ch\u00fat s\u1ef1 c\u1ed1 \u0111\u01b0\u1eddng truy\u1ec1n. Qu\u00fd kh\u00e1ch vui l\u00f2ng ch\u1edd ho\u1eb7c chat tr\u1ef1c ti\u1ebfp v\u1edbi nh\u00e2n vi\u00ean \u1ea1.';
    }
  }
}
"""

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_service)
