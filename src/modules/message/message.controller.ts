import { Controller, Get, Post, Query, Body } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags, ApiBody } from '@nestjs/swagger'

import { ZodSerializerDto } from 'nestjs-zod'
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator'
import { GetMessagesQueryDTO, GetMessagesResDTO, CreateMessageBodyDTO, CreateMessageResDTO } from './message.dto'
import { MessageService } from './message.service'

@ApiBearerAuth()
@ApiTags('Messages')

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get()
  @ZodSerializerDto(GetMessagesResDTO)
  @ApiOperation({ summary: 'List messages', description: 'Get a list of messages with pagination, filtering, and sorting' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'fromUserId', required: false, type: Number })
  @ApiQuery({ name: 'orderBy', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['createdAt'] })
  @ResponseMessage('Messages fetched successfully')
  list(@Query() query: GetMessagesQueryDTO) {
    return this.messageService.list(query)
  }

  @Post()
  @ApiBody({ type: CreateMessageBodyDTO })
  @ZodSerializerDto(CreateMessageResDTO)
  @ApiOperation({ summary: 'Create message', description: 'Create a new message' })
  @ResponseMessage('Message created successfully')
  create(@Body() body: CreateMessageBodyDTO) {
    return this.messageService.create(body)
  }
}

