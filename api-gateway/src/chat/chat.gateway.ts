import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Logger } from '@nestjs/common';

// Admin clients (Nhân viên CSKH)
const adminSockets = new Set<string>();

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    
    // Nếu là admin connect (giả lập bằng query auth)
    if (client.handshake.query.role === 'admin') {
      adminSockets.add(client.id);
      this.logger.log(`Admin joined: ${client.id}. Total admins: ${adminSockets.size}`);
      // Broadcast tới tất cả user là Admin đang online
      this.server.emit('adminStatus', { isOnline: true });
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    if (adminSockets.has(client.id)) {
      adminSockets.delete(client.id);
      this.logger.log(`Admin left: ${client.id}. Total admins: ${adminSockets.size}`);
      if (adminSockets.size === 0) {
        this.server.emit('adminStatus', { isOnline: false });
      }
    }
  }

  @SubscribeMessage('checkAdminStatus')
  handleCheckAdminStatus(client: Socket) {
    client.emit('adminStatus', { isOnline: adminSockets.size > 0 });
  }

  @SubscribeMessage('userMessage')
  async handleUserMessage(
    @MessageBody() data: { message: string; requiresHuman: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Message from ${client.id}: ${data.message} | Human requested: ${data.requiresHuman}`);

    // Nếu khách yêu cầu gặp CSKH
    if (data.requiresHuman) {
      if (adminSockets.size > 0) {
        // Forward tin nhắn tới tất cả admin
        for (const adminId of adminSockets) {
          this.server.to(adminId).emit('adminReceiveMessage', {
            userId: client.id,
            message: data.message,
            timestamp: new Date(),
          });
        }
      } else {
        // Không có admin online -> Báo lỗi rớt mạng/offline
        client.emit('aiReply', {
          message: 'Dạ, hiện tại tất cả tư vấn viên đều đang bận hoặc ngoài giờ làm việc. Quý khách vui lòng để lại lời nhắn hoặc quay lại sau ạ.',
          timestamp: new Date(),
          isError: true,
        });
      }
      return;
    }

    // Nếu không yêu cầu gặp người, AI sẽ tự động trả lời
    const aiResponse = await this.chatService.getAiResponse(data.message);
    
    // Gửi trả lại client
    client.emit('aiReply', {
      message: aiResponse,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('adminReply')
  handleAdminReply(
    @MessageBody() data: { userId: string; message: string },
    @ConnectedSocket() admin: Socket,
  ) {
    // Admin gửi tin nhắn cho 1 user cụ thể
    if (adminSockets.has(admin.id)) {
      this.server.to(data.userId).emit('humanReply', {
        message: data.message,
        timestamp: new Date(),
      });
    }
  }
}
