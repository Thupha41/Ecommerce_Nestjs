import { Injectable } from '@nestjs/common'
import { CreateReviewBodyType, UpdateReviewBodyType } from 'src/modules/review/review.model'
import { ReviewRepository } from 'src/modules/review/review.repo'
import { PaginationQueryType } from 'src/shared/models/request.model'

@Injectable()
export class ReviewService {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  list(productId: number, pagination: PaginationQueryType) {
    return this.reviewRepository.list(pagination, productId)
  }

  async create(userId: number, body: CreateReviewBodyType) {
    return await this.reviewRepository.create(userId, body)
  }

  async update({ userId, reviewId, body }: { userId: number; reviewId: number; body: UpdateReviewBodyType }) {
    return await this.reviewRepository.update({
      userId,
      reviewId,
      body,
    })
  }

  async delete(userId: number, reviewId: number) {
    return await this.reviewRepository.delete(userId, reviewId)
  }
}
