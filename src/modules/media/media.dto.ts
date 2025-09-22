import { createZodDto } from 'nestjs-zod'
import {
  PresignedUploadFileBodySchema,
  PresignedUploadFileResSchema,
  UploadFilesResSchema,
} from 'src/modules/media/media.model'

export class PresignedUploadFileBodyDTO extends createZodDto(PresignedUploadFileBodySchema) {}

export class UploadFilesResDTO extends createZodDto(UploadFilesResSchema) {}

export class PresignedUploadFileResDTO extends createZodDto(PresignedUploadFileResSchema) {}
