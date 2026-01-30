# Thiết Kế Hệ Thống Lưu Trữ Lịch Sử Chat

Tài liệu này mô tả chi tiết thiết kế API Backend và quy trình xử lý Frontend để thực hiện tính năng lưu trữ và xem lại lịch sử tin nhắn.

---

## 1. Backend Design (Java Spring Boot)

### 1.1. Database Schema (MySQL)

Cần tạo một bảng `messages` để lưu trữ tin nhắn.

```sql
CREATE TABLE messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_id VARCHAR(50) NOT NULL,       -- Mã phòng (hoặc ID cuộc hội thoại)
    sender_id BIGINT NOT NULL,          -- ID người gửi
    sender_name VARCHAR(100),           -- Tên người gửi (cache để đỡ join)
    content TEXT NOT NULL,              -- Nội dung tin nhắn
    type VARCHAR(20) DEFAULT 'TEXT',    -- Loại: TEXT, IMAGE, FILE
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_room_created (room_id, created_at) -- Index để query nhanh theo phòng và thời gian
);
```

### 1.2. REST API Endpoints

Chúng ta cần thêm 1 API để lấy lịch sử chat.

#### **GET /api/chat/history**
*   **Mô tả**: Lấy danh sách tin nhắn cũ của một phòng.
*   **Query Params**:
    *   `roomId` (String, Required): Mã phòng chat.
    *   `page` (Int, Optional): Trang số mấy (mặc định 0).
    *   `size` (Int, Optional): Số lượng tin nhắn (mặc định 50).
*   **Response Success (200)**:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 105,
          "sender": {
            "id": 2,
            "username": "UserB"
          },
          "content": "Chào bạn, khỏe không?",
          "timestamp": 1706601234000,
          "type": "TEXT"
        },
        {
          "id": 104,
          "sender": {
            "id": 1,
            "username": "UserA"
          },
          "content": "Hello!",
          "timestamp": 1706601200000,
          "type": "TEXT"
        }
      ],
      "pagination": {
        "page": 0,
        "totalPages": 10
      }
    }
    ```

### 1.3. Socket.IO Logic Update

Backend cần sửa logic khi nhận sự kiện `send_message`.

*   **Logic Cũ**: Nhận -> Emit ngay cho mọi người trong phòng.
*   **Logic Mới**:
    1.  Nhận data từ Client.
    2.  **Lưu vào Database** (Insert vào bảng `messages`).
    3.  Nếu lưu thành công -> Emit sự kiện `receive_message` cho Room với đầy đủ thông tin (kèm ID tin nhắn vừa tạo).

---

## 2. Frontend Design (Nuxt.js)

### 2.1. Cập nhật `pages/chat.vue`

#### **State (Data)**
Thêm/Sửa các biến trong `data()`:
```javascript
data() {
  return {
    messages: [], // Danh sách tin nhắn hiển thị
    isLoadingHistory: false, // Trạng thái đang tải lịch sử
    page: 0, // Trang hiện tại để load more (nếu cần)
    // ... các biến cũ
  }
}
```

#### **Logic `joinRoom()`**
Khi người dùng tham gia phòng, ngoài việc `emit('join_room')`, cần gọi API lấy lịch sử.

```javascript
async joinRoom() {
    if (!this.username || !this.roomId) return;

    // 1. Kết nối Socket (giữ nguyên code cũ)
    // ...
    
    // 2. Gọi API lấy lịch sử tin nhắn
    await this.fetchChatHistory();
}
```

#### **Method `fetchChatHistory()`**
Hàm mới để gọi API Backend.

```javascript
async fetchChatHistory() {
    this.isLoadingHistory = true;
    try {
        const res = await this.$axios.$get('/api/chat/history', {
            params: {
                roomId: this.roomId,
                size: 50
            }
        });
        
        if (res.success) {
            // Backend trả về tin mới nhất trước -> Đảo ngược để hiển thị đúng thứ tự thời gian (Cũ trên - Mới dưới)
            this.messages = res.data.reverse(); 
            this.scrollToBottom();
        }
    } catch (error) {
        console.error("Lỗi tải lịch sử chat:", error);
    } finally {
        this.isLoadingHistory = false;
    }
}
```

#### **Logic `socket.on('receive_message')`**
Giữ nguyên logic này. Khi có tin nhắn mới (realtime), nó sẽ được push vào cuối mảng `messages`.

```javascript
this.socket.on('receive_message', (message) => {
    this.messages.push(message);
    this.scrollToBottom();
});
```

---

## 3. Tổng kết luồng dữ liệu (Data Flow)

1.  **User A vào phòng chat**:
    *   Frontend gọi `GET /api/chat/history?roomId=123`.
    *   Backend query DB -> Trả về 50 tin nhắn cũ.
    *   Frontend hiển thị 50 tin nhắn này.

2.  **User A nhắn tin mới**:
    *   Frontend gửi Socket `send_message`.
    *   Backend nhận -> **Lưu vào DB** -> Bắn Socket `receive_message` cho cả phòng.
    *   Frontend (của A và B) nhận Socket -> Push tin mới vào cuối danh sách.

3.  **User A thoát ra vào lại**:
    *   Quay lại bước 1 -> Lại tải được tin nhắn vừa nhắn lúc nãy.
