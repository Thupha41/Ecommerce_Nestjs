import { IoAdapter } from '@nestjs/platform-socket.io'
import { Server, ServerOptions, Socket } from 'socket.io'

const namespaces = ['/', 'chat', 'notification']
export class WebsocketAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): any {
    const server: Server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    })

    const authMiddleware = (socket: Socket, next: (err?: any) => void) => {
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
      next()
    }

    //Dùng cho namespace '/'
    server.use(authMiddleware)
    //Không áp dụng cho main namespace '/'
    server.of(/.*/).use(authMiddleware)
    // namespaces.forEach((namespace) => {
    //   server.of(namespace).use(authMiddleware)
    // })

    return server
  }
}
