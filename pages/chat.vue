<template>
    <div class="chat-container">
        <div class="chat-wrapper">
            <div class="chat-header">
                <div class="chat-header-title">
                    <h2>Chat Room: {{ roomId }}</h2>
                    <p class="status" :class="{ online: isConnected }">
                        {{ isConnected ? '🟢 Online' : '🔴 Offline' }}
                    </p>
                </div>
                <button @click="goBack" class="btn-back">← Quay lại</button>
            </div>

            <div class="chat-messages" ref="messagesContainer">
                <div v-if="messages.length === 0" class="empty-chat">
                    <p>Không có tin nhắn nào. Bắt đầu cuộc trò chuyện!</p>
                </div>
                <div v-for="(message, index) in messages" :key="index"
                    :class="['message', isMyMessage(message) ? 'own' : 'other']">
                    <div class="message-info">
                        <span class="username">{{ message.sender.username }}</span>
                        <span class="time">{{ formatTime(message.timestamp) }}</span>
                    </div>
                    <div class="message-content">
                        {{ message.content }}
                    </div>
                </div>
            </div>

            <div class="chat-input-area">
                <div class="input-wrapper">
                    <input v-model="newMessage" @keyup.enter="sendMessage" @keydown.enter.prevent="sendMessage"
                        type="text" class="chat-input" placeholder="Nhập tin nhắn..." :disabled="!isConnected">
                    <button @click="sendMessage" class="btn-send" :disabled="!isConnected || !newMessage.trim()">
                        Gửi
                    </button>
                </div>
                <div v-if="!isConnected" class="offline-notice">
                    ⚠️ Đang kết nối tới máy chủ...
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import io from 'socket.io-client'

export default {
    name: 'ChatPage',
    layout: 'default',
    middleware: 'authenticated', // Bắt buộc phải login mới vào được
    data() {
        return {
            socket: null,
            isConnected: false,
            newMessage: '',
            messages: [],
            currentUser: null,
            roomId: 'general',
            isLoadingHistory: false,
            page: 0
        }
    },
    mounted() {
        this.loadUser();
        this.initializeChat();
    },
    beforeDestroy() {
        if (this.socket) {
            this.socket.disconnect();
        }
    },
    methods: {
        loadUser() {
            try {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    this.currentUser = JSON.parse(userStr);
                }
            } catch (e) {
                console.error("Error parsing user data", e);
            }
        },
        initializeChat() {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                this.$router.push('/login');
                return;
            }

            // Kết nối tới server Socket.IO (Port 3001)
            // Cập nhật theo hướng dẫn Backend: dùng query param 'token'
            this.socket = io('http://localhost:3001', {
                reconnection: true,
                query: {
                    token: `Bearer ${token}`
                }
            });

            this.socket.on('connect', () => {
                this.isConnected = true;
                console.log('Connected to chat server');

                // Join Room
                this.socket.emit('join_room', {
                    roomId: this.roomId
                });

                this.fetchChatHistory();
            });

            this.socket.on('disconnect', () => {
                this.isConnected = false;
                console.log('Disconnected from server');
            });

            this.socket.on('connect_error', (err) => {
                console.error('Connection Error:', err.message);
                this.isConnected = false;
                if (err.message === "Authentication error") {
                    alert("Phiên đăng nhập hết hạn.");
                    this.logout();
                }
            });

            // Nhận tin nhắn từ Server (bao gồm cả tin mình vừa gửi)
            this.socket.on('receive_message', (message) => {
                this.messages.push(message);
                this.scrollToBottom();
                try {
                    localStorage.setItem(`chat_history_${this.roomId}`, JSON.stringify(this.messages));
                } catch (e) {}
            });

            // Nhận thông báo lỗi từ Server
            this.socket.on('error', (error) => {
                alert('Chat Error: ' + error.message);
            });
        },
        sendMessage() {
            if (!this.newMessage.trim() || !this.isConnected) return;

            // Gửi tin nhắn lên Server
            // Lưu ý: Không push vào messages ngay, mà chờ 'receive_message' từ server
            // để đảm bảo đồng bộ dữ liệu và confirm tin nhắn đã gửi thành công.
            this.socket.emit('send_message', {
                roomId: this.roomId,
                content: this.newMessage,
                type: 'TEXT'
            });

            this.newMessage = '';
        },
        isMyMessage(message) {
            return this.currentUser && message.sender.id === this.currentUser.id;
        },
        formatTime(timestamp) {
            if (!timestamp) return '';
            return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        },
        scrollToBottom() {
            this.$nextTick(() => {
                const container = this.$refs.messagesContainer;
                if (container) {
                    container.scrollTop = container.scrollHeight;
                }
            });
        },
        goBack() {
            this.$router.push('/dashboard')
        },

        async joinRoom() {
            if (!this.username || !this.roomId) return;
            
        }
        ,
        async fetchChatHistory() {
            this.isLoadingHistory = true;
            try {
                const token = localStorage.getItem('accessToken');
                // Gọi API lấy lịch sử thông qua Proxy của Nuxt (để tránh lỗi CORS)
                // Nuxt sẽ tự động chuyển tiếp request này sang http://localhost:8080/api/history
                const res = await this.$axios.$get('/api/history', {
                    params: { 
                        rommId: this.roomId 
                    },
                    headers: { 
                        'accessToken': token,
                        'rommId': this.roomId 
                    }
                });

                // Kiểm tra data trả về (Backend trả về mảng trực tiếp hoặc object chứa data)
                const historyData = Array.isArray(res) ? res : (res.data || []);
                
                if (historyData.length > 0) {
                    this.messages = historyData.reverse();
                    try {
                        localStorage.setItem(`chat_history_${this.roomId}`, JSON.stringify(this.messages));
                    } catch (e) {}
                    this.scrollToBottom();
                }
            } catch (error) {
                console.error("Lỗi tải lịch sử chat:", error);
                // Fallback: Lấy từ LocalStorage nếu lỗi
                try {
                    const cached = localStorage.getItem(`chat_history_${this.roomId}`);
                    if (cached) {
                        this.messages = JSON.parse(cached);
                        this.scrollToBottom();
                    }
                } catch (e) {}
            } finally {
                this.isLoadingHistory = false;
            }
        }
        // logout() {
        //     localStorage.removeItem('accessToken');
        //     localStorage.removeItem('user');
        //     if (this.socket) this.socket.disconnect();
        //     this.$router.push('/login');
        // }
    }
}
</script>

<style scoped>
.chat-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 1rem;
}

.chat-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 600px;
    height: 80vh;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    overflow: hidden;
}

.chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.chat-header-title {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.chat-header-title h2 {
    margin: 0;
    font-size: 1.5rem;
}

.status {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 500;
}

.status.online {
    color: #4ade80;
}

.btn-back {
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.4);
    color: white;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
}

.btn-back:hover {
    background: rgba(255, 255, 255, 0.3);
}

.chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    background: #f8f9fa;
}

.empty-chat {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #999;
}

.message {
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
    animation: slideIn 0.3s ease;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.message.own {
    align-items: flex-end;
}

.message.other {
    align-items: flex-start;
}

.message-info {
    display: flex;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: #999;
    margin-bottom: 0.25rem;
}

.message-content {
    max-width: 70%;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    word-wrap: break-word;
    line-height: 1.4;
}

.message.own .message-content {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-bottom-right-radius: 2px;
}

.message.other .message-content {
    background: white;
    color: #333;
    border: 1px solid #e0e0e0;
    border-bottom-left-radius: 2px;
}

.chat-input-area {
    padding: 1rem;
    background: white;
    border-top: 1px solid #e0e0e0;
}

.input-wrapper {
    display: flex;
    gap: 0.5rem;
}

.chat-input {
    flex: 1;
    padding: 0.75rem 1rem;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
}

.chat-input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.chat-input:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
}

.btn-send {
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-send:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-send:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.offline-notice {
    margin-top: 0.5rem;
    padding: 0.5rem;
    background: #fee;
    color: #c33;
    border-radius: 4px;
    font-size: 0.9rem;
    text-align: center;
}

@media (max-width: 600px) {
    .chat-wrapper {
        height: 100vh;
        border-radius: 0;
    }

    .message-content {
        max-width: 85%;
    }
}
</style>
