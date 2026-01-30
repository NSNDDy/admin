# Quy Trình Chuẩn Hóa API & Tối Ưu Tích Hợp (API Standardization Design)

Tài liệu này đề xuất quy trình làm việc và cấu trúc code thống nhất giữa Frontend (FE) và Backend (BE) để giảm thiểu lỗi tích hợp, tránh sai sót thủ công (như sai tên biến, sai header) và tăng tốc độ phát triển.

---

## 1. Nguyên Tắc Cốt Lõi (Core Principles)

1.  **Contract First**: Định nghĩa Interface (Input/Output) trước khi code.
2.  **Centralized Configuration**: Cấu hình API (URL, Header, Interceptor) tập trung tại một nơi duy nhất.
3.  **Standardized Response**: Thống nhất cấu trúc trả về cho toàn bộ hệ thống.
4.  **Automated Type Safety**: Sử dụng Typescript (nếu có thể) hoặc JSDoc để gợi ý code.

---

## 2. Thiết Kế Backend (Java Spring Boot)

Backend cần tuân thủ nghiêm ngặt các chuẩn sau để FE dễ tích hợp.

### 2.1. Chuẩn Hóa Response (Wrapper Class)
Không trả về `List` hoặc `Object` trần trụi. Tất cả API phải trả về cùng một cấu trúc:

```java
// ApiResponse.java
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private int errorCode; // 0: Success, !=0: Error specific code
}
```

### 2.2. Chuẩn Hóa Exception Handling (Global Exception Handler)
Không để lỗi 500 xấu xí lọt ra ngoài. Dùng `@ControllerAdvice` để bắt lỗi và trả về JSON chuẩn.

```json
// Lỗi 401
{
    "success": false,
    "message": "Phiên đăng nhập hết hạn",
    "errorCode": 40101,
    "data": null
}
```

### 2.3. Quy Tắc Đặt Tên (Naming Convention)
*   **URL**: Kebab-case, danh từ số nhiều. VD: `/api/chat-histories` (thay vì `/api/history`).
*   **Params**: CamelCase. VD: `roomId` (tuyệt đối không dùng `rommId` hay `room_id`).
*   **Header**: Sử dụng chuẩn HTTP.
    *   **Authorization**: `Bearer <token>` (Thay vì custom header `accessToken`).

---

## 3. Thiết Kế Frontend (Nuxt.js / Vue.js)

FE cần tổ chức code để "giấu" sự phức tạp của việc gọi API đi. Developer khi làm tính năng không cần quan tâm đến URL hay Header nữa.

### 3.1. Cấu Trúc Thư Mục Mới
Tạo thư mục `services/` hoặc `repositories/` để quản lý API.

```
adminChat/
├── plugins/
│   └── axios.js          <-- Cấu hình Global (Interceptor, Token)
├── services/
│   ├── index.js          <-- Export các services
│   ├── auth.service.js   <-- API Login, Register
│   ├── chat.service.js   <-- API Chat, History
│   └── user.service.js   <-- API User Profile
└── pages/
    └── chat.vue          <-- Chỉ gọi hàm, không gọi axios trực tiếp
```

### 3.2. Cấu Hình Axios Global (`plugins/axios.js`)
Đây là nơi **DUY NHẤT** xử lý Token và Header.

```javascript
// plugins/axios.js
export default function ({ $axios, redirect }) {
  // 1. Tự động đính Token vào mọi Request
  $axios.onRequest(config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Chuẩn hóa Header theo Backend mới (Authorization)
      config.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Hoặc support legacy header nếu Backend chưa sửa kịp
      config.headers.common['accessToken'] = token; 
    }
  });

  // 2. Tự động xử lý lỗi (Response Interceptor)
  $axios.onError(error => {
    const code = parseInt(error.response && error.response.status);
    if (code === 401) {
      localStorage.removeItem('accessToken');
      redirect('/login');
    }
    return Promise.reject(error);
  });
}
```

### 3.3. Viết Service Wrapper (`services/chat.service.js`)
Định nghĩa hàm gọi API rõ ràng.

```javascript
// services/chat.service.js
export default ($axios) => ({
  // Lấy lịch sử chat
  getHistory(roomId, page = 0, size = 50) {
    return $axios.$get('/api/history', {
      params: { 
        rommId: roomId, // Xử lý mapping param sai chính tả tại đây 1 lần duy nhất
        page, 
        size 
      }
    });
  },

  // Gửi tin nhắn (nếu dùng API REST thay vì Socket)
  sendMessage(payload) {
    return $axios.$post('/api/chat/send', payload);
  }
});
```

### 3.4. Inject Service vào Nuxt (`plugins/services.js`)

```javascript
// plugins/services.js
import createChatService from '@/services/chat.service'

export default (ctx, inject) => {
  const services = {
    chat: createChatService(ctx.$axios),
    // auth: createAuthService(ctx.$axios)...
  }
  
  // Inject để dùng dạng this.$api.chat.getHistory()
  inject('api', services)
}
```

### 3.5. Sử Dụng Trong Component (`pages/chat.vue`)
Code trong Vue sẽ trở nên cực kỳ sạch sẽ.

```javascript
async fetchChatHistory() {
  try {
    // Không cần quan tâm URL là gì, Header ra sao, param tên gì
    const data = await this.$api.chat.getHistory(this.roomId);
    this.messages = data;
  } catch (e) {
    console.error(e);
  }
}
```

---

## 4. Quy Trình Làm Việc (Workflow)

Để tránh tình trạng "Backend sửa param, Frontend chết đứng", hai bên cần làm theo quy trình:

1.  **Bước 1 (Design)**: BE và FE họp 5 phút, thống nhất file Swagger/OpenAPI hoặc file Excel mô tả Input/Output.
    *   *Ví dụ*: Thống nhất tên param là `roomId` (sửa lại lỗi `rommId`).
2.  **Bước 2 (Mock)**: FE tạo file `services/chat.service.js` và trả về dữ liệu giả (Mock Data) để code giao diện trước.
3.  **Bước 3 (Implement)**: BE code API thật.
4.  **Bước 4 (Integrate)**: FE chỉ cần xóa dòng Mock Data trong Service và thay bằng `$axios.get(...)`.

## 5. Lợi Ích
*   **Giảm lỗi**: Sai chính tả param chỉ cần sửa ở 1 file `service.js`.
*   **Bảo trì**: Backend đổi URL từ `/api/history` sang `/api/v2/chat-history` -> FE chỉ sửa 1 dòng code.
*   **Tốc độ**: FE không cần copy-paste đoạn code `headers: { accessToken... }` ở 100 nơi khác nhau.
