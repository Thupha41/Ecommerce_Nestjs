import { Controller, Get, Param, Post, Body, Query, Put, Delete } from '@nestjs/common'
import { ReviewService } from 'src/modules/review/review.service'
import { PaginationQueryDTO } from 'src/shared/dtos/request.dto'
import { ApiBearerAuth, ApiBody, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger'
import { SkipThrottle } from '@nestjs/throttler'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateReviewBodyDTO,
  GetReviewsDTO,
  CreateReviewResDTO,
  UpdateReviewBodyDTO,
  UpdateReviewResDTO,
  GetReviewDetailParamsDTO,
  GetReviewParamsDTO,
} from 'src/modules/review/review.dto'
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { IsPublic } from 'src/shared/decorators/auth.decorator'
import { SkipThrottle } from '@nestjs/throttler'

@ApiTags('Reviews')
@ApiBearerAuth()
@SkipThrottle()
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}
  @SkipThrottle()
  @Get('products/:productId')
  @IsPublic()
  @ApiParam({ name: 'productId', required: true, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ZodSerializerDto(GetReviewsDTO)
  @ResponseMessage('Reviews fetched successfully')
  list(@Query() pagination: PaginationQueryDTO, @Param() params: GetReviewParamsDTO) {
    return this.reviewService.list(params.productId, pagination)
  }

  @Post()
  @ApiBody({ type: CreateReviewBodyDTO })
  @ZodSerializerDto(CreateReviewResDTO)
  @ResponseMessage('Review created successfully')
  create(@Body() body: CreateReviewBodyDTO, @ActiveUser('userId') userId: number) {
    return this.reviewService.create(userId, body)
  }

  @Put(':reviewId')
  @ApiParam({ name: 'reviewId', required: true, type: Number })
  @ApiBody({ type: UpdateReviewBodyDTO })
  @ZodSerializerDto(UpdateReviewResDTO)
  @ResponseMessage('Review updated successfully')
  update(
    @Body() body: UpdateReviewBodyDTO,
    @Param() params: GetReviewDetailParamsDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.reviewService.update({ userId, reviewId: params.reviewId, body })
  }

  @Delete(':reviewId')
  @ApiParam({ name: 'reviewId', required: true, type: Number })
  @ZodSerializerDto(MessageResDTO)
  @ResponseMessage('Review deleted successfully')
  delete(@Param() params: GetReviewDetailParamsDTO, @ActiveUser('userId') userId: number) {
    return this.reviewService.delete(userId, params.reviewId)
  }
}
