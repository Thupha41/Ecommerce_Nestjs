# Repository Pattern

Repository Pattern là một mẫu thiết kế (design pattern) giúp tách biệt logic truy vấn dữ liệu khỏi logic nghiệp vụ của ứng dụng.

Repository hoạt động như một **lớp trung gian** giữa ứng dụng và database, giúp quản lý và truy xuất dữ liệu một cách có tổ chức, dễ bảo trì hơn.

## **Cấu trúc Repository Pattern**

Một Repository thường bao gồm:

1. **Entity (Model)**: Đại diện cho bảng trong database (ví dụ: `User`, `Post`...).
2. **Repository**: Cài đặt logic truy vấn dữ liệu (sử dụng ORM như Prisma, TypeORM, Sequelize...).
3. **Service Layer**: Gọi Repository để thực hiện các thao tác với database mà không phụ thuộc vào ORM cụ thể.

Có thể có nhiều biến thể của Repository Pattern, chia nhỏ các thành phần ra hơn nữa như `Repository Interface`, `Repository Implementation`,... nhưng cơ bản thì cấu trúc sẽ như trên. Tùy thuộc vào style code của team cũng như quy mô dự án.

> Đừng tìm cái tốt nhất, hãy tìm cái phù hợp nhất.

## **Công dụng của Repository Pattern**

### **1. Giảm sự phụ thuộc vào ORM cụ thể**

- Nếu không dùng Repository, service của bạn sẽ trực tiếp gọi Prisma hoặc TypeORM.
- Khi muốn thay đổi ORM (ví dụ từ Prisma sang TypeORM), bạn phải sửa lại toàn bộ code trong service.
- Với Repository Pattern, bạn chỉ cần sửa Repository mà không ảnh hưởng đến service.

### **2. Dễ kiểm thử (Unit Test)**

- Do service không phụ thuộc trực tiếp vào ORM, bạn có thể **mock** Repository để kiểm thử logic mà không cần kết nối database.

### **3. Tăng tính tổ chức, dễ mở rộng**

- Thay vì để truy vấn SQL rải rác trong service, Repository giúp gom nhóm logic liên quan đến dữ liệu tại một nơi duy nhất.
- Code trở nên dễ đọc, dễ bảo trì hơn.

### **4. Tuân theo nguyên tắc SOLID (đặc biệt là DIP)**

- **Dependency Inversion Principle (DIP)**: Service không phụ thuộc trực tiếp vào ORM mà chỉ làm việc với Repository Interface, giúp giảm coupling.

---
