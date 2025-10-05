Khi chúng ta logout hoặc handle refresh token thì chúng ta sẽ xóa đi token cũ nhưng sẽ có trường hợp refresh token hết hạn rồi mà chúng ta không logout, không handle refresh token gì cả nhưng vẫn lưu vào database thì sẽ chiếm dụng bộ nhớ

Task scheduling cronjob sẽ giải quyết vấn đề này, ví dụ: vào 7h sáng mỗi ngày thì sẽ quét database xem refresh token nào hết hạn sẽ xóa
