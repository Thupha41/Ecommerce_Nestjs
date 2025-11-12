# Tổng quan dự án Ecommerce NestJS

## 📋 Giới thiệu

Dự án Ecommerce NestJS là một hệ thống thương mại điện tử đầy đủ được xây dựng trên nền tảng **NestJS** framework. Hệ thống cung cấp các chức năng quản lý sản phẩm, đơn hàng, thanh toán, xác thực người dùng và nhiều tính năng khác để hỗ trợ hoạt động kinh doanh trực tuyến.

## 🎯 Key Features

### 1. **Xác thực & Phân quyền (Authentication & Authorization)**
- Đăng ký, đăng nhập với email/password
- Xác thực 2FA (Two-Factor Authentication) bằng TOTP hoặc OTP email
- JWT Authentication với Access Token và Refresh Token
- Quản lý device và session đăng nhập
- Đăng nhập bằng Google OAuth
- Quên mật khẩu với OTP email
- Hệ thống phân quyền dựa trên Role-Based Access Control (RBAC)
- Quản lý permissions chi tiết cho từng endpoint

### 2. **Quản lý Người dùng (User Management)**
- Quản lý thông tin người dùng
- Quản lý hồ sơ cá nhân (Profile)
- Quản lý địa chỉ giao hàng (Delivery Info)
- Đa ngôn ngữ cho thông tin người dùng

### 3. **Quản lý Sản phẩm (Product Management)**
- Quản lý sản phẩm với thông tin chi tiết
- Quản lý SKU (Stock Keeping Unit) và variants
- Quản lý thương hiệu (Brand)
- Quản lý danh mục (Category) với cấu trúc phân cấp
- Đa ngôn ngữ cho sản phẩm, thương hiệu, danh mục
- Upload và quản lý hình ảnh sản phẩm (AWS S3)
- Tìm kiếm và lọc sản phẩm nâng cao
- Quản lý giá (basePrice, virtualPrice)

### 4. **Giỏ hàng & Đơn hàng (Cart & Order)**
- Quản lý giỏ hàng (Cart)
- Checkout và tính toán giá
- Quản lý đơn hàng (Order)
- Lưu snapshot sản phẩm khi đặt hàng
- Theo dõi trạng thái đơn hàng
- Hủy đơn hàng

### 5. **Thanh toán (Payment)**
- Tích hợp hệ thống thanh toán
- Webhook xử lý thanh toán
- Queue processing cho payment (BullMQ)

### 6. **Khuyến mãi (Discount)**
- Quản lý mã giảm giá
- Nhiều loại discount (percentage, fixed amount)
- Áp dụng discount theo sản phẩm, danh mục
- Quản lý thời gian hiệu lực
- Đa ngôn ngữ cho thông tin discount

### 7. **Đánh giá & Tương tác (Review & Like)**
- Đánh giá sản phẩm
- Like sản phẩm
- Quản lý reviews

### 8. **Tin nhắn (Messaging)**
- Real-time messaging qua WebSocket
- Chat namespace với Socket.io

### 9. **Đa ngôn ngữ (i18n)**
- Hỗ trợ đa ngôn ngữ cho toàn bộ hệ thống
- Quản lý ngôn ngữ (Language)
- Bản dịch cho sản phẩm, danh mục, thương hiệu, discount
- Tự động phát hiện ngôn ngữ từ query parameter hoặc header

### 10. **Bảo mật & Bảo vệ**
- Rate limiting với Throttler
- Helmet cho security headers
- Validation dữ liệu với Zod
- Xử lý lỗi tập trung
- Logging với Pino
- Soft delete cho dữ liệu quan trọng
- Audit trail (ghi nhận createdBy, updatedBy, deletedBy)

## 🛠️ Công nghệ sử dụng

### **Backend Framework**
- **NestJS** (v11.x) - Progressive Node.js framework
- **TypeScript** - Ngôn ngữ lập trình chính
- **Node.js** - Runtime environment

### **Database**
- **PostgreSQL** - Database chính
- **Prisma ORM** (v6.x) - Object-Relational Mapping
- **Prisma Migrate** - Database migrations

### **Cache & Queue**
- **Redis** - Caching và message broker
- **BullMQ** (v5.x) - Queue management cho background jobs
- **Keyv** - Key-value store abstraction
- **CacheableMemory** - In-memory cache với LRU

### **Authentication & Security**
- **JWT** (@nestjs/jwt) - JSON Web Tokens
- **bcrypt** - Password hashing
- **OTPAuth** - Two-Factor Authentication (TOTP)
- **Helmet** - Security headers
- **@nestjs/throttler** - Rate limiting

### **Validation & Serialization**
- **Zod** (v3.x) - Schema validation
- **nestjs-zod** - Zod integration với NestJS
- **class-validator** - Class-based validation

### **File Storage**
- **AWS S3** (@aws-sdk/client-s3) - Cloud storage cho images và files
- **Multer** - File upload handling

### **Real-time Communication**
- **Socket.io** (@nestjs/platform-socket.io) - WebSocket communication
- **@socket.io/redis-adapter** - Redis adapter cho Socket.io scaling

### **Email Service**
- **Nodemailer** - Email sending
- **SMTP** - Email protocol

### **Internationalization**
- **nestjs-i18n** - Internationalization support
- Query parameter và Accept-Language header support

### **Logging & Monitoring**
- **Pino** (nestjs-pino) - Fast logger
- File logging với rotation
- Request/response logging

### **Task Scheduling**
- **@nestjs/schedule** - Cron jobs
- Scheduled tasks (ví dụ: cleanup refresh tokens)

### **API Documentation**
- **Swagger** (@nestjs/swagger) - API documentation

### **Development Tools**
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework
- **TypeScript** - Type safety

### **Other Libraries**
- **date-fns** - Date manipulation
- **uuid** - Unique ID generation
- **googleapis** - Google OAuth integration
- **ms** - Time format conversion

## 🏗️ Kiến trúc hệ thống

### **Kiến trúc Module**
Hệ thống được tổ chức theo kiến trúc module của NestJS:
- Mỗi module đại diện cho một domain (Auth, Product, Order, etc.)
- Shared module chứa các service và utility dùng chung
- Repository pattern để tách biệt data access layer

### **Layers**
1. **Controller Layer** - Xử lý HTTP requests
2. **Service Layer** - Business logic
3. **Repository Layer** - Data access
4. **Model Layer** - Data models và schemas

### **Global Features**
- **Custom Validation Pipe** - Zod-based validation
- **Transform Interceptor** - Chuẩn hóa response format
- **Exception Filters** - Xử lý lỗi tập trung
- **Serialization Interceptor** - Serialize response dựa trên Zod schema

## 📦 Các Module chính

### **Core Modules**
- `AuthModule` - Xác thực và phân quyền
- `UserModule` - Quản lý người dùng
- `ProfileModule` - Quản lý hồ sơ cá nhân
- `RoleModule` - Quản lý vai trò
- `PermissionModule` - Quản lý quyền truy cập

### **E-commerce Modules**
- `ProductModule` - Quản lý sản phẩm
- `CategoryModule` - Quản lý danh mục
- `BrandModule` - Quản lý thương hiệu
- `CartModule` - Quản lý giỏ hàng
- `OrderModule` - Quản lý đơn hàng
- `PaymentModule` - Xử lý thanh toán
- `DiscountModule` - Quản lý khuyến mãi
- `ReviewModule` - Quản lý đánh giá
- `LikeModule` - Quản lý lượt thích

### **Support Modules**
- `LanguageModule` - Quản lý ngôn ngữ
- `DeliveryInfoModule` - Quản lý địa chỉ giao hàng
- `MessageModule` - Quản lý tin nhắn
- `WebSocketModule` - WebSocket communication

### **Translation Modules**
- `ProductTranslationModule` - Bản dịch sản phẩm
- `CategoryTranslationModule` - Bản dịch danh mục
- `BrandTranslationModule` - Bản dịch thương hiệu
- `DiscountTranslationModule` - Bản dịch khuyến mãi

## 🔧 Cấu hình môi trường

### **Environment Variables**
- Database configuration (PostgreSQL)
- JWT secrets và expiration
- Redis configuration
- AWS S3 credentials
- SMTP email configuration
- Google OAuth credentials
- Payment API key
- Application URLs

### **Database Schema**
- User management (User, Role, Permission)
- Product management (Product, SKU, Category, Brand)
- Order management (Order, CartItem, ProductSKUSnapshot)
- Authentication (Device, RefreshToken, VerificationCode)
- Multi-language support (Language, Translations)
- Payment và Discount

## 🚀 Tính năng nổi bật

1. **Device Management** - Theo dõi và quản lý thiết bị đăng nhập, tự động cập nhật lastActive thay vì tạo device mới
2. **Soft Delete** - Xóa mềm dữ liệu quan trọng với audit trail
3. **Multi-language** - Hỗ trợ đa ngôn ngữ toàn diện
4. **Real-time Updates** - WebSocket cho chat và payment updates
5. **Queue Processing** - Background jobs với BullMQ
6. **Caching Strategy** - Multi-layer caching (Memory + Redis)
7. **Comprehensive Validation** - Zod schemas cho type-safe validation
8. **Security First** - Rate limiting, helmet, JWT, 2FA
9. **Audit Trail** - Ghi nhận người tạo/cập nhật/xóa cho mọi thao tác
10. **Scalable Architecture** - Module-based, repository pattern, dependency injection

## 📝 Scripts có sẵn

```bash
# Development
npm run start:dev      # Chạy development mode với watch
npm run start:debug    # Chạy debug mode

# Production
npm run build          # Build ứng dụng
npm run start:prod     # Chạy production mode

# Database
npm run migrate:dev    # Chạy Prisma migrations
npm run create-migrate # Tạo migration mới

# Seed data
npm run init-seed-data # Khởi tạo dữ liệu seed
npm run create-permissions # Tạo permissions
npm run create-brands  # Tạo brands
npm run create-products # Tạo products

# Testing
npm run test           # Chạy unit tests
npm run test:e2e       # Chạy e2e tests
npm run test:cov       # Test coverage

# Code quality
npm run lint           # Lint code
npm run format         # Format code với Prettier
```

## 📚 Tài liệu tham khảo

- [FEATURES.md](./FEATURES.md) - Chi tiết các endpoint và tính năng
- [deploy.md](./deploy.md) - Hướng dẫn deploy với Docker
- [docs/](./docs/) - Tài liệu chi tiết khác

## 🔐 Bảo mật

- JWT tokens với expiration
- Password hashing với bcrypt
- 2FA support (TOTP và OTP email)
- Rate limiting
- Security headers (Helmet)
- Input validation với Zod
- SQL injection protection (Prisma)
- XSS protection
- CORS configuration

## 📊 Performance

- Redis caching cho các query thường xuyên
- Database indexing
- Connection pooling
- Background job processing
- Efficient pagination
- Lazy loading relationships

## 🌐 Deployment

Hệ thống hỗ trợ deployment với:
- Docker & Docker Compose
- Environment-based configuration
- Database migrations
- Health checks
- Logging và monitoring

---

**Version**: 0.0.1  
**Framework**: NestJS 11.x  
**Database**: PostgreSQL  
**License**: UNLICENSED









