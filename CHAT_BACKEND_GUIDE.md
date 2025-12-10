# Hướng Dẫn Xây Dựng Backend Chat Realtime Bằng Java

## 📋 Mục Lục
1. [Kiến Trúc Hệ Thống](#kiến-trúc-hệ-thống)
2. [Frontend - Cấu Hình Socket.IO](#frontend---cấu-hình-socketio)
3. [Backend Java - Cài Đặt](#backend-java---cài-đặt)
4. [Chi Tiết Các Events](#chi-tiết-các-events)
5. [Ví Dụ Backend Hoàn Chỉnh](#ví-dụ-backend-hoàn-chỉnh)

---

## 🏗️ Kiến Trúc Hệ Thống

```
┌─────────────────────────────┐
│   Frontend (Nuxt.js)        │
│   - Socket.IO Client v4.5   │
│   - Gửi/Nhận tin nhắn       │
│   - Port: 3000              │
└────────────┬────────────────┘
             │ WebSocket/HTTP
             │ (Realtime)
             │
┌────────────▼────────────────┐
│   Backend (Java)            │
│   - Socket.IO Server        │
│   - Quản lý Rooms & Users   │
│   - Lưu trữ Messages        │
│   - Port: 3001              │
└────────────┬────────────────┘
             │
┌────────────▼────────────────┐
│   Database (Optional)       │
│   - MySQL/MongoDB           │
│   - Lưu chat history        │
└─────────────────────────────┘
```

---

## 🎨 Frontend - Cấu Hình Socket.IO

### 1. **Kết Nối Ban Đầu** (trong `pages/chat.vue`)
```javascript
this.socket = io('http://localhost:3001', {
    reconnection: true,           // Tự động reconnect
    reconnectionDelay: 1000,      // Chờ 1s trước khi reconnect
    reconnectionDelayMax: 5000,   // Chờ tối đa 5s
    reconnectionAttempts: 5       // Tối đa 5 lần thử
})
```

**Cần Backend phải:**
- Lắng nghe port 3001
- Có CORS enabled để cho phép kết nối từ `http://localhost:3000`

### 2. **Frontend Events (Emit - Gửi sang Backend)**

```javascript
// Event 1: Tham gia phòng chat
this.socket.emit('join-room', { 
    room: 'general',      // ID phòng chat
    username: 'User'      // Tên người dùng
})

// Event 2: Gửi tin nhắn
this.socket.emit('send-message', {
    room: 'general',
    username: 'User',
    text: 'Hello',
    time: new Date()
})
```

### 3. **Frontend Events (On - Nhận từ Backend)**

```javascript
// Event 1: Nhận tin nhắn mới
this.socket.on('message', (data) => {
    // data = { username, text, time }
    this.messages.push(data)
})

// Event 2: Tải tin nhắn cũ khi join room
this.socket.on('load-messages', (data) => {
    // data = [{ username, text, time }, ...]
    this.messages = data
})

// Event 3: Nhận thông báo
this.socket.on('notification', (data) => {
    // data = { message, type }
    console.log(data.message)
})
```

---

## ⚙️ Backend Java - Cài Đặt

### 1. **Cấu Hình Project (Maven - pom.xml)**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.chat</groupId>
    <artifactId>chat-server</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.7.0</version>
        <relativePath/>
    </parent>

    <dependencies>
        <!-- Spring Boot -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- Socket.IO Server -->
        <dependency>
            <groupId>com.corundumstudio.socketio</groupId>
            <artifactId>socket.io-server</artifactId>
            <version>1.7.18</version>
        </dependency>

        <!-- Lombok (optional, để giảm code) -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>

        <!-- JSON Processing -->
        <dependency>
            <groupId>com.google.code.gson</groupId>
            <artifactId>gson</artifactId>
            <version>2.8.9</version>
        </dependency>

        <!-- Database (Optional) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.33</version>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

### 2. **Application Properties (application.properties)**

```properties
server.port=3001
server.servlet.context-path=/

# Logging
logging.level.root=INFO
logging.level.com.chat=DEBUG

# Database (nếu dùng)
spring.datasource.url=jdbc:mysql://localhost:3306/chat_db
spring.datasource.username=root
spring.datasource.password=root
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
```

---

## 📡 Chi Tiết Các Events

### **Từ Frontend Gửi Sang Backend**

| Event | Dữ Liệu | Mô Tả |
|-------|---------|-------|
| `join-room` | `{ room, username }` | Tham gia phòng chat |
| `send-message` | `{ room, username, text, time }` | Gửi tin nhắn |
| `disconnect` | (tự động) | Ngắt kết nối |

### **Backend Gửi Sang Frontend**

| Event | Dữ Liệu | Mô Tả |
|-------|---------|-------|
| `message` | `{ username, text, time }` | Tin nhắn mới (broadcast) |
| `load-messages` | `[{ username, text, time }...]` | Tải tin nhắn cũ |
| `user-joined` | `{ username }` | Thông báo user join |
| `user-left` | `{ username }` | Thông báo user rời |

---

## 💻 Ví Dụ Backend Hoàn Chỉnh

### 1. **Entity - Message.java**

```java
package com.chat.model;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String room;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    @Column(nullable = false)
    private LocalDateTime time;

    // Constructors
    public Message() {}

    public Message(String room, String username, String text) {
        this.room = room;
        this.username = username;
        this.text = text;
        this.time = LocalDateTime.now();
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRoom() { return room; }
    public void setRoom(String room) { this.room = room; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public LocalDateTime getTime() { return time; }
    public void setTime(LocalDateTime time) { this.time = time; }
}
```

### 2. **Repository - MessageRepository.java**

```java
package com.chat.repository;

import com.chat.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByRoomOrderByTimeAsc(String room);
}
```

### 3. **Service - ChatService.java**

```java
package com.chat.service;

import com.chat.model.Message;
import com.chat.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ChatService {
    @Autowired
    private MessageRepository messageRepository;

    // Lưu tin nhắn vào DB
    public Message saveMessage(String room, String username, String text) {
        Message message = new Message(room, username, text);
        return messageRepository.save(message);
    }

    // Lấy tất cả tin nhắn của 1 phòng
    public List<Message> getMessagesByRoom(String room) {
        return messageRepository.findByRoomOrderByTimeAsc(room);
    }

    // Xóa toàn bộ tin nhắn (optional)
    public void deleteAllMessages() {
        messageRepository.deleteAll();
    }
}
```

### 4. **Socket.IO Server - ChatSocketIOServer.java**

```java
package com.chat.config;

import com.chat.service.ChatService;
import com.corundumstudio.socketio.AckRequest;
import com.corundumstudio.socketio.Configuration;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.ConnectListener;
import com.corundumstudio.socketio.listener.DataListener;
import com.corundumstudio.socketio.listener.DisconnectListener;
import com.google.gson.JsonObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import java.util.*;

@Component
public class ChatSocketIOServer {
    private SocketIOServer socketIOServer;
    
    @Autowired
    private ChatService chatService;

    private static final int PORT = 3001;
    private static final String HOST = "0.0.0.0";
    
    // Lưu trữ mapping giữa room và username
    private Map<String, Set<String>> roomUsers = new HashMap<>();
    
    @PostConstruct
    public void init() {
        Configuration config = new Configuration();
        config.setHostname(HOST);
        config.setPort(PORT);
        
        // CORS Configuration
        config.setOrigin("http://localhost:3000");
        config.setMaxFramePayloadLength(1024 * 1024);
        config.setMaxHttpContentLength(1024 * 1024);

        socketIOServer = new SocketIOServer(config);

        // ===== EVENT LISTENERS =====
        
        // Event 1: User kết nối
        socketIOServer.addConnectListener(new ConnectListener() {
            @Override
            public void onConnect(SocketIOClient client) {
                System.out.println("Client connected: " + client.getSessionId());
            }
        });

        // Event 2: User ngắt kết nối
        socketIOServer.addDisconnectListener(new DisconnectListener() {
            @Override
            public void onDisconnect(SocketIOClient client) {
                System.out.println("Client disconnected: " + client.getSessionId());
                
                // Xóa user khỏi tất cả rooms
                for (String room : roomUsers.keySet()) {
                    Set<String> users = roomUsers.get(room);
                    for (String username : new ArrayList<>(users)) {
                        if (client.getAllRooms().contains(room)) {
                            users.remove(username);
                            // Notify others
                            socketIOServer.getRoomOperations(room).sendEvent(
                                "user-left",
                                new JsonObject() {{
                                    addProperty("username", username);
                                }}
                            );
                        }
                    }
                }
            }
        });

        // Event 3: User tham gia room
        socketIOServer.addEventListener("join-room", JsonObject.class, 
            new DataListener<JsonObject>() {
                @Override
                public void onData(SocketIOClient client, JsonObject data, 
                                  AckRequest ackSender) {
                    String room = data.get("room").getAsString();
                    String username = data.get("username").getAsString();

                    // Join room
                    client.joinRoom(room);

                    // Lưu user
                    roomUsers.computeIfAbsent(room, k -> new HashSet<>()).add(username);
                    
                    // Tải tin nhắn cũ
                    socketIOServer.getRoomOperations(room).sendEvent(
                        "load-messages",
                        chatService.getMessagesByRoom(room)
                    );

                    // Notify others
                    socketIOServer.getRoomOperations(room).sendEvent(
                        "user-joined",
                        new JsonObject() {{
                            addProperty("username", username);
                        }}
                    );

                    System.out.println(username + " joined room: " + room);
                }
            }
        );

        // Event 4: User gửi tin nhắn
        socketIOServer.addEventListener("send-message", JsonObject.class,
            new DataListener<JsonObject>() {
                @Override
                public void onData(SocketIOClient client, JsonObject data,
                                  AckRequest ackSender) {
                    String room = data.get("room").getAsString();
                    String username = data.get("username").getAsString();
                    String text = data.get("text").getAsString();

                    // Lưu vào DB
                    chatService.saveMessage(room, username, text);

                    // Broadcast cho tất cả user trong room
                    socketIOServer.getRoomOperations(room).sendEvent(
                        "message",
                        new JsonObject() {{
                            addProperty("username", username);
                            addProperty("text", text);
                            addProperty("time", new Date().getTime());
                        }}
                    );

                    System.out.println("[" + room + "] " + username + ": " + text);
                }
            }
        );

        // Khởi động server
        socketIOServer.start();
        System.out.println("Socket.IO Server started on port " + PORT);
    }

    @PreDestroy
    public void stop() {
        if (socketIOServer != null) {
            socketIOServer.stop();
            System.out.println("Socket.IO Server stopped");
        }
    }

    public SocketIOServer getSocketIOServer() {
        return socketIOServer;
    }
}
```

### 5. **Main Application - ChatApplication.java**

```java
package com.chat;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ChatApplication {
    public static void main(String[] args) {
        SpringApplication.run(ChatApplication.class, args);
    }
}
```

---

## 🚀 Chạy Backend

### Bước 1: Tạo Project Structure
```
chat-server/
├── pom.xml
├── src/
│   ├── main/
│   │   ├── java/com/chat/
│   │   │   ├── ChatApplication.java
│   │   │   ├── config/
│   │   │   │   └── ChatSocketIOServer.java
│   │   │   ├── model/
│   │   │   │   └── Message.java
│   │   │   ├── repository/
│   │   │   │   └── MessageRepository.java
│   │   │   └── service/
│   │   │       └── ChatService.java
│   │   └── resources/
│   │       └── application.properties
```

### Bước 2: Cài Dependencies
```bash
mvn clean install
```

### Bước 3: Chạy Server
```bash
mvn spring-boot:run
```

Backend sẽ chạy trên `http://localhost:3001`

---

## 🧪 Test Connection

### Từ Frontend
1. Mở dashboard: `http://localhost:3000/dashboard`
2. Nhấn button "Vào Chat"
3. Kiểm tra console browser (F12) có thấy "Connected to chat server" không?

### Từ Backend
```bash
# Xem logs
# Phải thấy: "Socket.IO Server started on port 3001"
```

---

## 📚 Các Ngôn Ngữ Backend Khác

### **Node.js (Express + Socket.IO)**
```javascript
const io = require('socket.io')(3001, {
    cors: { origin: "http://localhost:3000" }
});

io.on('connection', (socket) => {
    socket.on('join-room', (data) => {
        socket.join(data.room);
        io.to(data.room).emit('user-joined', data);
    });
});
```

### **Python (Flask + python-socketio)**
```python
from flask import Flask
from flask_socketio import SocketIO, emit, join_room

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

@socketio.on('join-room')
def on_join(data):
    join_room(data['room'])
    emit('user-joined', data, room=data['room'])
```

### **Go (Socket.IO)**
```go
import "github.com/googollee/go-socket.io"

io.OnConnect("/", func(s *server.Socket) error {
    s.OnEvent("/", "join-room", func(data map[string]interface{}) {
        s.Join(data["room"].(string))
    })
    return nil
})
```

---

## ✅ Checklist Triển Khai

- [ ] Backend chạy trên port 3001
- [ ] CORS được cấu hình
- [ ] Events `join-room` và `send-message` lắng nghe
- [ ] Frontend kết nối thành công
- [ ] Tin nhắn được broadcast tới tất cả clients
- [ ] Tin nhắn được lưu vào database
- [ ] User join/leave notifications hoạt động
- [ ] Reconnection tự động khi mất kết nối

---

## 📞 Troubleshooting

| Lỗi | Nguyên Nhân | Giải Pháp |
|-----|-----------|----------|
| CORS Error | Backend chưa cấu hình CORS | Thêm `config.setOrigin("http://localhost:3000")` |
| Connection Timeout | Backend không chạy | Kiểm tra `java -version` & chạy `mvn spring-boot:run` |
| Messages không lưu | Database connection error | Kiểm tra `application.properties` |
| Frontend không kết nối | Port sai | Đảm bảo backend port là 3001 |

--- 

**Bây giờ bạn có tất cả thông tin để xây dựng backend chat realtime bằng Java! 🎉**
