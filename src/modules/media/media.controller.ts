import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { ZodSerializerDto } from 'nestjs-zod'
import path from 'path'
import { PresignedUploadFileBodyDTO, PresignedUploadFileResDTO, UploadFilesResDTO } from 'src/modules/media/media.dto'
import { MediaService } from 'src/modules/media/media.service'
import { ParseFilePipeWithUnlink } from 'src/modules/media/parse-file-pipe-with-unlink.pipe'
import { UPLOAD_DIR } from 'src/shared/constants/other.constant'
import { IsPublic } from 'src/shared/decorators/auth.decorator'
import { MessageResDTO } from 'src/shared/dtos/response.dto'

@Controller('media')
@ApiBearerAuth()
@ApiTags('Media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}
  @Post('images/upload')
  @ApiOperation({ summary: 'Upload images' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Upload images', type: UploadFilesResDTO })
  @ZodSerializerDto(UploadFilesResDTO)
  @UseInterceptors(
    FilesInterceptor('files', 100, {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  uploadFile(
    @UploadedFiles(
      new ParseFilePipeWithUnlink({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
      }),
    )
    files: Array<Express.Multer.File>,
  ) {
    return this.mediaService.uploadFile(files)
    // return files.map((file) => ({
    //   url: `${envConfig.PREFIX_STATIC_ENDPOINT}/${file.filename}`,
    // }))
  }

  @Get('static/:filename')
  @ApiOperation({ summary: 'Serve file' })
  @ApiResponse({ status: 200, description: 'Serve file', type: MessageResDTO })
  @IsPublic()
  serveFile(@Param('filename') filename: string, @Res() res: Response) {
    return res.sendFile(path.resolve(UPLOAD_DIR, filename), (error) => {
      if (error) {
        const notfound = new NotFoundException('File not found')
        res.status(notfound.getStatus()).json(notfound.getResponse())
      }
    })
  }

  @Post('images/upload/presigned-url')
  @ApiOperation({ summary: 'Get presigned URL for direct S3 upload' })
  @ApiResponse({ status: 200, description: 'Presigned URL created', type: PresignedUploadFileResDTO })
  @ZodSerializerDto(PresignedUploadFileResDTO)
  @IsPublic()
  async createPresignedUrl(@Body() body: PresignedUploadFileBodyDTO) {
    return this.mediaService.getPresignedUrl(body)
  }
}
