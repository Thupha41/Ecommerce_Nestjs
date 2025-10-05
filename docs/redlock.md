# Redlock

Redlock là một **thuật toán distributed lock** dùng Redis, giúp đảm bảo **chỉ một tiến trình (hoặc request)** được quyền thao tác với tài nguyên (ví dụ: SKU) tại một thời điểm, kể cả khi bạn chạy nhiều instance app hoặc nhiều server.

---

## **Cách hoạt động của Redlock trong logic đặt hàng**

### 1. **Acquire lock (xin khóa)**

- Khi một request muốn đặt hàng, nó sẽ gọi `redlock.acquire(['lock:sku:123'], 3000)` để xin quyền thao tác với SKU 123.
- Nếu **chưa có ai giữ lock này**, Redis sẽ cấp lock cho request đó trong 3 giây (hoặc thời gian bạn cấu hình).
- Nếu **đã có request khác giữ lock**, Redlock sẽ tự động retry (theo cấu hình), nếu vẫn không acquire được thì throw lỗi.

### 2. **Thao tác an toàn**

- Khi đã acquire lock thành công, chỉ request này mới được phép kiểm tra và trừ tồn kho SKU đó.
- Các request khác muốn thao tác cùng SKU sẽ phải **chờ** hoặc **bị từ chối** (nếu hết retry).

### 3. **Giải phóng lock**

- Sau khi thao tác xong (dù thành công hay lỗi), request phải gọi `lock.release()` để trả lại lock cho Redis.
- Nếu không release, lock sẽ tự động hết hạn sau thời gian đã cấu hình (ví dụ 3 giây).

### 4. **Đảm bảo an toàn phân tán**

- Redlock có thể làm việc với nhiều Redis node (cluster), đảm bảo tính nhất quán và an toàn khi một số node bị lỗi.
- Trong thực tế, chỉ cần 1 Redis node là đã hoạt động tốt cho use case phổ biến.

---

## **Tóm tắt quy trình trong đặt hàng**

1. **Acquire lock** theo SKU trên Redis.
2. **Kiểm tra và trừ tồn kho** trong DB (chỉ request giữ lock mới được thao tác).
3. **Release lock** sau khi xong.
4. Nếu không acquire được lock, request khác sẽ phải retry hoặc báo lỗi.

---

**Lợi ích:**

- Đảm bảo không có 2 request nào cùng lúc trừ tồn kho 1 SKU.
- An toàn khi chạy nhiều instance app.
- Không phụ thuộc vào transaction của database.

---

**Kết luận:**  
Redlock giúp bạn kiểm soát truy cập đồng thời vào tài nguyên nhạy cảm (SKU) ở tầng ứng dụng, tránh oversell, race condition, và phù hợp cho hệ thống phân tán.

## **Cách xử lý khi không acquire được lock**

Khi một request đã **acquire lock** thành công trên Redis cho một SKU (ví dụ `lock:sku:123`), các request khác muốn thao tác cùng SKU sẽ:

1. **Thử acquire lock:**
   - Gửi yêu cầu acquire lock lên Redis.
2. **Nếu lock đang bị giữ:**
   - Redlock sẽ **không cấp lock ngay** mà sẽ **chờ một khoảng thời gian (`retryDelay`) rồi thử lại**.
   - Quá trình này lặp lại tối đa `retryCount` lần.
3. **Nếu hết số lần retry mà vẫn chưa acquire được lock:**
   - Redlock sẽ **throw lỗi** (ví dụ: `LockError`).
   - Request đó sẽ **không được thực hiện logic đặt hàng** cho SKU này.
4. **Nếu acquire lock thành công ở lần retry nào đó:**
   - Request đó sẽ tiếp tục thực hiện logic kiểm tra và trừ tồn kho như bình thường.

**Tóm lại:**  
Các request khác sẽ **chờ bằng cách retry nhiều lần với khoảng delay giữa các lần thử**. Nếu vẫn không acquire được lock, request sẽ bị lỗi và không thao tác với SKU đó. Không có request nào bị block hoặc treo connection, chỉ là retry rồi trả lỗi nếu không thành công.

## **Cấu hình retryCount và retryDelay trong Redlock**

**Giá trị hợp lý cho `retryCount` và `retryDelay` khi dùng Redlock phụ thuộc vào mức độ cạnh tranh và trải nghiệm người dùng mong muốn.**  
Thông thường:

- `retryCount`: **3–5**  
  (Nghĩa là thử lại 3–5 lần nếu chưa acquire được lock)

- `retryDelay`: **100–300 ms**  
  (Thời gian chờ giữa các lần thử lại)

---

### **Khuyến nghị thực tế:**

- **retryCount: 3**
- **retryDelay: 200 ms**

Tổng thời gian tối đa chờ lock: `3 x 200ms = 600ms` (dưới 1 giây, phù hợp với trải nghiệm realtime).

---

**Nếu hệ thống có nhiều xung đột hoặc thao tác đặt hàng phức tạp, có thể tăng lên:**

- `retryCount: 5`
- `retryDelay: 300 ms`  
  (Tổng tối đa: 1.5 giây)

---

**Tóm lại:**

- Đa số dự án: `retryCount: 3`, `retryDelay: 200`
- Nếu cần chờ lâu hơn: `retryCount: 5`, `retryDelay: 300`

Bạn nên thử nghiệm thực tế để chọn giá trị phù hợp nhất với hệ thống của mình!
