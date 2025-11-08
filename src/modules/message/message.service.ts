import { Injectable } from '@nestjs/common'
import { MessageRepo } from './message.repo'
import { GetMessagesQueryType, CreateMessageBodyType, CreateMessageResType } from './models/message.model'

@Injectable()
export class MessageService {
  constructor(private readonly messageRepo: MessageRepo) {}

  async create(fromUserId: number, data: CreateMessageBodyType): Promise<CreateMessageResType> {
    return this.messageRepo.create(fromUserId, data)
  }

  async list(query: GetMessagesQueryType) {
    return this.messageRepo.list(query)
  }
}

