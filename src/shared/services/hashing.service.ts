import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
@Injectable()
export class HashingService {
  private readonly saltRounds = 10
  hash(value: string) {
    return bcrypt.hash(value, this.saltRounds)
  }

  compare(value: string, hash: string) {
    return bcrypt.compare(value, hash)
  }
}
