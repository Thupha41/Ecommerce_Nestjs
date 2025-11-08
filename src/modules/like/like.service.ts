import { Injectable } from '@nestjs/common'
import { LikeRepo } from './like.repo'
import { GetLikesQueryType, GetLikesResType, CreateLikeBodyType, LikeResType } from './models/like.model'

@Injectable()
export class LikeService {
  constructor(private readonly likeRepo: LikeRepo) {}

  async likeOrDislike(userId: number, data: CreateLikeBodyType): Promise<LikeResType | null> {
    return this.likeRepo.likeOrDislike(userId, data)
  }

  async list(userId: number, query: GetLikesQueryType): Promise<GetLikesResType> {
    return this.likeRepo.list(userId, query)
  }
}

