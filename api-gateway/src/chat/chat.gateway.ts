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

// Admin clients
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
    
    // N\u1ebfu l\u00e0 admin connect
    if (client.handshake.query.role === 'admin') {
      adminSockets.add(client.id);
      this.logger.log(`Admin joined: ${client.id}. Total admins: ${adminSockets.size}`);
      // Broadcast t\u1edbi t\u1ea5t c\u1ea3 user l\u00e0 Admin \u0111ang online
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

    if (data.requiresHuman) {
      if (adminSockets.size > 0) {
        // Forward tin nh\u1eafn t\u1edbi t\u1ea5t c\u1ea3 admin (nh\u01b0ng s\u1eed d\u1ee5ng \u0111\u00fang event 'userMessage' \u0111\u1ec3 admin Dashboard nh\u1eadn \u0111\u01b0\u1ee3c)
        for (const adminId of adminSockets) {
          this.server.to(adminId).emit('userMessage', {
            message: data.message,
            timestamp: new Date().toISOString(),
          });
        }
      } else {
        client.emit('aiReply', {
          message: 'D\u1ea1, hi\u1ec7n t\u1ea1i t\u1ea5t c\u1ea3 t\u01b0 v\u1ea5n vi\u00ean \u0111\u1ec1u \u0111ang b\u1eadn. Qu\u00fd kh\u00e1ch vui l\u00f2ng th\u1eed l\u1ea1i sau.',
          timestamp: new Date().toISOString(),
          isError: true,
        });
      }
      return;
    }

    const aiResponse = await this.chatService.getAiResponse(data.message);
    
    client.emit('aiReply', {
      message: aiResponse,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('adminReply')
  handleAdminReply(
    @MessageBody() data: { clientId: string; message: string },
    @ConnectedSocket() admin: Socket,
  ) {
    if (adminSockets.has(admin.id)) {
      if (data.clientId === 'broadcast') {
        this.server.emit('humanReply', {
          message: data.message,
          timestamp: new Date().toISOString(),
        });
      } else {
        this.server.to(data.clientId).emit('humanReply', {
          message: data.message,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }
}
