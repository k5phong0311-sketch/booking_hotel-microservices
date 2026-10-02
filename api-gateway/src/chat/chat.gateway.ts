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
import { Logger } from '@nestjs/common';

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

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    
    if (client.handshake.query.role === 'admin') {
      adminSockets.add(client.id);
      this.logger.log(`Admin joined: ${client.id}`);
      this.server.emit('adminStatus', { isOnline: true });
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    if (adminSockets.has(client.id)) {
      adminSockets.delete(client.id);
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
    @MessageBody() data: { message: string; requiresHuman?: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Message from ${client.id}: ${data.message}`);

    // Always route to admin in this new spec
    if (adminSockets.size > 0) {
      for (const adminId of adminSockets) {
        this.server.to(adminId).emit('userMessage', {
          senderId: client.id,
          message: data.message,
          timestamp: new Date().toISOString(),
        });
      }
    } else {
      client.emit('aiReply', {
        message: 'Xin l\u1ed7i, hi\u1ec7n t\u1ea1i t\u1ea5t c\u1ea3 CSKH \u0111\u1ec1u offline. B\u1ea1n vui l\u00f2ng \u0111\u1ec3 l\u1ea1i l\u1eddi nh\u1eafn!',
        timestamp: new Date().toISOString(),
        isError: true,
      });
    }
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
