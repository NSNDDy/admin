<template>
    <div class="chat-page">
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
                        <span class="time">{{ formatTime(message.timestamp || message.createdAt) }}</span>
                    </div>
                    <div class="message-content">
                        {{ message.content }}
                    </div>
                </div>
            </div>

            <div class="chat-input-area">
                <div class="input-wrapper">
                    <input v-model="newMessage" @keydown.enter.prevent="sendMessage"
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
        this.messages = [];
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

            // Determine Socket URL
            // Production: $config.socketUrl (set qua env SOCKET_URL trên Render)
            // Local: kết nối trực tiếp tới hostname:3001
            let socketUrl = this.$config.socketUrl || process.env.SOCKET_URL;
            if (!socketUrl) {
                socketUrl = `${window.location.protocol}//${window.location.hostname}:3001`;
            }
            console.log('Connecting to Socket.IO at:', socketUrl);

            // Kết nối tới server Socket.IO
            this.socket = io(socketUrl, {
                transports: ['websocket', 'polling'],
                path: '/socket.io',
                reconnection: true,
                reconnectionAttempts: 10,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                query: { token }
            });

            this.socket.on('connect', () => {
                this.isConnected = true;
                console.log('Connected to chat server');

                // Join Room (cả lần đầu và reconnect)
                this.socket.emit('join_room', {
                    roomId: this.roomId
                });

                this.fetchChatHistory();
            });

            this.socket.on('reconnect', () => {
                console.log('Reconnected - re-joining room');
            });

            this.socket.on('disconnect', (reason) => {
                this.isConnected = false;
                console.log('Disconnected from server:', reason);
            });

            this.socket.on('connect_error', (err) => {
                console.error('Connection Error:', err.message);
                this.isConnected = false;
                if (err.message === "Authentication error") {
                    alert("Phiên đăng nhập hết hạn.");
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('user');
                    this.$router.push('/login');
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
            const value = timestamp || null;
            if (!value) return '';
            return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
                // SỬ DỤNG SERVICE PATTERN (Mới)
                // Không cần lấy token thủ công, không cần set header thủ công
                const res = await this.$api.chat.getHistory(this.roomId);
                
                // Kiểm tra data trả về 
                const historyData = Array.isArray(res) ? res : (res.data || []);
                
                if (historyData.length > 0) {
                    this.messages = historyData;
                    try {
                        localStorage.setItem(`chat_history_${this.roomId}`, JSON.stringify(this.messages));
                    } catch (e) {}
                    this.scrollToBottom();
                }
            } catch (error) {
                console.error("Lỗi tải lịch sử chat:", error);
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
        
    }
}
</script>

