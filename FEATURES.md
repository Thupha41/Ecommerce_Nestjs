## Chức năng hệ thống (Ecommerce NestJS)

Tài liệu này tổng hợp chức năng và endpoint chính của hệ thống, nhóm theo module. Mỗi mục ghi rõ quyền truy cập (Public/Auth), tham số cơ bản và hành vi nổi bật.

### Tổng quan hạ tầng ứng dụng
- **Validation/Serialization**: Zod DTOs + `CustomZodValidationPipe`, `ZodSerializerInterceptor` (áp dụng toàn cục)
- **Bọc response**: `TransformInterceptor` → chuẩn hóa `{ data, statusCode }`
- **Xử lý lỗi**: `HttpExceptionFilter`, `CatchEverythingFilter` (toàn cục)
- **Bảo vệ & Rate limit**: `ThrottlerModule` với guard `ThrottlerBehindProxyGuard`
- **I18n**: `nestjs-i18n` (query `lang` hoặc header `Accept-Language`), types generate ra `src/generated/i18n.generated.ts`
- **Cache**: `CacheModule` dùng `Keyv` (memory LRU) + `KeyvRedis`
- **Log**: `nestjs-pino` ghi file `logs/app.log`
- **Queue**: BullMQ (Redis) cho payment
- **Cron**: `RemoveRefreshTokenCronjob` dọn refresh token hết hạn (1AM hằng ngày)
- **WebSocket**: `chat` và `payment` namespace (socket.io)

---

### Auth Module (`/auth`) [Public cho một số API]
- `POST /auth/register`: Đăng ký tài khoản mới
- `POST /auth/otp`: Gửi mã OTP (đăng ký/quên mật khẩu)
- `POST /auth/login`: Đăng nhập bằng email/password. Theo dõi `userAgent`, `ip`
- `POST /auth/refresh-token`: Cấp mới access token từ refresh token
- `POST /auth/logout`: Đăng xuất, thu hồi refresh token
- `GET /auth/google-link`: Lấy Google OAuth authorization URL
- `GET /auth/google/callback?code&state`: Callback Google → redirect kèm token hoặc error
- 2FA:
  - `POST /auth/2fa/setup`: Khởi tạo 2FA cho người dùng hiện tại
  - `POST /auth/2fa/disable`: Tắt 2FA

### User Module (`/users`) [Auth]
- `GET /users`: Danh sách người dùng (page, limit)
- `GET /users/:userId`: Chi tiết người dùng
- `POST /users`: Tạo mới (ghi nhận `createdById`, `createdByRoleName`)
- `PUT /users/:userId`: Cập nhật (ghi nhận `updatedBy...`)
- `DELETE /users/:userId`: Xóa (ghi nhận `deletedBy...`)

### Profile Module (`/profile`) [Auth]
- `GET /profile`: Lấy hồ sơ cá nhân người dùng hiện tại
- `PUT /profile`: Cập nhật hồ sơ
- `PUT /profile/change-password`: Đổi mật khẩu

### Role Module (`/roles`) [Auth]
- `GET /roles`: Danh sách role (page, limit)
- `GET /roles/:roleId`: Chi tiết role
- `POST /roles`: Tạo role
- `PUT /roles/:roleId`: Cập nhật role
- `DELETE /roles/:roleId`: Xóa role (hỗ trợ soft/hard thông qua query `isHard`)

### Permission Module (`/permissions`) [Auth]
- `GET /permissions`: Danh sách quyền (page, limit)
- `GET /permissions/:permissionId`: Chi tiết quyền
- `POST /permissions`: Tạo quyền
- `PUT /permissions/:permissionId`: Cập nhật quyền
- `DELETE /permissions/:permissionId`: Xóa quyền

### Language Module (`/languages`) [Public cho list]
- `GET /languages`: Danh sách ngôn ngữ hỗ trợ
- `GET /languages/:languageId`: Chi tiết ngôn ngữ
- `POST /languages`: Tạo ngôn ngữ (id là mã như `en`, `vi`)
- `PUT /languages/:languageId`: Cập nhật ngôn ngữ (không thay đổi id)
- `DELETE /languages/:languageId`: Xóa ngôn ngữ

### Brand Module (`/brands`) [Public cho GET]
- `GET /brands`: Danh sách brand (page, limit, lang)
- `GET /brands/:brandId`: Chi tiết brand
- `POST /brands`: Tạo brand
- `PUT /brands/:brandId`: Cập nhật brand
- `DELETE /brands/:brandId`: Xóa brand

#### Brand Translation (`/brand-translations`) [Auth]
- `GET /brand-translations/:brandTranslationId`: Chi tiết bản dịch brand
- `POST /brand-translations`: Tạo bản dịch brand
- `PUT /brand-translations/:brandTranslationId`: Cập nhật bản dịch
- `DELETE /brand-translations/:brandTranslationId`: Xóa bản dịch

### Category Module (`/categories`) [Public cho GET]
- `GET /categories`: Danh sách category (page, limit, lang, parentCategoryId)
- `GET /categories/:categoryId`: Chi tiết category (tùy lang)
- `POST /categories`: Tạo category
- `PUT /categories/:categoryId`: Cập nhật category
- `DELETE /categories/:categoryId`: Xóa category

#### Category Translation (`/category-translations`) [Auth]
- `GET /category-translations/:categoryTranslationId`: Chi tiết bản dịch category
- `POST /category-translations`: Tạo bản dịch
- `PUT /category-translations/:categoryTranslationId`: Cập nhật
- `DELETE /category-translations/:categoryTranslationId`: Xóa

### Product Module
- Public Catalog (`/products`) [Public]
  - `GET /products`: Danh sách sản phẩm, filter: name, brandIds, categories, minPrice, maxPrice, createdById, isPublic, orderBy, sortBy, page, limit
  - `GET /products/:productId`: Chi tiết sản phẩm
- Manage Product (`/manage-product/products`) [Auth]
  - `GET /manage-product/products`: Danh sách quản trị (giống filter catalog, có phân quyền theo role)
  - `GET /manage-product/products/:productId`: Chi tiết quản trị
  - `POST /manage-product/products`: Tạo sản phẩm
  - `PUT /manage-product/products/:productId`: Cập nhật sản phẩm
  - `DELETE /manage-product/products/:productId`: Xóa sản phẩm

### Cart Module (`/cart`) [Auth]
- `GET /cart`: Lấy giỏ hàng (page, limit)
- `POST /cart`: Thêm sản phẩm vào giỏ
- `PUT /cart/:cartItemId`: Cập nhật item trong giỏ
- `POST /cart/delete`: Xóa nhiều item (trả về `{count}` và `{notFoundMessage}`)
- `POST /cart/checkout`: Tính toán/Review checkout (giá, giảm giá, phí, ...)

### Delivery Info Module (`/delivery-info`) [Auth]
- `GET /delivery-info/default`: Lấy địa chỉ mặc định
- `GET /delivery-info`: Danh sách địa chỉ của tôi
- `GET /delivery-info/:deliveryInfoId`: Chi tiết địa chỉ
- `POST /delivery-info`: Tạo địa chỉ giao hàng
- `PUT /delivery-info/:deliveryInfoId`: Cập nhật địa chỉ
- `DELETE /delivery-info/:deliveryInfoId`: Xóa địa chỉ

### Discount Module (`/discounts`) [Auth]
- `GET /discounts`: Danh sách + filter nâng cao (type, code, isActive, applyTo, start/end date, orderBy/sortBy, page/limit)
- `POST /discounts`: Tạo discount
- `PUT /discounts/:discountId`: Cập nhật discount
- `DELETE /discounts/:discountId`: Xóa discount

#### Discount Translation (`/discount-translations`) [Auth]
- `GET /discount-translations/:discountTranslationId`: Chi tiết bản dịch
- `POST /discount-translations`: Tạo bản dịch
- `PUT /discount-translations/:discountTranslationId`: Cập nhật
- `DELETE /discount-translations/:discountTranslationId`: Xóa

### Order Module (`/orders`) [Auth]
- `GET /orders`: Danh sách đơn hàng của tôi (page, limit, status)
- `GET /orders/:orderId`: Chi tiết đơn hàng
- `POST /orders`: Tạo đơn hàng từ giỏ/checkout
- `PUT /orders/:orderId`: Hủy đơn hàng (theo chính sách, cập nhật trạng thái)

### Review Module (`/reviews`) [Public list, Auth create/update/delete]
- `GET /reviews/products/:productId`: Danh sách đánh giá sản phẩm (page, limit)
- `POST /reviews`: Tạo đánh giá
- `PUT /reviews/:reviewId`: Cập nhật đánh giá
- `DELETE /reviews/:reviewId`: Xóa đánh giá

### Payment Module (`/payment`)
- `POST /payment/receiver` [Bảo vệ bởi API Key]: Webhook nhận sự kiện thanh toán → xử lý cập nhật payment/order tương ứng

### WebSockets
- Namespace `chat` (`/socket.io/chat`)
  - Event `send-message` → server broadcast `receive-message`
- Namespace `payment` (`/socket.io/payment`)
  - Event `send-money` → server broadcast `receive-money`

### Queue (BullMQ)
- Queue `PAYMENT_QUEUE_NAME`
  - Job `CANCEL_PAYMENT_JOB_NAME`: Hủy payment và order liên quan (xử lý trong `PaymentConsumer`)

### Cronjobs
- `RemoveRefreshTokenCronjob` (1:00 AM mỗi ngày): Xóa refresh token hết hạn, ghi log số lượng xóa

### Shared/Infrastructure nổi bật
- Decorators: `@ActiveUser`, `@ActiveRolePermissions`, `@IsPublic`, `@Auth(['PaymentAPIKey'])`, `@ResponseMessage`
- Guards: `AccessTokenGuard`, `ThrottlerBehindProxyGuard`
- Interceptors: `TransformInterceptor`, `ZodSerializerInterceptor`
- Filters: `HttpExceptionFilter`, `CatchEverythingFilter`
- Config/env: `src/shared/config` (kết nối Redis, Google redirect, ...)
- Prisma: `PrismaService` cho truy cập DB

---

### Ghi chú triển khai
- Tất cả DTO sử dụng Zod để chuẩn hóa validate input và serialize output.
- Một số GET công khai được gắn `@IsPublic()` và cho phép bỏ qua throttle với `` khi cần.
- Các endpoint ghi nhận `createdById`, `updatedById`, `deletedById` để truy vết.
- I18n cho phép truyền `?lang=` hoặc header `Accept-Language` để lấy nội dung bản dịch tương ứng.
