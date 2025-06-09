import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

@WebSocketGateway({ namespace: 'chat' })
export class ChatGateWay implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server
  afterInit(server: Server): void {
    console.log('WebSocket server initialized')
  }

  handleConnection(client: Socket): void {
    console.log('Client connected:', client.id)
  }

  handleDisconnect(client: Socket): void {
    console.log('Client disconnected:', client.id)
  }

  @SubscribeMessage('send-message')
  handleMessage(@MessageBody() data: string): string {
    this.server.emit('receive-message', {
      data: `Hello ${data}`,
    })
    return data
  }
}
