# Triển khai Media trong NestJS với AWS S3

Tài liệu này mô tả chi tiết cách triển khai xử lý media trong dự án NestJS sử dụng AWS S3 để lưu trữ file.

## Mục lục

1. [Tổng quan](#tổng-quan)
2. [Cấu trúc module Media](#cấu-trúc-module-media)
3. [Luồng xử lý upload file](#luồng-xử-lý-upload-file)
4. [S3Service và cách triển khai](#s3service-và-cách-triển-khai)
5. [Cấu hình AWS S3 cho truy cập public](#cấu-hình-aws-s3-cho-truy-cập-public)
6. [Sử dụng Presigned URL](#sử-dụng-presigned-url)

## Tổng quan

Hệ thống media trong dự án được thiết kế để:

1. Upload file từ client lên server NestJS
2. Xác thực và kiểm tra file (kích thước, loại file)
3. Lưu trữ tạm thời file trên server
4. Upload file lên AWS S3
5. Xóa file tạm sau khi upload thành công
6. Trả về URL của file đã upload

Ngoài ra, hệ thống còn hỗ trợ tạo presigned URL để client có thể upload trực tiếp lên S3 mà không cần thông qua server.

## Cấu trúc module Media

Module Media bao gồm các thành phần chính:

- **MediaController**: Xử lý các request HTTP liên quan đến media
- **MediaService**: Chứa logic xử lý media
- **ParseFilePipeWithUnlink**: Custom pipe để xác thực file và xóa file tạm nếu xác thực thất bại
- **S3Service**: Dịch vụ tương tác với AWS S3

### MediaController

```typescript
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  // Upload file thông qua server
  @Post('images/upload')
  @ZodSerializerDto(UploadFilesResDTO)
  @UseInterceptors(FilesInterceptor('files', 100, {...}))
  uploadFile(@UploadedFiles(...) files: Array<Express.Multer.File>) {
    return this.mediaService.uploadFile(files)
  }

  // Tạo presigned URL để client upload trực tiếp lên S3
  @Post('images/upload/presigned-url')
  @ZodSerializerDto(PresignedUploadFileResDTO)
  @IsPublic()
  async createPresignedUrl(@Body() body: PresignedUploadFileBodyDTO) {
    return this.mediaService.getPresignUrl(body)
  }
}
```

### MediaService

```typescript
@Injectable()
export class MediaService {
  constructor(private readonly s3Service: S3Service) {}

  // Upload file lên S3 và xóa file tạm
  async uploadFile(files: Array<Express.Multer.File>) {
    const result = await Promise.all(
      files.map((file) => {
        return this.s3Service
          .uploadedFile({
            filename: 'images/' + file.filename,
            filepath: file.path,
            contentType: file.mimetype,
          })
          .then((res) => {
            return { url: res.Location }
          })
      }),
    )

    // Xóa file tạm sau khi upload lên S3
    await Promise.all(
      files.map((file) => {
        return unlink(file.path)
      }),
    )

    return {
      data: result,
    }
  }

  // Tạo presigned URL cho client upload trực tiếp
  async getPresignUrl(body: PresignedUploadFileBodyType) {
    const randomFilename = generateRandomFilename(body.filename)
    const presignedUrl = await this.s3Service.createPresignedUrlWithClient(randomFilename)
    const url = presignedUrl.split('?')[0]
    return {
      presignedUrl,
      url,
    }
  }
}
```

### ParseFilePipeWithUnlink

```typescript
export class ParseFilePipeWithUnlink extends ParseFilePipe {
  constructor(options?: ParseFileOptions) {
    super(options)
  }

  async transform(files: Array<Express.Multer.File>): Promise<any> {
    return super.transform(files).catch(async (error) => {
      // Xóa file tạm nếu xác thực thất bại
      await Promise.all(files.map((file) => unlink(file.path)))
      throw error
    })
  }
}
```

## Luồng xử lý upload file

1. Client gửi request POST với file đính kèm
2. `FilesInterceptor` xử lý multipart/form-data và lưu file tạm vào thư mục `upload`
3. `ParseFilePipeWithUnlink` xác thực file (kích thước, loại file)
4. Nếu xác thực thất bại, file tạm sẽ bị xóa và trả về lỗi
5. `MediaService.uploadFile()` được gọi để xử lý file
6. `S3Service.uploadedFile()` upload file lên AWS S3
7. Sau khi upload thành công, file tạm được xóa
8. Trả về URL của file đã upload cho client

## S3Service và cách triển khai

S3Service sử dụng AWS SDK để tương tác với AWS S3:

```typescript
@Injectable()
export class S3Service {
  private s3: S3

  constructor() {
    this.s3 = new S3({
      region: envConfig.S3_REGION,
      credentials: {
        secretAccessKey: envConfig.S3_SECRET_KEY,
        accessKeyId: envConfig.S3_ACCESS_KEY,
      },
    })
  }

  // Upload file lên S3
  uploadedFile({ filename, filepath, contentType }: { filename: string; filepath: string; contentType: string }) {
    const parallelUploads3 = new Upload({
      client: this.s3,
      params: {
        Bucket: envConfig.S3_BUCKET_NAME,
        Key: filename,
        Body: readFileSync(filepath),
        ContentType: contentType,
      },
      tags: [],
      queueSize: 4,
      partSize: 1024 * 1024 * 5,
      leavePartsOnError: false,
    })
    return parallelUploads3.done()
  }

  // Tạo presigned URL cho client upload trực tiếp
  createPresignedUrlWithClient(filename: string) {
    const contentType = mime.lookup(filename) || 'application/octet-stream'
    const command = new PutObjectCommand({
      Bucket: envConfig.S3_BUCKET_NAME,
      Key: filename,
      ContentType: contentType,
    })
    return getSignedUrl(this.s3, command, { expiresIn: 10 })
  }
}
```

### Cấu hình môi trường

Để sử dụng S3Service, bạn cần cấu hình các biến môi trường sau trong file `.env`:

```
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key
S3_REGION=your_region
S3_BUCKET_NAME=your_bucket_name
```

## Cấu hình AWS S3 cho truy cập public

Để các file được upload lên S3 có thể truy cập công khai, bạn cần cấu hình S3 bucket như sau:

### 1. Tắt Block Public Access

1. Đăng nhập vào AWS Management Console
2. Truy cập dịch vụ S3
3. Chọn bucket của bạn
4. Chọn tab "Permissions"
5. Trong phần "Block public access (bucket settings)", chọn "Edit"
6. Bỏ chọn tất cả các tùy chọn (hoặc chỉ bỏ chọn những tùy chọn cần thiết)
7. Chọn "Save changes"

![Block Public Access Settings](https://docs.aws.amazon.com/AmazonS3/latest/userguide/images/edit-public-access-clear.png)

### 2. Cấu hình Bucket Policy

1. Trong tab "Permissions", cuộn xuống phần "Bucket policy"
2. Chọn "Edit"
3. Thêm policy sau (thay `your-bucket-name` bằng tên bucket của bạn):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

4. Chọn "Save changes"

Policy này cho phép bất kỳ ai cũng có thể đọc (GET) các object trong bucket của bạn.

### 3. Cấu hình CORS (nếu cần)

Nếu bạn cần truy cập các file từ các domain khác, bạn cần cấu hình CORS:

1. Trong tab "Permissions", cuộn xuống phần "Cross-origin resource sharing (CORS)"
2. Chọn "Edit"
3. Thêm cấu hình sau:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

4. Chọn "Save changes"

## Sử dụng Presigned URL

Presigned URL là một URL tạm thời cho phép client upload file trực tiếp lên S3 mà không cần thông qua server. Điều này giúp giảm tải cho server và tăng tốc độ upload.

### Luồng xử lý với Presigned URL

1. Client gửi request đến server để lấy presigned URL
2. Server tạo presigned URL và trả về cho client
3. Client sử dụng presigned URL để upload file trực tiếp lên S3
4. Sau khi upload thành công, client có thể truy cập file thông qua URL trả về

### Ví dụ sử dụng Presigned URL từ client

```javascript
// Bước 1: Lấy presigned URL từ server
const response = await fetch('/media/images/upload/presigned-url', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    filename: 'example.jpg',
    filesize: file.size,
  }),
})
const { presignedUrl, url } = await response.json()

// Bước 2: Upload file trực tiếp lên S3 sử dụng presigned URL
await fetch(presignedUrl, {
  method: 'PUT',
  body: file,
  headers: {
    'Content-Type': file.type,
  },
})

// Bước 3: File có thể truy cập thông qua URL
console.log('File URL:', url)
```

## Lưu ý bảo mật

Khi cấu hình S3 bucket cho truy cập public, bạn cần lưu ý:

1. Chỉ cho phép truy cập public cho những file cần thiết
2. Sử dụng thư mục riêng cho các file public và private
3. Không lưu trữ thông tin nhạy cảm trong tên file hoặc metadata
4. Giới hạn kích thước file và loại file được phép upload
5. Xem xét sử dụng CloudFront để cung cấp các file với bảo mật và hiệu suất tốt hơn

## Kết luận

Triển khai media trong NestJS với AWS S3 giúp ứng dụng của bạn có thể xử lý và lưu trữ file một cách hiệu quả và an toàn. Bằng cách sử dụng S3, bạn không cần lo lắng về việc quản lý lưu trữ và có thể tận dụng các tính năng mạnh mẽ của AWS như scaling, availability và security.
