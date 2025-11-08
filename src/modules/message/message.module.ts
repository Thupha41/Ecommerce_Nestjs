import { Module } from '@nestjs/common'
import { MessageController } from './message.controller'
import { MessageRepo } from './message.repo'
import { MessageService } from './message.service'

@Module({
  providers: [MessageService, MessageRepo],
  controllers: [MessageController],
})
export class MessageModule {}

