import { Injectable } from '@nestjs/common'
import { PrismaService } from '../services/prisma.service'

@Injectable()
export class SharedWebSocketRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create(data: { id: string; userId: number }) {
    return this.prismaService.websocket.create({
      data: {
        id: data.id,
        userId: data.userId,
      },
    })
  }

  delete(id: string) {
    return this.prismaService.websocket.delete({
      where: {
        id,
      },
    })
  }

  findMany(userId: number) {
    return this.prismaService.websocket.findMany({
      where: {
        userId,
      },
    })
  }
}
