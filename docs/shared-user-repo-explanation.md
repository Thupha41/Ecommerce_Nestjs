# SharedUserRepository

## Mục đích

`SharedUserRepository` là một lớp repository dùng chung trong ứng dụng, cung cấp các phương thức truy vấn cơ bản đến bảng `User` trong cơ sở dữ liệu thông qua Prisma ORM. Repository này được thiết kế để tái sử dụng trong nhiều module khác nhau, giúp tránh việc lặp lại code và đảm bảo tính nhất quán trong cách truy cập dữ liệu người dùng.

## Các thành phần chính

### Types

1. **UserIncludeRolePermissionsType**

   - Định nghĩa kiểu dữ liệu cho đối tượng User bao gồm thông tin về vai trò (role) và các quyền (permissions)
   - Kết hợp `UserType` với `RoleType` và mảng `PermissionType[]`
   - Được sử dụng để trả về dữ liệu đầy đủ về người dùng, vai trò và quyền

2. **WhereUniqueUserType**
   - Định nghĩa kiểu dữ liệu cho điều kiện tìm kiếm người dùng theo các trường unique
   - Có thể tìm theo `id` hoặc `email`
   - Được export để sử dụng ở các repository khác

### Phương thức

1. **findUnique**

   - **Tham số**: `where` - điều kiện tìm kiếm (id hoặc email)
   - **Chức năng**: Tìm kiếm một người dùng duy nhất theo id hoặc email
   - **Đặc điểm**: Chỉ trả về người dùng chưa bị xóa (`deletedAt: null`)
   - **Kết quả trả về**: `UserType | null` - thông tin người dùng hoặc null nếu không tìm thấy

2. **findUniqueIncludeRolePermissions**

   - **Tham số**: `where` - điều kiện tìm kiếm (id hoặc email)
   - **Chức năng**: Tìm kiếm người dùng kèm theo thông tin về vai trò và các quyền
   - **Đặc điểm**:
     - Sử dụng `include` để lấy thông tin về vai trò
     - Tiếp tục `include` để lấy thông tin về các quyền của vai trò đó
     - Chỉ lấy các quyền chưa bị xóa (`deletedAt: null`)
   - **Kết quả trả về**: `UserIncludeRolePermissionsType | null` - thông tin đầy đủ hoặc null

3. **update**
   - **Tham số**:
     - `where` - điều kiện xác định người dùng cần cập nhật (chỉ hỗ trợ id)
     - `data` - dữ liệu cần cập nhật
   - **Chức năng**: Cập nhật thông tin người dùng
   - **Đặc điểm**: Chỉ cập nhật người dùng chưa bị xóa (`deletedAt: null`)
   - **Kết quả trả về**: `UserType | null` - thông tin người dùng sau khi cập nhật

## Cách sử dụng

Repository này được thiết kế để inject vào các service cần truy cập dữ liệu người dùng:

```typescript
@Injectable()
export class SomeService {
  constructor(private readonly sharedUserRepository: SharedUserRepository) {}

  async getUserWithPermissions(userId: number) {
    return this.sharedUserRepository.findUniqueIncludeRolePermissions({ id: userId })
  }
}
```

## Lưu ý quan trọng

1. Repository này sử dụng `findFirst` thay vì `findUnique` để có thể thêm điều kiện `deletedAt: null`
2. Tất cả các phương thức đều tự động lọc ra các bản ghi đã bị xóa mềm (soft delete)
3. Repository này không thực hiện các thao tác tạo mới hoặc xóa người dùng, chỉ tập trung vào việc đọc và cập nhật
