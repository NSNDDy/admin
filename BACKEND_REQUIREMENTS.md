# Đặc Tả Yêu Cầu Backend (Java) - Chat Realtime Application

Tài liệu này mô tả chi tiết các API và sự kiện Socket.IO cần thiết để Backend Java triển khai, đảm bảo tương thích hoàn toàn với Frontend Nuxt.js.

## 1. Authentication & User Management (REST API)

**Base URL**: `http://localhost:8080` (hoặc cấu hình qua Proxy)

### 1.1 Đăng Nhập
*   **Endpoint**: `POST /api/auth/login`
*   **Content-Type**: `application/json`
*   **Request Body**:
    ```json
    {
      "username": "user123",
      "password": "password123"
    }
    ```
*   **Response (Success - 200)**:
    ```json
    {
      "success": true,
      "message": "Login successful",
      "data": {
        "accessToken": "eyJhbGciOiJIUzI1Ni...", // JWT Token
        "user": {
          "id": 1,
          "username": "user123",
          "avatar": "https://..."
        }
      }
    }
    ```
*   **Response (Error - 401)**:
    ```json
    {
      "success": false,
      "message": "Invalid username or password"
    }
    ```

### 1.2 Đăng Ký
*   **Endpoint**: `POST /api/auth/register`
*   **Request Body**:
    ```json
    {
      "username": "user123",
      "password": "password123",
      "email": "user@example.com"
    }
    ```

### 1.3 Lấy Thông Tin User (Optional - Verify Token)
*   **Endpoint**: `GET /api/auth/me`
*   **Headers**: `Authorization: Bearer <accessToken>`
*   **Response**: Trả về thông tin user hiện tại.

---

## 2. Realtime Chat (Socket.IO)

**Server Port**: `3001` (hoặc tích hợp chung port 8080)
**Path**: `/socket.io/`

### 2.1 Kết Nối & Xác Thực
Frontend sẽ gửi Token khi khởi tạo kết nối. Backend cần xác thực Token này.

*   **Handshake Query/Auth**:
    ```json
    {
      "auth": {
        "token": "Bearer <accessToken>"
      }
    }
    ```
*   **Yêu cầu Backend**:
    *   Chặn kết nối nếu Token không hợp lệ.
    *   Lưu mapping `socket.id` <-> `user_id`.

### 2.2 Các Events (Client -> Server)

#### a. `join_room`
User tham gia vào một phòng chat cụ thể.
*   **Payload**:
    ```json
    {
      "roomId": "general"
    }
    ```

#### b. `send_message`
User gửi tin nhắn lên server.
*   **Payload**:
    ```json
    {
      "roomId": "general",
      "content": "Hello everyone!",
      "type": "TEXT" // TEXT, IMAGE, FILE
    }
    ```

### 2.3 Các Events (Server -> Client)

#### a. `receive_message`
Server gửi tin nhắn mới cho tất cả users trong phòng (bao gồm cả người gửi để confirm).
*   **Payload**:
    ```json
    {
      "id": "msg_001",
      "roomId": "general",
      "sender": {
        "id": 1,
        "username": "user123",
        "avatar": "..."
      },
      "content": "Hello everyone!",
      "timestamp": "2023-10-27T10:00:00Z"
    }
    ```

#### b. `user_joined` / `user_left` (Optional)
Thông báo có người vào/ra phòng.

#### c. `error`
Thông báo lỗi từ server (ví dụ: không có quyền chat).
*   **Payload**:
    ```json
    {
      "code": "FORBIDDEN",
      "message": "You are not allowed to chat in this room."
    }
    ```

---

## 3. Database Schema (Gợi ý)

### Users Table
*   `id`: Long (PK)
*   `username`: String (Unique)
*   `password_hash`: String
*   `email`: String

### Messages Table
*   `id`: Long (PK)
*   `room_id`: String (Index)
*   `sender_id`: Long (FK -> Users)
*   `content`: Text
*   `created_at`: Timestamp
