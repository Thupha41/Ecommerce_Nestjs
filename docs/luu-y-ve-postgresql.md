# Cài đặt và sử dụng Postgresql

## 1. Cài đặt Postgresl

[Khuyến khích xem video youtube giới thiệu cơ bản về postgresql](https://youtu.be/OUlLQK_gN8k)

- Windows thì cài thông qua EDB
- Mac thì dùng postgresapp

Để mà dùng ổn thì cần cài đặt 2 phần

- Postgresql: DB của chúng ta, nó sẽ kèm theo 1 terminal gọi là **psql**
- Graphical tool: UI quản lý, có thể là pgadmin hoặc dbbeaver

Sau khi cài đặt thì bạn sẽ được cung cấp các trường sau:

- host: localhost
- port: 5432
- username: (windows thì thường là `postgres`)
- password: (Ở windows thì mặc định là password mà bạn đã tạo khi cài đặt)
- database: (thường là `postgres` trên windows)

URL để kết nối đến database: `postgresql://username:password@host:port/database`

### Một số lưu ý về Postgresql

- Postgresql sẽ có nhiều database trong đó và nhiều user, mỗi user sẽ có quyền truy cập vào các database khác nhau

- Khi cài đặt postgresql thì mặc định bạn sẽ có 1 user là `postgres` và 1 database là `postgres` và `template1`. Riêng với Mac khi cài postgresapp thì sẽ có thêm 1 user là `your-username` và 1 database là `your-username`

- Quyền `superuser` là toàn quyền truy cập vào mọi database

- Khi cài đặt xong, bạn sẽ thấy 1 terminal gọi là `psql`, bạn có thể sử dụng nó để thao tác với database

- Postgresql thường sẽ tự khởi động ở chế độ nền khi bạn mở máy tính

- Sau khi truy cập vào `psql`, bạn sẽ thấy terminal có dạng `postgres=#` thì `postgres` là tên database mà bạn đang truy cập

- Muốn biết bạn đang dùng user nào để truy cập vào database thì gõ lệnh `\conninfo` hoặc `SELECT current_user;`

### Vài câu lệnh trong `psql`

- Hiển thị tất cả database: `\l`
- Hiển thị tất cả user: `\du`
- Hiển thị tất cả bảng trong database: `\dt`
- Hiển thị cấu trúc của 1 bảng: `\d table-name`
- Thoát khỏi `psql`: `\q`
