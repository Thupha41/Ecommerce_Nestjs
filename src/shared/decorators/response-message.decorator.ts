import { SetMetadata } from '@nestjs/common'

/**
 * Decorator để đặt thông báo phản hồi cho một route handler.
 * @param message Thông báo phản hồi, có thể là string thông thường hoặc template string với placeholders {key}
 * @param isTemplate Nếu true, message sẽ được xử lý như một template string
 */
export const ResponseMessage = (message: string, isTemplate: boolean = false) =>
  SetMetadata('response_message', { message, isTemplate })
