import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'
import { InjectQueue } from '@nestjs/bullmq'
import { CANCEL_PAYMENT_JOB_NAME, PAYMENT_QUEUE_NAME } from 'src/shared/constants/queue.constant'
import { generateCancelPaymentJobId } from 'src/shared/helpers'

@Injectable()
export class OrderProducer {
  constructor(@InjectQueue(PAYMENT_QUEUE_NAME) private paymentQueue: Queue) {
    this.paymentQueue.getJobs().then((jobs) => {
      console.log(jobs)
    })
  }

  async addCancelPaymentJob(paymentId: number) {
    return this.paymentQueue.add(
      CANCEL_PAYMENT_JOB_NAME,
      {
        paymentId,
      },
      {
        delay: 1000 * 60 * 15, // delay 15 phút
        jobId: generateCancelPaymentJobId(paymentId),
        removeOnComplete: true, //Khi job này hoàn thành thì sẽ xóa job khỏi queue
        removeOnFail: true, //Khi job này thất bại thì sẽ xóa job khỏi queue
      },
    )
  }
}
