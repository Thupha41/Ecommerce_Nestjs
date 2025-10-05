# SharedRoleRepository

## Mục đích

`SharedRoleRepository` là một lớp repository dùng chung trong ứng dụng, chuyên biệt hóa để truy xuất và quản lý thông tin về các vai trò (roles) trong hệ thống. Repository này được thiết kế để cung cấp một cách tiếp cận đơn giản và hiệu quả để lấy thông tin về các vai trò quan trọng như Client và Admin, đồng thời sử dụng cơ chế cache đơn giản để tối ưu hiệu suất.

## Các thành phần chính

### Thuộc tính

1. **clientRoleId**

   - Kiểu dữ liệu: `number | null`
   - Mục đích: Lưu trữ ID của vai trò Client trong bộ nhớ để tránh truy vấn lặp lại
   - Giá trị ban đầu: `null` (chưa được truy vấn)

2. **adminRoleId**
   - Kiểu dữ liệu: `number | null`
   - Mục đích: Lưu trữ ID của vai trò Admin trong bộ nhớ để tránh truy vấn lặp lại
   - Giá trị ban đầu: `null` (chưa được truy vấn)

### Phương thức

1. **getRole (private)**

   - **Tham số**: `roleName` - tên vai trò cần tìm
   - **Chức năng**: Tìm kiếm thông tin vai trò theo tên
   - **Đặc điểm**:
     - Sử dụng raw SQL query thông qua Prisma để tìm kiếm chính xác
     - Chỉ lấy vai trò chưa bị xóa (`deletedAt IS NULL`)
     - Giới hạn kết quả trả về là 1 bản ghi (`LIMIT 1`)
   - **Xử lý lỗi**: Ném ra lỗi nếu không tìm thấy vai trò
   - **Kết quả trả về**: `RoleType` - thông tin đầy đủ của vai trò

2. **getClientRoleId**

   - **Chức năng**: Lấy ID của vai trò Client
   - **Đặc điểm**:
     - Kiểm tra cache trước (`this.clientRoleId`)
     - Nếu chưa có trong cache, gọi `getRole` để truy vấn từ database
     - Lưu kết quả vào cache để sử dụng cho lần sau
   - **Kết quả trả về**: `Promise<number>` - ID của vai trò Client

3. **getAdminRoleId**
   - **Chức năng**: Lấy ID của vai trò Admin
   - **Đặc điểm**:
     - Kiểm tra cache trước (`this.adminRoleId`)
     - Nếu chưa có trong cache, gọi `getRole` để truy vấn từ database
     - Lưu kết quả vào cache để sử dụng cho lần sau
   - **Kết quả trả về**: `Promise<number>` - ID của vai trò Admin

## Cách sử dụng

Repository này thường được inject vào các service cần xác định vai trò người dùng:

```typescript
@Injectable()
export class AuthService {
  constructor(private readonly sharedRoleRepository: SharedRoleRepository) {}

  async registerNewClient(userData: RegisterDto) {
    const clientRoleId = await this.sharedRoleRepository.getClientRoleId()
    // Tạo người dùng mới với vai trò Client
    return this.userRepository.create({
      ...userData,
      roleId: clientRoleId,
    })
  }
}
```

## Lưu ý quan trọng

1. Có cơ chế cache đơn giản trong bộ nhớ để tránh truy vấn lặp lại
2. Repository này chỉ cung cấp phương thức đọc (read-only), không có các phương thức tạo, cập nhật hay xóa vai trò
