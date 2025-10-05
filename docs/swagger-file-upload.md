# Hướng dẫn Upload File trong Swagger UI

Tài liệu này hướng dẫn cách cấu hình và sử dụng Swagger UI để upload file trong dự án NestJS.

## Cấu hình Controller để hỗ trợ upload file trong Swagger

Để Swagger UI có thể hiển thị form upload file, chúng ta cần thêm một số decorator từ `@nestjs/swagger`:

```typescript
import {
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiResponse
} from '@nestjs/swagger';

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
        new MaxFileSizeValidator({ maxSize: 1 * 1024 * 1024 }), // 1MB
        new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
      ],
    }),
  )
  files: Array<Express.Multer.File>,
) {
  return this.mediaService.uploadFile(files)
}
```

Các decorator quan trọng:

1. `@ApiConsumes('multipart/form-data')`: Chỉ định kiểu dữ liệu đầu vào là multipart/form-data (cần thiết cho upload file)
2. `@ApiBody({ schema: {...} })`: Mô tả cấu trúc của request body, bao gồm trường file với format binary

## Cách upload file trong Swagger UI

Sau khi đã cấu hình controller, bạn có thể upload file trong Swagger UI bằng cách:

1. Mở Swagger UI (thường là tại đường dẫn `/api-docs`)
2. Đăng nhập (nếu API yêu cầu xác thực) bằng cách:

   - Nhấp vào nút "Authorize" ở góc phải
   - Nhập token vào trường "Value" theo định dạng: `Bearer your_token_here`
   - Nhấp vào "Authorize" và đóng hộp thoại

3. Tìm endpoint upload file (trong trường hợp này là `POST /media/images/upload`)
4. Nhấp vào endpoint để mở rộng
5. Nhấp vào nút "Try it out"
6. Bạn sẽ thấy một form với nút "Choose File" (hoặc "Browse") để chọn file
7. Chọn file(s) cần upload
8. Nhấp vào nút "Execute" để gửi request

![Swagger UI File Upload](https://i.imgur.com/example-image.png)

## Upload nhiều file

Để upload nhiều file cùng lúc trong Swagger UI:

1. Đảm bảo schema trong `@ApiBody` có cấu trúc array cho trường file
2. Trong Swagger UI, bạn có thể chọn nhiều file bằng cách nhấp vào nút "Add item" để thêm nhiều trường file

```typescript
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
```

## Xử lý lỗi phổ biến

1. **Không thấy form upload file trong Swagger UI**:

   - Kiểm tra xem đã thêm `@ApiConsumes('multipart/form-data')` chưa
   - Kiểm tra xem đã cấu hình `@ApiBody` đúng chưa

2. **Lỗi "Request failed with status code 413"**:

   - File quá lớn, vượt quá giới hạn kích thước
   - Kiểm tra cấu hình giới hạn kích thước trong FilesInterceptor và MaxFileSizeValidator

3. **Lỗi "Unsupported Media Type"**:
   - Kiểm tra xem đã cấu hình đúng Content-Type chưa
   - Đảm bảo Swagger UI đang gửi request với Content-Type là multipart/form-data

## Cấu hình Swagger UI toàn cục

Để cấu hình Swagger UI toàn cục trong NestJS, bạn có thể chỉnh sửa file `main.ts`:

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API description')
    .setVersion('1.0')
    .addBearerAuth() // Thêm xác thực Bearer token
    .build()

  const document = SwaggerModule.createDocument(app, config)

  // Cấu hình tùy chọn Swagger UI
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Lưu thông tin xác thực giữa các refresh
      tagsSorter: 'alpha', // Sắp xếp các tag theo bảng chữ cái
      operationsSorter: 'alpha', // Sắp xếp các operation theo bảng chữ cái
    },
  })

  await app.listen(3000)
}
bootstrap()
```

## Kết luận

Với các cấu hình trên, bạn có thể dễ dàng upload file thông qua Swagger UI. Điều này rất hữu ích cho việc testing API mà không cần sử dụng các công cụ bên ngoài như Postman.

Hãy nhớ rằng Swagger UI chỉ là công cụ để testing API, trong môi trường production, client sẽ gửi request trực tiếp đến API của bạn thông qua code frontend hoặc các công cụ khác.
