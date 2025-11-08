import { Controller, Get, Post, Query, Body } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags, ApiBody } from '@nestjs/swagger'
import { SkipThrottle } from '@nestjs/throttler'
import { ZodSerializerDto } from 'nestjs-zod'
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { GetLikesQueryDTO, GetLikesResDTO, CreateLikeBodyDTO, LikeResDTO } from './like.dto'
import { LikeService } from './like.service'

@ApiBearerAuth()
@ApiTags('Likes')
@SkipThrottle()
@Controller('likes')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Get()
  @ZodSerializerDto(GetLikesResDTO)
  @ApiOperation({ summary: 'Get likes by user', description: 'Get a list of likes for the current user with filtering' })
  @ApiQuery({ name: 'productId', required: false, type: Number })
  @ApiQuery({ name: 'orderBy', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['createdAt'] })
  @ResponseMessage('Likes fetched successfully')
  list(@ActiveUser('userId') userId: number, @Query() query: GetLikesQueryDTO) {
    return this.likeService.list(userId, query)
  }

  @Post()
  @ApiBody({ type: CreateLikeBodyDTO })
  @ApiOperation({
    summary: 'Like or dislike product',
    description: 'Like (quantity=1) or dislike (quantity=-1) a product. Dislike will remove the like record.',
  })
  @ResponseMessage('Like action completed successfully')
  async likeOrDislike(@ActiveUser('userId') userId: number, @Body() body: CreateLikeBodyDTO) {
    const result = await this.likeService.likeOrDislike(userId, body)
    if (result) {
      return result
    }
    // When dislike (quantity=-1), return success message
    return { message: 'Product unliked successfully' }
  }
}

