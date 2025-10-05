# Giải thích về InitialScript

Tài liệu này giải thích chi tiết về các file trong thư mục `initialScript` của dự án, cách hoạt động và cách cài đặt để chạy được các script này.

## Cấu trúc thư mục

Thư mục `initialScript` bao gồm hai file chính:

- `index.ts`: Script khởi tạo dữ liệu ban đầu cho hệ thống (roles và admin user)
- `create-permissions.ts`: Script quản lý và cập nhật permissions trong hệ thống

## 1. File index.ts

### Chức năng

File `index.ts` có nhiệm vụ khởi tạo dữ liệu ban đầu cho hệ thống, bao gồm:

- Tạo các roles mặc định (Admin, Client, Seller)
- Tạo tài khoản admin mặc định với thông tin từ biến môi trường

### Cách hoạt động

1. Kiểm tra xem đã có roles trong hệ thống chưa. Nếu có, script sẽ dừng lại và báo lỗi
2. Tạo 3 roles mặc định: Admin, Client và Seller
3. Tìm role Admin để gán cho tài khoản admin
4. Tạo tài khoản admin với thông tin từ biến môi trường:
   - Email: ADMIN_EMAIL
   - Mật khẩu: ADMIN_PASSWORD (được hash trước khi lưu)
   - Tên: ADMIN_NAME
   - Số điện thoại: ADMIN_PHONE_NUMBER
5. Trả về thông tin về số roles đã tạo và thông tin tài khoản admin

### Kết quả

Sau khi chạy script này, hệ thống sẽ có:

- 3 roles cơ bản (Admin, Client, Seller)
- 1 tài khoản admin có quyền cao nhất

## 2. File create-permissions.ts

### Chức năng

File `create-permissions.ts` có nhiệm vụ:

- Quét tất cả các routes trong ứng dụng NestJS
- Tạo hoặc cập nhật permissions tương ứng trong database
- Xóa các permissions không còn tồn tại trong ứng dụng
- Phân quyền cho các roles (Admin, Seller, Client)

### Cách hoạt động

1. Khởi động ứng dụng NestJS để lấy thông tin về tất cả các routes
2. Lấy danh sách permissions hiện có trong database
3. Tạo các maps để dễ dàng so sánh giữa routes trong ứng dụng và permissions trong database
4. Tìm và xóa các permissions không còn tồn tại trong ứng dụng
5. Tìm và thêm các routes mới chưa có trong database
6. Cập nhật lại permissions cho các roles:
   - Admin: Có tất cả permissions
   - Seller: Chỉ có permissions thuộc các module được định nghĩa trong mảng `SellerModule`
   - Client: Chỉ có permissions thuộc các module được định nghĩa trong mảng `ClientModule`

### Phân quyền theo module

Script này phân quyền dựa trên module:

- **Seller** có quyền truy cập các module: AUTH, MEDIA, MANAGE-PRODUCT, PRODUCT-TRANSLATION, PROFILE, CART, ORDERS, REVIEWS
- **Client** có quyền truy cập các module: AUTH, MEDIA, PROFILE, CART, ORDERS, REVIEWS
- **Admin** có quyền truy cập tất cả các module

## Cài đặt và chạy script

### Yêu cầu cài đặt

Để chạy được các script này, bạn cần cài đặt gói `tsconfig-paths`:

```bash
npm install --save-dev tsconfig-paths
```

### Cấu hình tsconfig.json

Bạn cần thêm cấu hình sau vào file `tsconfig.json` để script có thể sử dụng các đường dẫn tương đối từ thư mục gốc:

```json
"ts-node": {
  "require": ["tsconfig-paths/register"]
}
```

### Cách chạy script

Để chạy script khởi tạo dữ liệu ban đầu:

```bash
npx ts-node -r tsconfig-paths/register initialScript/index.ts
```

Để chạy script cập nhật permissions:

```bash
npx ts-node -r tsconfig-paths/register initialScript/create-permissions.ts
```

## Lưu ý quan trọng

1. Script `index.ts` chỉ nên chạy một lần khi khởi tạo dự án. Nếu chạy lại, script sẽ báo lỗi vì roles đã tồn tại.

2. Script `create-permissions.ts` có thể chạy nhiều lần để cập nhật permissions khi có thay đổi về routes trong ứng dụng.

3. Các biến môi trường cần được cấu hình đầy đủ trước khi chạy script `index.ts`:

   - ADMIN_EMAIL
   - ADMIN_PASSWORD
   - ADMIN_NAME
   - ADMIN_PHONE_NUMBER

4. Khi thêm routes mới vào ứng dụng, bạn nên chạy lại script `create-permissions.ts` để cập nhật permissions.

5. Nếu muốn thêm module mới cho Seller hoặc Client, bạn cần cập nhật các mảng `SellerModule` hoặc `ClientModule` trong file `create-permissions.ts`.
