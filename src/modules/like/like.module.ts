import { Module } from '@nestjs/common'
import { LikeController } from './like.controller'
import { LikeRepo } from './like.repo'
import { LikeService } from './like.service'

@Module({
  providers: [LikeService, LikeRepo],
  controllers: [LikeController],
})
export class LikeModule {}

